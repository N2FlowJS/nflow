import { ExecutionResult, FlowExecutionContext } from '../../../../models/flowExecutionTypes';
import { TwitterNodeData, FlowNode } from '../../../../models/flowTypes';
import { findNextNodes } from '../../../../utils/server/findNextNode';
import { getInputFromTemplate, processTemplate } from '../../templateProcessor';
import { isNodeReady } from '../../isNodeReady';
import { FlowStateDispatcher } from '../flowStateDispatcher';

/**
 * Handler for executing Twitter nodes
 */
export async function executeTwitterNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as TwitterNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from relevant fields
  const inputs: string[] = [
    ...getInputFromTemplate(form.tweetText || ''),
    ...getInputFromTemplate(form.query || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for Twitter operation',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'twitter',
        role: 'developer',
      },
      execution: {
        output: 'Waiting for input variables',
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
      },
    };
  }

  // Prepare variables for template processing
  const vars: Record<string, string> = {};
  inputs.forEach((key) => {
    if (flowState.components[key] !== undefined) {
      vars[key] = flowState.components[key].output || '';
    }
  });

  try {
    // Validate required API credentials
    if (!form.apiKey || !form.apiSecret || !form.accessToken || !form.accessTokenSecret) {
      throw new Error('Twitter API credentials are required');
    }

    console.log(`Executing Twitter node: ${node.id} with action: ${form.action}`);

    let result: any;

    switch (form.action) {
      case 'create_tweet':
        if (!form.tweetText) {
          throw new Error('Tweet text is required for creating tweets');
        }
        const processedTweet = processTemplate(form.tweetText, vars);
        result = await createTweet(form, processedTweet);
        break;

      case 'get_tweets':
        result = await getTweets(form);
        break;

      case 'get_user_info':
        if (!form.username) {
          throw new Error('Username is required for getting user info');
        }
        result = await getUserInfo(form, form.username);
        break;

      case 'follow_user':
        if (!form.userId) {
          throw new Error('User ID is required for following users');
        }
        result = await followUser(form, form.userId);
        break;

      case 'like_tweet':
        if (!form.tweetId) {
          throw new Error('Tweet ID is required for liking tweets');
        }
        result = await likeTweet(form, form.tweetId);
        break;

      case 'retweet':
        if (!form.tweetId) {
          throw new Error('Tweet ID is required for retweeting');
        }
        result = await retweet(form, form.tweetId);
        break;

      case 'get_mentions':
        result = await getMentions(form);
        break;

      default:
        throw new Error(`Unsupported Twitter action: ${form.action}`);
    }

    const resultText = JSON.stringify(result, null, 2);
    
    console.log(`Twitter node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'twitter');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'twitter';
      flowState.components[node.id]['executionTime'] = Date.now();
      flowState.currentNode = node;
      finalState = flowState;
    }

    const nextNodes = findNextNodes(flow, node.id);

    if (nextNodes.length === 0) {
      throw new Error(`At the Node ${node.data.label} no next node found in the flow`);
    }

    return {
      status: 'in_progress',
      nextNodes,
      flowState: finalState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'twitter',
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: resultText,
      },
    };
  } catch (error: unknown) {
    console.error('Twitter execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown Twitter error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Twitter operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'twitter',
        role: 'developer',
      },
      execution: {
        output: `Error: ${errorMessage}`,
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
      },
    };
  }
}

// Helper functions for Twitter API operations
async function createTweet(credentials: any, tweetText: string) {
  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${credentials.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: tweetText
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Twitter API error (${response.status}): ${errorData}`);
  }

  return await response.json();
}

async function getTweets(form: any) {
  const url = new URL('https://api.twitter.com/2/users/by/username/' + form.username);
  
  const userResponse = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${form.accessToken}`,
    },
  });

  if (!userResponse.ok) {
    throw new Error(`Failed to get user: ${userResponse.status}`);
  }

  const userData = await userResponse.json();
  const userId = userData.data.id;

  const tweetsUrl = new URL(`https://api.twitter.com/2/users/${userId}/tweets`);
  tweetsUrl.searchParams.append('max_results', String(form.maxResults || 10));
  tweetsUrl.searchParams.append('tweet.fields', 'created_at,public_metrics');

  const tweetsResponse = await fetch(tweetsUrl.toString(), {
    headers: {
      'Authorization': `Bearer ${form.accessToken}`,
    },
  });

  if (!tweetsResponse.ok) {
    throw new Error(`Failed to get tweets: ${tweetsResponse.status}`);
  }

  return await tweetsResponse.json();
}

async function getUserInfo(form: any, username: string) {
  const url = new URL('https://api.twitter.com/2/users/by/username/' + username);
  url.searchParams.append('user.fields', 'public_metrics,description,verified');

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${form.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get user info: ${response.status}`);
  }

  return await response.json();
}

async function followUser(form: any, userId: string) {
  // This requires OAuth 1.0a authentication with user context
  const response = await fetch('https://api.twitter.com/2/users/' + form.authenticatedUserId + '/following', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${form.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      target_user_id: userId
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to follow user: ${response.status}`);
  }

  return await response.json();
}

async function likeTweet(form: any, tweetId: string) {
  const response = await fetch('https://api.twitter.com/2/users/' + form.authenticatedUserId + '/likes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${form.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tweet_id: tweetId
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to like tweet: ${response.status}`);
  }

  return await response.json();
}

async function retweet(form: any, tweetId: string) {
  const response = await fetch('https://api.twitter.com/2/users/' + form.authenticatedUserId + '/retweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${form.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tweet_id: tweetId
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to retweet: ${response.status}`);
  }

  return await response.json();
}

async function getMentions(form: any) {
  const url = new URL('https://api.twitter.com/2/users/' + form.authenticatedUserId + '/mentions');
  url.searchParams.append('max_results', String(form.maxResults || 10));
  url.searchParams.append('tweet.fields', 'created_at,author_id,public_metrics');

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${form.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get mentions: ${response.status}`);
  }

  return await response.json();
}
