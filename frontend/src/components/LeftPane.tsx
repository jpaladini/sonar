import { useStore } from '../store';
import type { Conversation } from '../types';
import { LogoTile } from './Waveform';

const GROUPS: { key: Conversation['when']; label: string; pinned: boolean }[] = [
  { key: 'pinned', label: 'Pinned', pinned: true },
  { key: 'today', label: 'Today', pinned: false },
  { key: 'yesterday', label: 'Yesterday', pinned: false },
  { key: 'week', label: 'Earlier this week', pinned: false },
];

export function LeftPane() {
  const {
    bootstrap,
    convs,
    order,
    activeId,
    searchQ,
    theme,
    setSearch,
    selectConversation,
    newChat,
    toggleTheme,
    setShowSettings,
  } = useStore();

  const q = searchQ.toLowerCase();
  const visible = order
    .map((id) => convs[id])
    .filter(Boolean)
    .filter(
      (c) =>
        !q || c.title.toLowerCase().includes(q) || c.sub.toLowerCase().includes(q),
    );
  const groups = GROUPS.map((g) => ({
    ...g,
    items: visible.filter((c) =>
      g.pinned ? c.pinned : !c.pinned && c.when === g.key,
    ),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex w-[256px] min-w-[256px] flex-col border-r border-border bg-panel">
      <div className="flex items-center gap-[9px] px-[14px] pb-[10px] pt-[14px]">
        <LogoTile />
        <div className="flex-1">
          <div className="text-[14px] font-bold tracking-[.04em]">SONAR</div>
          <div className="text-[10px] uppercase tracking-[.06em] text-faint">
            Call intelligence
          </div>
        </div>
      </div>

      <div className="px-[12px] pb-[10px]">
        <div className="flex cursor-pointer items-center gap-[8px] rounded-[8px] border border-border bg-panel2 px-[9px] py-[7px] hover:border-border2">
          <div className="flex h-[16px] w-[16px] items-center justify-center rounded-[4px] border border-border2 bg-raise text-[9px] font-semibold text-muted">
            CX
          </div>
          <div className="flex-1 text-[12px] font-medium">
            {bootstrap?.workspace ?? ''}
          </div>
          <div className="text-[10px] text-faint">▾</div>
        </div>
      </div>

      <div className="flex flex-col gap-[8px] px-[12px]">
        <button
          onClick={newChat}
          className="flex cursor-pointer items-center justify-center gap-[7px] rounded-[8px] bg-inv p-[8px] text-[12.5px] font-semibold text-invtext hover:opacity-[.88]"
        >
          <span className="text-[14px] leading-none">+</span> New conversation
        </button>
        <input
          value={searchQ}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations…"
          className="w-full rounded-[8px] border border-border bg-panel2 px-[10px] py-[7px] text-[12px] text-text outline-none placeholder:text-faint focus:border-border2"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-[8px] pb-[8px] pt-[10px]">
        {groups.map((g) => (
          <div key={g.label} className="mb-[10px]">
            <div className="px-[8px] py-[4px] text-[10px] font-semibold uppercase tracking-[.08em] text-faint">
              {g.label}
            </div>
            {g.items.map((c) => {
              const active = c.id === activeId;
              return (
                <div
                  key={c.id}
                  onClick={() => void selectConversation(c.id)}
                  className={`flex cursor-pointer items-center gap-[8px] rounded-[7px] px-[8px] py-[7px] hover:bg-hover ${active ? 'bg-hover' : ''}`}
                >
                  <div
                    className={`h-[5px] w-[5px] shrink-0 rounded-full ${active ? 'bg-text' : 'bg-border2'}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className={`overflow-hidden text-ellipsis whitespace-nowrap text-[12.5px] ${active ? 'font-semibold' : 'font-normal'}`}
                    >
                      {c.title}
                    </div>
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[10.5px] text-faint">
                      {c.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-[9px] border-t border-border px-[12px] py-[10px]">
        <div className="flex h-[28px] w-[28px] items-center justify-center rounded-full border border-border2 bg-raise text-[10.5px] font-semibold">
          {bootstrap?.user.initials ?? ''}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-semibold">
            {bootstrap?.user.name ?? ''}
          </div>
          <div className="text-[10.5px] text-faint">{bootstrap?.user.role ?? ''}</div>
        </div>
        <div
          onClick={toggleTheme}
          title="Toggle theme"
          className="flex cursor-pointer items-center gap-[4px] rounded-[20px] border border-border px-[7px] py-[4px] text-[10px] text-muted hover:border-border2 hover:text-text"
        >
          <div
            className="h-[7px] w-[7px] rounded-full"
            style={{ background: theme === 'dark' ? 'var(--text)' : '#f0c26a' }}
          />
          {theme === 'dark' ? 'Dark' : 'Light'}
        </div>
        <div
          onClick={() => setShowSettings(true)}
          title="Settings"
          className="flex h-[26px] w-[26px] cursor-pointer flex-col items-center justify-center gap-[2.5px] rounded-[7px] border border-border hover:border-border2 hover:bg-hover"
        >
          <div className="h-[1.5px] w-[11px] rounded-[1px] bg-muted" />
          <div className="h-[1.5px] w-[11px] rounded-[1px] bg-muted" />
          <div className="h-[1.5px] w-[11px] rounded-[1px] bg-muted" />
        </div>
      </div>
    </div>
  );
}
