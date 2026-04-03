import type { Edge, Node } from '@xyflow/react';
import { getNodeValidationRuleConfigs } from '../node-registry';
import type { CustomNodeType } from '../types';
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

  return template.replace(/\{(label|type|nodeId|field|level|ruleKey|defaultMessage)\}/g, (_, key) => values[key] || '');
};

export const validateFlowGraph = (
  nodes: Node[],
  edges: Edge[],
  options?: ValidateFlowOptions,
): FlowValidationIssue[] => {
  const issues: FlowValidationIssue[] = [];
  const locale = options?.locale || 'en';
  const nodeMap = new Map(nodes.map((node) => [node.id, node as CustomNodeType]));

  // Basic structural validation
  edges.forEach((edge) => {
    if (!nodeMap.has(edge.source) || !nodeMap.has(edge.target)) {
      issues.push({
        level: 'error',
        message: `Edge ${edge.id} references a missing node.`,
      });
    }
  });

  const context: ValidationContext = { nodes, edges, nodeMap };

  // Node-specific validation rules
  nodes.forEach((rawNode) => {
    const node = rawNode as CustomNodeType;
    const ruleConfigs = getNodeValidationRuleConfigs(node.data.type);
    ruleConfigs.forEach((ruleConfig) => {
      const validator = validatorsByRuleKey[ruleConfig.key];
      if (!validator) return;

      const nodeIssues = validator(node, context).map((issue) => ({
        ...issue,
        level: ruleConfig.level || issue.level,
        message: (() => {
          const template =
            (locale === 'vi' ? ruleConfig.messageVi : ruleConfig.messageEn) ||
            ruleConfig.message;
          if (!template) return issue.message;
          return formatValidationMessage(template, node, issue, ruleConfig.key);
        })(),
      }));

      issues.push(...nodeIssues);
    });
  });

  // Graph connectivity validation
  issues.push(...validateNodeConnectivity(nodes, edges));
  issues.push(...validateToolConnectivity(nodes, edges));
  issues.push(...validateAgentConnectivity(nodes, edges));

  return issues;
};
