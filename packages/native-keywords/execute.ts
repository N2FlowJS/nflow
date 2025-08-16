import { FlowNode, NativeKeywordsNodeData } from '../../models/flowTypes';
import { getInputFromTemplate, processTemplate } from '../@template-processor/templateProcessor';
import { findNextNodes, isNodeReady, FlowStateDispatcher, ExecutionResult, FlowExecutionContext } from '@n2flowjs/flow';

// Base stopword lists per language (concise but effective)
const STOPWORDS_RAW: Record<string, string[]> = {
  en: ['the','a','an','and','or','but','if','then','else','when','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','once','here','there','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','can','will','just','should','now'],
  vi: ['và','của','là','các','những','một','có','cho','với','từ','trên','dưới','trong','ngoài','lúc','khi','nếu','thì','nhưng','đã','sẽ','đang','này','kia','đó','vì','do','nên','hay','hoặc','rằng','được','bị','để','không','rất'],
  es: ['el','la','los','las','un','una','unos','unas','y','o','pero','si','entonces','cuando','en','por','con','sobre','entre','hasta','antes','después','más','menos','muy','no','ni','solo','mismo','también','ya','a','de','que','se','del','al'],
  fr: ['le','la','les','un','une','des','et','ou','mais','si','alors','quand','en','par','avec','sur','entre','avant','après','plus','moins','très','ne','pas','seulement','même','aussi','déjà','à','de','que','qui','du','au'],
  de: ['der','die','das','ein','eine','und','oder','aber','wenn','dann','wann','in','an','bei','mit','über','zwischen','vor','nach','mehr','weniger','sehr','nicht','nur','gleich','auch','schon','zu','von','dass'],
  pt: ['o','a','os','as','um','uma','uns','umas','e','ou','mas','se','então','quando','em','por','com','sobre','entre','antes','depois','mais','menos','muito','não','nem','apenas','mesmo','também','já','a','de','que','do','da','dos','das'],
  it: ['il','lo','la','i','gli','le','un','una','e','o','ma','se','allora','quando','in','per','con','su','tra','prima','dopo','più','meno','molto','non','né','solo','stesso','anche','già','a','di','che','del','della'],
  nl: ['de','het','een','en','of','maar','als','dan','wanneer','in','op','bij','voor','met','over','tussen','voor','na','meer','minder','zeer','niet','alleen','zelfde','ook','al','te','van','dat','die'],
  id: ['dan','atau','tetapi','jika','maka','ketika','di','ke','dari','dengan','tentang','antara','sebelum','sesudah','lebih','kurang','sangat','tidak','hanya','sama','juga','sudah','yang','ini','itu'],
  tr: ['ve','veya','ama','eğer','o zaman','ne zaman','için','ile','hakkında','arasında','önce','sonra','daha','az','çok','değil','sadece','ayni','ayrıca','zaten','bu','şu','o'],
  ru: ['и','или','но','если','то','когда','в','на','с','о','об','между','до','после','больше','меньше','очень','не','только','также','уже','это','этот','эта','эти','а','по','из','для'],
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^\p{L}\p{N}\s]/gu, ' ') // remove punctuation
    .replace(/\s+/g, ' ') // collapse spaces
    .trim();
}

// Precompute normalized stopwords for extraction
const STOPWORDS_NORM: Record<string, Set<string>> = Object.fromEntries(
  Object.entries(STOPWORDS_RAW).map(([lang, words]) => [lang, new Set(words.map(w => normalize(w)))])
);

function tokenize(text: string) {
  return text.split(' ').filter(Boolean);
}

// Script/diacritic hints to quickly detect language families
const SCRIPT_HINTS: Array<{ re: RegExp; lang: string }> = [
  { re: /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i, lang: 'vi' }, // Vietnamese diacritics
  { re: /[а-яё]/i, lang: 'ru' }, // Cyrillic (Russian)
  { re: /[ğüşöçıİĞÜŞÖÇ]/, lang: 'tr' }, // Turkish-specific chars
];

function detectLanguage(sampleRaw: string): string {
  // Quick script-based hints on raw text
  for (const { re, lang } of SCRIPT_HINTS) {
    if (re.test(sampleRaw)) return lang;
  }
  // Fallback to stopword scoring on normalized tokens
  const tokens = tokenize(normalize(sampleRaw));
  const scores: Record<string, number> = {};
  for (const [lang, stopset] of Object.entries(STOPWORDS_NORM)) {
    let score = 0;
    for (const t of tokens) if (stopset.has(t)) score++;
    scores[lang] = score;
  }
  let bestLang = 'en';
  let bestScore = -1;
  for (const [lang, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestLang = lang;
    }
  }
  // If there are almost no stopword matches, default to English
  if (bestScore <= 1) return 'en';
  return bestLang;
}

function buildStopSet(lang: string, extra?: string[]) {
  const base = STOPWORDS_NORM[lang] || STOPWORDS_NORM['en'];
  if (!extra || extra.length === 0) return base;
  const merged = new Set(base);
  for (const w of extra) merged.add(normalize(w));
  return merged;
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
  const form = (data.form || {}) as NativeKeywordsNodeData['form'];
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
    // Always auto-detect language from content
    const lang = detectLanguage(raw);
    const stop = buildStopSet(lang, form.extraStopwords);
    const kws = extractKeywords(raw, {
      maxResults: form.maxResults ?? 10,
      minLength: form.minLength ?? 3,
      removeDigits: !!form.removeDigits,
      stop,
    });

    const output = JSON.stringify({ language: lang, keywords: kws });

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
