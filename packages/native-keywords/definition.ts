import { NodeCategory, NodeDefinition, NodeExecutionContext, NodeExecutionResult } from '../@node-plugin/type';
import { PortType } from '../@flow/ports/types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';

// Base stopword lists per language
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

// Script/diacritic hints for language detection
const SCRIPT_HINTS: Array<{ re: RegExp; lang: string }> = [
  { re: /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i, lang: 'vi' },
  { re: /[а-яё]/i, lang: 'ru' },
  { re: /[ğüşöçıİĞÜŞÖÇ]/, lang: 'tr' },
];

export const NativeKeywordsNode: NodeDefinition = {
  id: 'native-keywords',
  name: 'Keywords (Native)',
  category: NodeCategory.PROCESSING,
  description: 'Extracts keywords from text using native algorithms (no AI required). Supports multiple languages with auto-detection.',
  version: '1.0.0',

  inputs: [
    {
      id: 'text',
      name: 'Text',
      type: PortType.TEXT,
      description: 'Text to extract keywords from. Use {variables} for dynamic content.',
      required: true,
      metadata: {
        inputType: 'textarea',
        rows: 6,
      },
    },
    {
      id: 'language',
      name: 'Language',
      type: PortType.TEXT,
      description: 'Language for keyword extraction. Auto-detects if not specified.',
      defaultValue: 'auto',
      required: false,
      metadata: {
        inputType: 'select',
        options: ['auto', 'en', 'vi', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'id', 'tr', 'ru'],
      },
    },
    {
      id: 'maxResults',
      name: 'Max Keywords',
      type: PortType.NUMBER,
      description: 'Maximum number of keywords to extract',
      defaultValue: 10,
      required: false,
      metadata: {
        inputType: 'number',
        min: 1,
        max: 100,
      },
    },
    {
      id: 'minLength',
      name: 'Min Word Length',
      type: PortType.NUMBER,
      description: 'Minimum length of keywords to extract',
      defaultValue: 3,
      required: false,
      metadata: {
        inputType: 'number',
        min: 1,
        max: 20,
      },
    },
    {
      id: 'removeDigits',
      name: 'Remove Digits',
      type: PortType.BOOLEAN,
      description: 'Remove words that contain only digits',
      defaultValue: true,
      required: false,
      metadata: {
        inputType: 'checkbox',
      },
    },
    {
      id: 'extraStopwords',
      name: 'Extra Stopwords',
      type: PortType.TEXT,
      description: 'Additional stopwords to filter out (comma-separated)',
      defaultValue: '',
      required: false,
      metadata: {
        inputType: 'text',
        placeholder: 'word1, word2, word3',
      },
    },
  ],

  outputs: [
    {
      id: 'result',
      name: 'result',
      type: PortType.JSON,
      description: 'Result with detected language and keywords',
    },
    {
      id: 'keywords',
      name: 'keywords',
      type: PortType.ARRAY,
      description: 'Array of extracted keywords',
    },
    {
      id: 'language',
      name: 'language',
      type: PortType.TEXT,
      description: 'Detected language code',
    },
  ],

  getDynamicInputs: (config: any) => {
    const variableNames: string[] = [];
    if (config.text) {
      variableNames.push(...getInputFromTemplate(config.text));
    }
    return variableNames.map((varName: string) => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      description: `Template variable: {${varName}}`,
      required: false,
      metadata: {
        isDynamic: true,
        sourceTemplate: `{${varName}}`,
      },
    }));
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs } = context;
    const { text: textTemplate, maxResults, minLength, removeDigits, extraStopwords } = config;

    // Check if template variables are ready
    const templateVars = getInputFromTemplate(textTemplate || '');
    for (const varName of templateVars) {
      if (!inputs[varName]) {
        return {
          outputs: {},
          status: 'success',
          metadata: {
            waitingFor: templateVars,
          },
        };
      }
    }

    try {
      // Process template
      const vars: Record<string, string> = {};
      templateVars.forEach((key) => {
        vars[key] = String(inputs[key] || '');
      });

      const rawText = processTemplate(textTemplate || '', vars);

      if (!rawText) {
        throw new Error('No text provided for keyword extraction');
      }

      // Auto-detect language
      const detectedLang = detectLanguage(rawText);

      // Build stopword set
      const stopSet = buildStopSet(detectedLang, extraStopwords);

      // Extract keywords
      const keywords = extractKeywords(rawText, {
        maxResults: maxResults ?? 10,
        minLength: minLength ?? 3,
        removeDigits: !!removeDigits,
        stop: stopSet,
      });

      const result = {
        language: detectedLang,
        keywords,
      };

      return {
        outputs: {
          result,
          keywords,
          language: detectedLang,
        },
        status: 'success',
        metadata: {
          detectedLanguage: detectedLang,
          keywordCount: keywords.length,
          maxResults: maxResults ?? 10,
          minLength: minLength ?? 3,
        },
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        outputs: {
          result: { language: 'unknown', keywords: [] },
          keywords: [],
          language: 'unknown',
        },
        status: 'error',
        error: `Native keyword extraction failed: ${errorMessage}`,
      };
    }
  },
};

// Helper functions
function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^\p{L}\p{N}\s]/gu, ' ') // remove punctuation
    .replace(/\s+/g, ' ') // collapse spaces
    .trim();
}

const STOPWORDS_NORM: Record<string, Set<string>> = Object.fromEntries(
  Object.entries(STOPWORDS_RAW).map(([lang, words]) => [lang, new Set(words.map((w) => normalize(w)))])
);

function tokenize(text: string) {
  return text.split(' ').filter(Boolean);
}

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

function extractKeywords(
  text: string,
  opts: { maxResults?: number; minLength?: number; removeDigits?: boolean; stop: Set<string> }
) {
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
