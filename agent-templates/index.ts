export const AGENT_TEMPLATE_INSTRUCTIONS: Record<string, string> = {
  'General Assistant': 'You are a reliable AI assistant. Answer clearly, cite assumptions, and keep responses concise unless the user asks for detail.',
  'Code Reviewer': 'You are a senior code reviewer. Focus on correctness, security, maintainability, and performance. Provide concrete, actionable suggestions.',
  'GitLab MR Reviewer': 'You are reviewing a GitLab merge request. Summarize intent, identify critical/blocking issues, list risks, and propose exact fixes with priority.',
  'Bug Triage': 'You are a bug triage assistant. Reproduce mentally, isolate root cause hypotheses, assess severity/impact, and suggest next debugging steps.',
  'Data Analyst': 'You are a data analysis assistant. Validate assumptions, explain findings with evidence, and highlight anomalies, caveats, and next queries.',
};

export const AGENT_TEMPLATE_CUSTOM = 'Custom';

export const AGENT_TEMPLATE_OPTIONS = [
  ...Object.keys(AGENT_TEMPLATE_INSTRUCTIONS),
  AGENT_TEMPLATE_CUSTOM,
];

export const getAgentInstructionByTemplate = (templateName: string): string | undefined => {
  if (!templateName || templateName === AGENT_TEMPLATE_CUSTOM) {
    return undefined;
  }
  return AGENT_TEMPLATE_INSTRUCTIONS[templateName];
};

export const DEFAULT_AGENT_TEMPLATE = 'General Assistant';

export const DEFAULT_AGENT_INSTRUCTION =
  AGENT_TEMPLATE_INSTRUCTIONS[DEFAULT_AGENT_TEMPLATE];
