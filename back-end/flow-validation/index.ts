import type { Edge, Node } from '@xyflow/react';
import { getNodeValidationRuleConfigs } from '../node-registry';
import type { CustomNodeType, FlowValidationIssue, ValidationLocale } from '@n2flow/types';
import { validatorsByRuleKey } from './ruleRegistry';
import type { ValidationContext } from './types';
import { validateNodeConnectivity, validateToolConnectivity } from './utils';
import { formatValidationMessage } from '../utils/common';

export type { FlowValidationIssue, ValidationLocale };

type ValidateFlowOptions = {
  locale?: ValidationLocale;
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
          if (!tmpl) return issue.message;

          const values: Record<string, string> = {
            label: String(node.data.label ?? ''),
            type: String(node.data.type ?? ''),
            nodeId: String(node.id ?? ''),
            field: String(issue.fieldName ?? ''),
            level: String(issue.level ?? ''),
            ruleKey: ruleConfig.key,
            defaultMessage: String(issue.message ?? ''),
          };
          return formatValidationMessage(tmpl, values);
        })(),
      }));
      issues.push(...nodeIssues);
    });
  });

  return [
    ...issues,
    ...validateNodeConnectivity(nodes, edges),
    ...validateToolConnectivity(nodes, edges),
  ];
};
