import { ExecutionResult, FlowExecutionContext } from '../../../../models/flowExecutionTypes';
import { FlowNode, NativeKeywordsNodeData } from '../../../../models/flowTypes';
import { findNextNodes } from '../../findNextNode';
import { getInputFromTemplate, processTemplate } from '../../templateProcessor';
import { isNodeReady } from '../../isNodeReady';
import { FlowStateDispatcher } from '../flowStateDispatcher';

const EN_STOP = new Set([
  'the','a','an','and','or','but','if','then','else','when','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','can','will','just','don','should','now'
]);
const VI_STOP = new Set([
  'và','của','là','các','những','một','có','cho','với','từ','trên','dưới','trong','ngoài','lúc','khi','nếu','thì','nhưng','đã','sẽ','đang','này','kia','đó','vì','do','nên','hay','hoặc','rằng','được','bị','để','không','rất','rằng'
]);

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^\p{L}\p{N}\s]/gu, ' ') // remove punctuation
    .replace(/\s+/g, ' ') // collapse spaces
    .trim();
}

function tokenize(text: string) {
  return text.split(' ').filter(Boolean);
}

function selectStopwords(lang: 'en' | 'vi' | 'auto', sample: string) {
  if (lang === 'en') return EN_STOP;
  if (lang === 'vi') return VI_STOP;
  // naive auto detect: presence of Vietnamese diacritics in sample (before normalize)
  const hasVi = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(sample);
  return hasVi ? VI_STOP : EN_STOP;
}

function extractKeywords(text: string, opts: { maxResults?: number; minLength?: number; removeDigits?: boolean; stop: Set<string> }) {
  const tokens = tokenize(normalize(text));
  const minLen = opts.minLength ?? 3;
  const counts = new Map<string, number>();
  for (const t of tokens) {
    if (t.length < minLen) continue;
    if (opts.removeDigits && /^\d+$/.test(t)) continue;
    if (opts.stop.has(t)) continue;
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top = (opts.maxResults ? sorted.slice(0, opts.maxResults) : sorted).map(([k]) => k);
  return top;
}

export async function executeNativeKeywordsNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as NativeKeywordsNodeData;
  const form = data.form || {} as NativeKeywordsNodeData['form'];
  const startTime = new Date().toISOString();

  const inputs: string[] = getInputFromTemplate(form.text || '');
  const ready = isNodeReady(inputs, flowState);
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for Native keywords extraction',
      flowState,
      nodeInfo: { id: node.id, name: node.data?.label || node.id, type: 'nativekeywords', role: 'developer' },
      execution: { output: 'Waiting for input variables', nodeId: node.id, nodeName: node.data?.label || node.id, startTime },
    };
  }

  const vars: Record<string, string> = {};
  inputs.forEach((key) => {
    if (flowState.components[key] !== undefined) {
      vars[key] = (flowState.components[key].output as string) || '';
    }
  });

  try {
    const raw = processTemplate(form.text || '', vars);
    const stop = selectStopwords((form.language as any) || 'auto', raw);
    const kws = extractKeywords(raw, {
      maxResults: form.maxResults ?? 10,
      minLength: form.minLength ?? 3,
      removeDigits: !!form.removeDigits,
      stop,
    });

    const output = JSON.stringify(kws);

    let finalState = flowState;
    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, output, 'nativekeywords');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      flowState.components[node.id]['output'] = output;
      flowState.components[node.id]['type'] = 'nativekeywords';
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
      nodeInfo: { id: node.id, name: node.data?.label || node.id, type: 'nativekeywords', role: 'developer' },
      execution: { nodeId: node.id, nodeName: node.data?.form?.name || node.id, startTime, endTime: new Date().toISOString(), output },
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return {
      nextNodes: [],
      status: 'error',
      message: `Native keywords extraction failed: ${msg}`,
      flowState,
      nodeInfo: { id: node.id, name: node.data?.label || node.id, type: 'nativekeywords', role: 'developer' },
      execution: { output: `Error: ${msg}`, nodeId: node.id, nodeName: node.data?.label || node.id, startTime, endTime: new Date().toISOString() },
    };
  }
}
