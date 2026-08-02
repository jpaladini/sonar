import { create } from 'zustand';
import { api } from './api';
import type {
  AgentsTable,
  Block,
  Bootstrap,
  Charts,
  Conversation,
  Message,
  PipelineStage,
  PromptCard,
  Report,
  SavedItem,
  SettingsTab,
  Tab,
  Transcripts,
} from './types';

const THEME_KEY = 'sonar-theme';

interface SonarState {
  theme: 'dark' | 'light';
  rightOpen: boolean;
  activeTab: Tab;
  convs: Record<string, Conversation>;
  order: string[];
  activeId: string | null;
  searchQ: string;
  draft: string;
  thinking: boolean;
  thinkingLabel: string;
  showSettings: boolean;
  settingsTab: SettingsTab;
  openTranscript: string | null;
  toggles: { mono: boolean; compactMsgs: boolean };
  scrollTick: number;
  bootstrap: Bootstrap | null;
  report: Report | null;
  charts: Charts | null;
  transcripts: Transcripts | null;
  agentsTable: AgentsTable | null;
  saved: SavedItem[];
  pipeline: PipelineStage[];
  prompts: PromptCard[];

  init: () => Promise<void>;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  toggleRight: () => void;
  setTab: (tab: Tab) => void;
  openTab: (tab: Tab) => void;
  selectConversation: (id: string) => Promise<void>;
  newChat: () => void;
  setSearch: (q: string) => void;
  setDraft: (d: string) => void;
  send: (text?: string) => Promise<void>;
  setShowSettings: (open: boolean) => void;
  setSettingsTab: (tab: SettingsTab) => void;
  setOpenTranscript: (id: string | null) => void;
  flipToggle: (key: 'mono' | 'compactMsgs') => void;
  saveReportToLibrary: () => Promise<void>;
  exportReportMd: () => void;
}

function applyTheme(theme: 'dark' | 'light') {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const useStore = create<SonarState>((set, get) => ({
  theme: document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
  rightOpen: true,
  activeTab: 'transcripts',
  convs: {},
  order: [],
  activeId: null,
  searchQ: '',
  draft: '',
  thinking: false,
  thinkingLabel: '',
  showSettings: false,
  settingsTab: 'profile',
  openTranscript: 'CALL-88214',
  toggles: { mono: true, compactMsgs: false },
  scrollTick: 0,
  bootstrap: null,
  report: null,
  charts: null,
  transcripts: null,
  agentsTable: null,
  saved: [],
  pipeline: [],
  prompts: [],

  init: async () => {
    const [bootstrap, list] = await Promise.all([api.bootstrap(), api.conversations()]);
    const convs: Record<string, Conversation> = {};
    const order: string[] = [];
    for (const c of list) {
      convs[c.id] = c;
      order.push(c.id);
    }
    // Match the prototype's seeded initial view: first conversation open,
    // transcripts tab active with the first call expanded.
    const activeId = order.includes('c1') ? 'c1' : order[0] ?? null;
    set({ bootstrap, convs, order, activeId });
    if (activeId) {
      const full = await api.conversation(activeId);
      set((s) => ({ convs: { ...s.convs, [activeId]: full } }));
    }
    const [report, charts, transcripts, agentsTable, saved, pipeline, prompts] =
      await Promise.all([
        api.report(),
        api.charts(),
        api.transcripts(),
        api.agents(),
        api.saved(),
        api.pipeline(),
        api.prompts(),
      ]);
    set({ report, charts, transcripts, agentsTable, saved, pipeline, prompts });
  },

  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
  toggleRight: () => set((s) => ({ rightOpen: !s.rightOpen })),
  setTab: (tab) => set({ activeTab: tab }),
  openTab: (tab) => set({ activeTab: tab, rightOpen: true }),

  selectConversation: async (id) => {
    set({ activeId: id });
    const conv = get().convs[id];
    if (conv && conv.messages === undefined) {
      const full = await api.conversation(id);
      set((s) => ({ convs: { ...s.convs, [id]: full } }));
    }
  },

  newChat: () => set({ activeId: null, thinking: false }),
  setSearch: (q) => set({ searchQ: q }),
  setDraft: (d) => set({ draft: d }),

  send: async (text) => {
    const q = (text ?? get().draft).trim();
    if (!q || get().thinking) return;

    const startedAt = Date.now();
    let convId = get().activeId;
    let pendingId: string | null = null;
    if (!convId) {
      pendingId = `pending-${Date.now()}`;
      convId = pendingId;
      const title = q.length > 34 ? q.slice(0, 34) + '…' : q;
      set((s) => ({
        convs: {
          ...s.convs,
          [pendingId!]: {
            id: pendingId!,
            title,
            sub: 'just now',
            when: 'today',
            pinned: false,
            messages: [],
          },
        },
        order: [pendingId!, ...s.order],
        activeId: pendingId,
      }));
    }

    const appendMessage = (id: string, message: Message) =>
      set((s) => {
        const conv = s.convs[id];
        if (!conv) return s;
        return {
          convs: {
            ...s.convs,
            [id]: { ...conv, messages: [...(conv.messages ?? []), message] },
          },
          scrollTick: s.scrollTick + 1,
        };
      });

    appendMessage(convId, { isUser: true, text: q });
    const labels = get().bootstrap?.thinkingLabels ?? ['Thinking…', 'Thinking…'];
    set({ draft: '', thinking: true, thinkingLabel: labels[0] });
    const labelTimer = setTimeout(
      () => set((s) => (s.thinking ? { thinkingLabel: labels[1] } : s)),
      900,
    );

    let blocks: Block[];
    try {
      const res = await api.chat(q, pendingId ? undefined : convId);
      blocks = res.message.blocks;
      if (pendingId) {
        // Swap the optimistic conversation for the server-assigned identity.
        const serverId = res.conversationId;
        set((s) => {
          const conv = s.convs[pendingId!];
          const convs = { ...s.convs };
          delete convs[pendingId!];
          convs[serverId] = { ...conv, id: serverId, title: res.title };
          return {
            convs,
            order: s.order.map((o) => (o === pendingId ? serverId : o)),
            activeId: serverId,
          };
        });
        convId = serverId;
      }
    } catch {
      blocks = [
        {
          isText: true,
          text: 'Sonar could not reach the pipeline just now. Try again in a moment.',
        },
      ];
    }

    // The design's send flow: ~1.7s thinking (label swap at 900ms), then the
    // reply streams in with a block cursor.
    const elapsed = Date.now() - startedAt;
    if (elapsed < 1700) await sleep(1700 - elapsed);
    clearTimeout(labelTimer);
    set({ thinking: false });

    const message: Message = { isAssistant: true, blocks: [] };
    appendMessage(convId, message);
    const bump = () =>
      set((s) => {
        const conv = s.convs[convId!];
        if (!conv?.messages) return s;
        const messages = [...conv.messages];
        messages[messages.length - 1] = { ...message, blocks: [...message.blocks] };
        return {
          convs: { ...s.convs, [convId!]: { ...conv, messages } },
          scrollTick: s.scrollTick + 1,
        };
      });

    for (const block of blocks) {
      if ('isText' in block && block.isText) {
        const streamed = { isText: true as const, text: '', cursor: true };
        message.blocks.push(streamed);
        for (let i = 0; i < block.text.length; i += 3) {
          streamed.text = block.text.slice(0, i + 3);
          bump();
          await sleep(24);
        }
        streamed.text = block.text;
        streamed.cursor = false;
        bump();
      } else {
        message.blocks.push(block);
        bump();
      }
    }
  },

  setShowSettings: (open) => set({ showSettings: open }),
  setSettingsTab: (tab) => set({ settingsTab: tab }),
  setOpenTranscript: (id) => set({ openTranscript: id }),
  flipToggle: (key) =>
    set((s) => ({ toggles: { ...s.toggles, [key]: !s.toggles[key] } })),

  saveReportToLibrary: async () => {
    const report = get().report;
    if (!report) return;
    await api.saveItem({
      title: report.title,
      desc: 'Saved from the Report tab.',
      meta: 'Saved just now · report',
    });
    set({ saved: await api.saved(), activeTab: 'saved' });
  },

  exportReportMd: () => {
    const report = get().report;
    if (!report) return;
    const md = [
      `# ${report.title}`,
      '',
      `_${report.meta}_`,
      '',
      '## Summary',
      '',
      report.summary.map((s) => (s.bold ? `**${s.text}**` : s.text)).join(''),
      '',
      '## Key findings',
      '',
      ...report.findings.map((f) => `- ${f}`),
      '',
      '## Recommended actions',
      '',
      ...report.actions.map((a, i) => `${i + 1}. ${a}`),
      '',
    ].join('\n');
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sonar-report.md';
    a.click();
    URL.revokeObjectURL(url);
  },
}));
