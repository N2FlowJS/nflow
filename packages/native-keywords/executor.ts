/**
 * Native Keywords Executor - Refactored using BaseNodeExecutor
 * Extracts keywords from text using native algorithms (no AI required)
 * Supports multiple languages with auto-detection
 */

import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';

export interface NativeKeywordsForm {
  text: string;
  language?: string;
  maxResults?: number;
  minLength?: number;
  removeDigits?: boolean;
  extraStopwords?: string;
}

// Base stopword lists per language
const STOPWORDS_RAW: Record<string, string[]> = {
  en: ['the','a','an','and','or','but','if','then','else','when','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','once','here','there','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','can','will','just','should','now'],
  vi: ['và','của','là','các','những','một','có','cho','với','từ','trên','dưới','trong','ngoài','lúc','khi','nếu','thì','nhưng','đã','sẽ','đang','này','kia','đó','vì','do','nên','hay','hoặc','rằng','được','bị','để','không','rất'],
  es: ['el','la','los','las','un','una','unos','unas','y','o','pero','si','entonces','cuando','en','por','con','sobre','entre','hasta','antes','después','más','menos','muy','no','ni','solo','mismo','también','ya','a','de','que','se','del','al'],
  fr: ['le','la','les','un','une','des','et','ou','mais','si','alors','quand','en','par','avec','sur','entre','avant','après','plus','moins','très','ne','pas','seulement','même','aussi','déjà','à','de','que','qui','du','au'],
  de: ['der','die','das','ein','eine','und','oder','aber','wenn','dann','wann','in','an','bei','mit','über','zwischen','vor','nach','mehr','weniger','sehr','nicht','nur','gleich','auch','schon','zu','von','dass'],
  pt: ['o','a','os','as','um','uma','uns','umas','e','ou','mas','se','então','quando','em','por','com','sobre','entre','antes','depois','mais','menos','muito','não','nem','apenas','mesmo','también','já','a','de','que','do','da','dos','das'],
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

/**
 * Native Keywords Executor
 */
export class NativeKeywordsExecutor extends BaseNodeExecutor<NativeKeywordsForm> {
  constructor() {
    super({
      nodeType: 'native-keywords',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['text'],
    });
  }

  /**
   * Execute keyword extraction logic
   */
  protected async executeLogic(form: NativeKeywordsForm, context: ExecutionContext): Promise<string> {
    const processedText = this.processTemplate(form.text, context);

    if (!processedText) {
      throw new Error('No text provided for keyword extraction');
    }

    // Auto-detect language if not specified
    const detectedLang = form.language && form.language !== 'auto'
      ? form.language
      : this.detectLanguage(processedText);

    // Build stopword set
    const extraStopwords = form.extraStopwords
      ? form.extraStopwords.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    const stopSet = this.buildStopSet(detectedLang, extraStopwords);

    // Extract keywords
    const keywords = this.extractKeywords(processedText, {
      maxResults: form.maxResults ?? 10,
      minLength: form.minLength ?? 3,
      removeDigits: form.removeDigits ?? true,
      stop: stopSet,
    });

    const result = {
      language: detectedLang,
      keywords,
    };

    return JSON.stringify(result, null, 2);
  }

  /**
   * Normalize text for processing
   */
  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // strip accents
      .replace(/[^\p{L}\p{N}\s]/gu, ' ') // remove punctuation
      .replace(/\s+/g, ' ') // collapse spaces
      .trim();
  }

  /**
   * Tokenize text into words
   */
  private tokenize(text: string): string[] {
    return text.split(' ').filter(Boolean);
  }

  /**
   * Detect language from text sample
   */
  private detectLanguage(sampleRaw: string): string {
    // Quick script-based hints on raw text
    for (const { re, lang } of SCRIPT_HINTS) {
      if (re.test(sampleRaw)) return lang;
    }

    // Fallback to stopword scoring on normalized tokens
    const tokens = this.tokenize(this.normalize(sampleRaw));
    const scores: Record<string, number> = {};

    const stopwordsNorm = Object.fromEntries(
      Object.entries(STOPWORDS_RAW).map(([lang, words]) => [
        lang,
        new Set(words.map((w) => this.normalize(w)))
      ])
    );

    for (const [lang, stopset] of Object.entries(stopwordsNorm)) {
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

  /**
   * Build stopword set for given language
   */
  private buildStopSet(lang: string, extra?: string[]): Set<string> {
    const stopwordsNorm = Object.fromEntries(
      Object.entries(STOPWORDS_RAW).map(([lang, words]) => [
        lang,
        new Set(words.map((w) => this.normalize(w)))
      ])
    );

    const base = stopwordsNorm[lang] || stopwordsNorm['en'];
    if (!extra || extra.length === 0) return base;

    const merged = new Set(base);
    for (const w of extra) merged.add(this.normalize(w));
    return merged;
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(
    text: string,
    opts: { maxResults?: number; minLength?: number; removeDigits?: boolean; stop: Set<string> }
  ): string[] {
    const tokens = this.tokenize(this.normalize(text));
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
}

// Export singleton instance
export const nativeKeywordsExecutor = new NativeKeywordsExecutor();