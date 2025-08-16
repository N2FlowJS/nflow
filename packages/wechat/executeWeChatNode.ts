import { WeChatNodeData, FlowNode } from '../../models/flowTypes';
import { getInputFromTemplate, processTemplate } from '../@template-processor/templateProcessor';
import { findNextNodes, isNodeReady, FlowStateDispatcher, ExecutionResult, FlowExecutionContext } from '@n2flowjs/flow';

/**
 * Handler for executing WeChat nodes
 */
export async function executeWeChatNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as WeChatNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from relevant fields based on action
  const inputs: string[] = [
    ...getInputFromTemplate(form.message || ''),
    ...getInputFromTemplate(form.openId || ''),
    ...getInputFromTemplate(form.templateId || ''),
    ...getInputFromTemplate(form.menuData || ''),
    ...getInputFromTemplate(form.scene || ''),
  ];

  const ready = isNodeReady(inputs, flowState);

  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for WeChat operation',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'wechat',
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
    // Validate required fields
    if (!form.appId || !form.appSecret) {
      throw new Error('WeChat App ID and App Secret are required');
    }

    console.log(`Executing WeChat node: ${node.id} with action: ${form.action}`);

    let result: any;

    // Get access token if not provided
    let accessToken = form.accessToken;
    if (!accessToken) {
      accessToken = await getWeChatAccessToken(form.appId, form.appSecret);
    }

    switch (form.action) {
      case 'send_message':
        if (!form.openId || !form.message) {
          throw new Error('OpenID and message content are required for sending messages');
        }

        const processedMessage = processTemplate(form.message, vars);
        const processedOpenId = processTemplate(form.openId, vars);
        result = await sendWeChatMessage(accessToken, processedOpenId, processedMessage);
        break;

      case 'send_template':
        if (!form.openId || !form.templateId) {
          throw new Error('OpenID and template ID are required for sending template messages');
        }

        const processedTemplateOpenId = processTemplate(form.openId, vars);
        const processedTemplateId = processTemplate(form.templateId, vars);
        result = await sendWeChatTemplateMessage(accessToken, processedTemplateOpenId, processedTemplateId);
        break;

      case 'get_user_info':
        if (!form.openId) {
          throw new Error('OpenID is required for getting user info');
        }

        const userOpenId = processTemplate(form.openId, vars);
        result = await getWeChatUserInfo(accessToken, userOpenId);
        break;

      case 'create_menu':
        if (!form.menuData) {
          throw new Error('Menu data is required for creating menu');
        }

        const processedMenuData = processTemplate(form.menuData, vars);
        result = await createWeChatMenu(accessToken, processedMenuData);
        break;

      case 'get_qr_code':
        const processedScene = form.scene ? processTemplate(form.scene, vars) : 'default';
        result = await getWeChatQRCode(accessToken, processedScene);
        break;

      case 'send_mini_program':
        if (!form.openId || !form.miniProgramAppId) {
          throw new Error('OpenID and Mini Program App ID are required');
        }

        const miniOpenId = processTemplate(form.openId, vars);
        const miniAppId = processTemplate(form.miniProgramAppId, vars);
        const miniPath = form.miniProgramPath ? processTemplate(form.miniProgramPath, vars) : '';
        result = await sendWeChatMiniProgram(accessToken, miniOpenId, miniAppId, miniPath);
        break;

      default:
        throw new Error(`Unsupported WeChat action: ${form.action}`);
    }

    const resultText = JSON.stringify(result, null, 2);

    console.log(`WeChat node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'wechat');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'wechat';
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
        type: 'wechat',
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
    console.error('WeChat execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown WeChat error';

    return {
      nextNodes: [],
      status: 'error',
      message: `WeChat operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'wechat',
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

// Helper functions for WeChat API operations
async function getWeChatAccessToken(appId: string, appSecret: string): Promise<string> {
  const response = await fetch(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`
  );

  if (!response.ok) {
    throw new Error(`WeChat API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.errcode) {
    throw new Error(`WeChat API error: ${data.errcode} - ${data.errmsg}`);
  }

  return data.access_token;
}

async function sendWeChatMessage(accessToken: string, openId: string, message: string) {
  const response = await fetch(`https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${accessToken}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      touser: openId,
      msgtype: 'text',
      text: {
        content: message,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`WeChat API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.errcode && data.errcode !== 0) {
    throw new Error(`WeChat API error: ${data.errcode} - ${data.errmsg}`);
  }

  return data;
}

async function sendWeChatTemplateMessage(accessToken: string, openId: string, templateId: string) {
  const response = await fetch(`https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${accessToken}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      touser: openId,
      template_id: templateId,
      data: {
        // Template data would be customized based on template
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`WeChat API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.errcode && data.errcode !== 0) {
    throw new Error(`WeChat API error: ${data.errcode} - ${data.errmsg}`);
  }

  return data;
}

async function getWeChatUserInfo(accessToken: string, openId: string) {
  const response = await fetch(
    `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${accessToken}&openid=${openId}&lang=zh_CN`
  );

  if (!response.ok) {
    throw new Error(`WeChat API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.errcode) {
    throw new Error(`WeChat API error: ${data.errcode} - ${data.errmsg}`);
  }

  return data;
}

async function createWeChatMenu(accessToken: string, menuData: string) {
  const response = await fetch(`https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${accessToken}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: menuData,
  });

  if (!response.ok) {
    throw new Error(`WeChat API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.errcode && data.errcode !== 0) {
    throw new Error(`WeChat API error: ${data.errcode} - ${data.errmsg}`);
  }

  return data;
}

async function getWeChatQRCode(accessToken: string, scene: string) {
  const response = await fetch(`https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=${accessToken}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action_name: 'QR_LIMIT_STR_SCENE',
      action_info: {
        scene: {
          scene_str: scene,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`WeChat API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.errcode) {
    throw new Error(`WeChat API error: ${data.errcode} - ${data.errmsg}`);
  }

  return data;
}

async function sendWeChatMiniProgram(accessToken: string, openId: string, appId: string, pagePath: string) {
  const response = await fetch(`https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${accessToken}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      touser: openId,
      msgtype: 'miniprogrampage',
      miniprogrampage: {
        appid: appId,
        pagepath: pagePath,
        title: 'Mini Program',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`WeChat API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.errcode && data.errcode !== 0) {
    throw new Error(`WeChat API error: ${data.errcode} - ${data.errmsg}`);
  }

  return data;
}
