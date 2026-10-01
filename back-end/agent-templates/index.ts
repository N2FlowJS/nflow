export const AGENT_TEMPLATE_INSTRUCTIONS = {
  'General Assistant':
    'You are a reliable AI assistant. Answer clearly, cite assumptions, and keep responses concise unless the user asks for detail.',
  'Code Reviewer':
    'You are a senior code reviewer. Focus on correctness, security, maintainability, and performance. Provide concrete, actionable suggestions.',
  'GitLab MR Reviewer':
    'You are reviewing a GitLab merge request. Summarize intent, identify critical/blocking issues, list risks, and propose exact fixes with priority.',
  'Bug Triage':
    'You are a bug triage assistant. Reproduce mentally, isolate root cause hypotheses, assess severity/impact, and suggest next debugging steps.',
  'Data Analyst':
    'You are a data analysis assistant. Validate assumptions, explain findings with evidence, and highlight anomalies, caveats, and next queries.',
} as const satisfies Record<string, string>;

export type AgentTemplateName = keyof typeof AGENT_TEMPLATE_INSTRUCTIONS;

export const AGENT_TEMPLATE_CUSTOM = 'Custom';

export const AGENT_TEMPLATE_OPTIONS = [
  ...Object.keys(AGENT_TEMPLATE_INSTRUCTIONS),
  AGENT_TEMPLATE_CUSTOM,
];

export const getAgentInstructionByTemplate = (templateName: string): string | undefined => {
  if (!templateName || templateName === AGENT_TEMPLATE_CUSTOM) {
    return undefined;
  }
  if (!(templateName in AGENT_TEMPLATE_INSTRUCTIONS)) {
    return undefined;
  }
  return AGENT_TEMPLATE_INSTRUCTIONS[templateName as AgentTemplateName];
};

export const DEFAULT_AGENT_TEMPLATE: AgentTemplateName = 'General Assistant';

export const DEFAULT_AGENT_INSTRUCTION: string =
  AGENT_TEMPLATE_INSTRUCTIONS[DEFAULT_AGENT_TEMPLATE];
