import type { Edge, Node } from '@xyflow/react';
import { getNodeValidationRuleConfigs } from '../node-registry';
import type { CustomNodeType } from '@n2flow/types';
import { validatorsByRuleKey } from './ruleRegistry';
import type { FlowValidationIssue, ValidationContext } from './types';
import { validateNodeConnectivity, validateToolConnectivity, validateAgentConnectivity } from './utils';

export type { FlowValidationIssue } from './types';

export type ValidationLocale = 'en' | 'vi';

type ValidateFlowOptions = {
  locale?: ValidationLocale;
};

const formatValidationMessage = (
  template: string,
  node: CustomNodeType,
  issue: FlowValidationIssue,
  ruleKey: string,
): string => {
  const values: Record<string, string> = {
    label: String(node.data.label ?? ''),
    type: String(node.data.type ?? ''),
    nodeId: String(node.id ?? ''),
    field: String(issue.fieldName ?? ''),
    level: String(issue.level ?? ''),
    ruleKey,
    defaultMessage: String(issue.message ?? ''),
  };

  return template.replace(/\{(label|type|nodeId|field|level|ruleKey|defaultMessage)\}/g, (_, k) => values[k] || '');
};

export const validateFlowGraph = (
  nodes: Node[],
  edges: Edge[],
  options?: ValidateFlowOptions,
): FlowValidationIssue[] => {
  const locale = options?.locale || 'en';
  const nodeMap = new Map(nodes.map((n) => [n.id, n as CustomNodeType]));
  const context: ValidationContext = { nodes, edges, nodeMap };

  const issues: FlowValidationIssue[] = edges
    .filter((e) => !nodeMap.has(e.source) || !nodeMap.has(e.target))
    .map((e) => ({ level: 'error', message: `Edge ${e.id} references missing node.` }));

  nodes.forEach((rawNode) => {
    const node = rawNode as CustomNodeType;
    getNodeValidationRuleConfigs(node.data.type).forEach((ruleConfig) => {
      const validator = validatorsByRuleKey[ruleConfig.key];
      if (!validator) return;

      const nodeIssues = validator(node, context).map((issue) => ({
        ...issue,
        level: ruleConfig.level || issue.level,
        message: (() => {
          const tmpl = (locale === 'vi' ? ruleConfig.messageVi : ruleConfig.messageEn) || ruleConfig.message;
          return tmpl ? formatValidationMessage(tmpl, node, issue, ruleConfig.key) : issue.message;
        })(),
      }));
      issues.push(...nodeIssues);
    });
  });

  return [
    ...issues,
    ...validateNodeConnectivity(nodes, edges),
    ...validateToolConnectivity(nodes, edges),
    ...validateAgentConnectivity(nodes, edges),
  ];
};
