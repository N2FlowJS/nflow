import React from 'react';
import {
  Bot,
  BrainCircuit,
  Database,
  Search,
  MessageSquare,
  Terminal,
  Clock,
  Cpu,
  ArrowRightFromLine,
  Globe,
  GitMerge,
  FileJson,
  Type,
  Plus,
  type LucideProps,
} from 'lucide-react';

export const iconComponents: Record<string, React.ElementType> = {
  Bot,
  BrainCircuit,
  Database,
  Search,
  MessageSquare,
  Terminal,
  Clock,
  Cpu,
  ArrowRightFromLine,
  Globe,
  GitMerge,
  FileJson,
  Type,
  Plus,
};

interface NodeIconProps extends LucideProps {
  name?: string | undefined;
  fallback?: React.ElementType | undefined;
}

export const NodeIcon = ({ name, fallback = Cpu, ...props }: NodeIconProps) => {
  const Icon = (name ? iconComponents[name] : null) || fallback;
  return <Icon {...props} />;
};
