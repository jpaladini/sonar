import type {
  AgentsTable,
  Bootstrap,
  Charts,
  ChatResponse,
  Conversation,
  PipelineStage,
  PromptCard,
  Report,
  SavedItem,
  Transcripts,
} from './types';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

async function send<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  return res.status === 204 ? (undefined as T) : res.json();
}

export const api = {
  bootstrap: () => get<Bootstrap>('/api/bootstrap'),
  conversations: () => get<Conversation[]>('/api/conversations'),
  conversation: (id: string) => get<Conversation>(`/api/conversations/${id}`),
  chat: (message: string, conversationId?: string) =>
    send<ChatResponse>('POST', '/api/chat', { message, conversationId }),
  report: () => get<Report>('/api/report'),
  charts: () => get<Charts>('/api/charts'),
  agents: () => get<AgentsTable>('/api/agents'),
  transcripts: () => get<Transcripts>('/api/transcripts'),
  saved: () => get<SavedItem[]>('/api/saved'),
  saveItem: (item: { title: string; desc: string; meta: string }) =>
    send<SavedItem>('POST', '/api/saved', item),
  pipeline: () => get<PipelineStage[]>('/api/pipeline/health'),
  prompts: () => get<PromptCard[]>('/api/prompts'),
};
