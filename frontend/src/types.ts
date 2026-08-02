export type SemColor = 'good' | 'warn' | 'bad' | 'text' | 'muted' | 'faint';
export type Tab = 'report' | 'charts' | 'transcripts' | 'data' | 'saved';
export type SettingsTab = 'profile' | 'appearance' | 'pipeline' | 'prompts';

export interface TextBlock {
  isText: true;
  text: string;
  cursor?: boolean;
}

export interface BarsBlock {
  isBars: true;
  title: string;
  items: { label: string; value: string; pct: string }[];
}

export interface TableCell {
  text: string;
  mono: boolean;
  color: SemColor;
  weight: 400 | 500 | 600;
}

export interface TableBlock {
  isTable: true;
  cols: string;
  headers: string[];
  rows: { cells: TableCell[] }[];
}

export interface AgentItem {
  name: string;
  initials: string;
  team: string;
  score: string;
  scoreColor: SemColor;
  calls: number;
  tab?: Tab;
}

export interface AgentsBlock {
  isAgents: true;
  items: AgentItem[];
}

export interface ChipItem {
  label: string;
  sub: string;
  tab?: Tab;
}

export interface ChipsBlock {
  isChips: true;
  items: ChipItem[];
}

export type Block = TextBlock | BarsBlock | TableBlock | AgentsBlock | ChipsBlock;

export type Message =
  | { isUser: true; text: string }
  | { isAssistant: true; blocks: Block[] };

export interface Conversation {
  id: string;
  title: string;
  sub: string;
  when: 'pinned' | 'today' | 'yesterday' | 'week';
  pinned: boolean;
  messages?: Message[];
  messageCount?: number;
}

export interface Report {
  kicker: string;
  title: string;
  meta: string;
  summary: { text: string; bold: boolean }[];
  findings: string[];
  actions: string[];
}

export interface Charts {
  volume: { title: string; items: { day: string; pct: number; muted: boolean }[] };
  sentiment: {
    title: string;
    items: { label: string; value: string; pct: string; color: SemColor }[];
    footnote: string;
  };
  driverDelta: {
    title: string;
    items: { label: string; share: string; delta: string; color: SemColor }[];
  };
}

export interface TranscriptTurn {
  who: string;
  agent: boolean;
  text: string;
}

export interface Transcript {
  id: string;
  meta: string;
  score: string;
  labels: string[];
  turns: TranscriptTurn[];
}

export interface Transcripts {
  header: string;
  counter: string;
  items: Transcript[];
}

export interface AgentsTable {
  title: string;
  sort: string;
  rows: { name: string; sent: string; calls: number; esc: string; color: SemColor }[];
  footnote: string;
}

export interface SavedItem {
  id: string;
  title: string;
  desc: string;
  meta: string;
}

export interface PipelineStage {
  label: string;
  sub: string;
  status: string;
  level: SemColor;
}

export interface PromptCard {
  label: string;
  model: string;
  sub: string;
}

export interface Bootstrap {
  workspace: string;
  user: { name: string; initials: string; role: string; email: string };
  statusPill: string;
  suggestions: string[];
  disclaimer: string;
  thinkingLabels: string[];
}

export interface ChatResponse {
  conversationId: string;
  created: boolean;
  title: string;
  message: { isAssistant: true; blocks: Block[] };
  thinkingLabels: string[];
}
