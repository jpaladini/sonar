import { useStore } from '../store';
import type { SettingsTab } from '../types';
import { BG_COLOR, TEXT_COLOR } from '../ui';

const SETTINGS_TABS: { key: SettingsTab; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'appearance', label: 'Appearance' },
  { key: 'pipeline', label: 'Data pipeline' },
  { key: 'prompts', label: 'Labeling prompts' },
];

function ReadOnlyField({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? 'col-span-full' : ''}>
      <div className="mb-[5px] text-[11px] font-semibold text-faint">{label}</div>
      <input
        value={value}
        readOnly
        className="w-full rounded-[8px] border border-border bg-panel2 px-[10px] py-[8px] text-[12.5px] text-text outline-none"
      />
    </div>
  );
}

function ProfileSection() {
  const user = useStore((s) => s.bootstrap?.user);
  return (
    <div>
      <div className="mb-[16px] text-[15px] font-bold">Profile</div>
      <div className="mb-[20px] flex items-center gap-[14px]">
        <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-border2 bg-raise text-[17px] font-semibold">
          {user?.initials ?? ''}
        </div>
        <div>
          <div className="text-[14px] font-semibold">{user?.name ?? ''}</div>
          <div className="text-[12px] text-muted">
            {user ? `${user.email} · ${user.role}` : ''}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-[12px]">
        <ReadOnlyField label="DISPLAY NAME" value={user?.name ?? ''} />
        <ReadOnlyField label="ROLE" value={user?.role ?? ''} />
        <ReadOnlyField label="DEFAULT TIME WINDOW" value="Trailing 7 days" full />
      </div>
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`relative h-[19px] w-[34px] cursor-pointer rounded-[10px] transition-colors duration-150 ${on ? 'bg-inv' : 'bg-track'}`}
    >
      <div
        className={`absolute top-[2px] h-[15px] w-[15px] rounded-full transition-[left] duration-150 ${on ? 'left-[17px] bg-invtext' : 'left-[2px] bg-muted'}`}
      />
    </div>
  );
}

function AppearanceSection() {
  const { theme, setTheme, toggles, flipToggle } = useStore();
  return (
    <div>
      <div className="mb-[16px] text-[15px] font-bold">Appearance</div>
      <div className="mb-[8px] text-[11px] font-semibold text-faint">THEME</div>
      <div className="mb-[20px] flex gap-[10px]">
        <div
          onClick={() => setTheme('dark')}
          className={`flex-1 cursor-pointer rounded-[10px] border-[1.5px] p-[12px] ${theme === 'dark' ? 'border-text' : 'border-border'}`}
        >
          <div className="mb-[8px] flex h-[52px] items-center justify-center gap-[2px] rounded-[7px] border border-[#26262c] bg-[#0a0a0c]">
            <div className="h-[8px] w-[2px] rounded-[1px] bg-white" />
            <div className="h-[14px] w-[2px] rounded-[1px] bg-white" />
            <div className="h-[10px] w-[2px] rounded-[1px] bg-white" />
          </div>
          <div className="text-[12.5px] font-semibold">
            Dark <span className="font-normal text-faint">· default</span>
          </div>
        </div>
        <div
          onClick={() => setTheme('light')}
          className={`flex-1 cursor-pointer rounded-[10px] border-[1.5px] p-[12px] ${theme === 'light' ? 'border-text' : 'border-border'}`}
        >
          <div className="mb-[8px] flex h-[52px] items-center justify-center gap-[2px] rounded-[7px] border border-[#ddd] bg-[#fafafa]">
            <div className="h-[8px] w-[2px] rounded-[1px] bg-[#111]" />
            <div className="h-[14px] w-[2px] rounded-[1px] bg-[#111]" />
            <div className="h-[10px] w-[2px] rounded-[1px] bg-[#111]" />
          </div>
          <div className="text-[12.5px] font-semibold">Light</div>
        </div>
      </div>
      {(
        [
          {
            key: 'mono' as const,
            label: 'Monospace metrics',
            sub: 'Use IBM Plex Mono for numbers and IDs',
          },
          {
            key: 'compactMsgs' as const,
            label: 'Compact messages',
            sub: 'Tighter spacing in the chat thread',
          },
        ]
      ).map((tg) => (
        <div
          key={tg.key}
          className="flex items-center justify-between border-b border-border py-[11px]"
        >
          <div>
            <div className="text-[12.5px] font-semibold">{tg.label}</div>
            <div className="text-[11px] text-faint">{tg.sub}</div>
          </div>
          <Toggle on={toggles[tg.key]} onClick={() => flipToggle(tg.key)} />
        </div>
      ))}
    </div>
  );
}

function PipelineSection() {
  const pipeline = useStore((s) => s.pipeline);
  return (
    <div>
      <div className="mb-[4px] text-[15px] font-bold">Data pipeline</div>
      <div className="mb-[16px] text-[12px] text-muted">
        Databricks · sonar_prod workspace
      </div>
      <div className="flex flex-col gap-[9px]">
        {pipeline.map((ps) => (
          <div
            key={ps.label}
            className="flex items-center gap-[11px] rounded-[10px] border border-border px-[13px] py-[11px]"
          >
            <div className={`h-[7px] w-[7px] rounded-full ${BG_COLOR[ps.level]}`} />
            <div className="flex-1">
              <div className="text-[12.5px] font-semibold">{ps.label}</div>
              <div className="text-[11px] text-faint">{ps.sub}</div>
            </div>
            <div className={`font-mono text-[10.5px] ${TEXT_COLOR[ps.level]}`}>
              {ps.status}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-[12px] text-[11px] leading-[1.5] text-faint">
        WAV ingest runs on a 15-min trigger. Labeling batch completes ~40 min after
        call end.
      </div>
    </div>
  );
}

function PromptsSection() {
  const prompts = useStore((s) => s.prompts);
  return (
    <div>
      <div className="mb-[4px] text-[15px] font-bold">Labeling prompts</div>
      <div className="mb-[16px] text-[12px] text-muted">
        Agreed prompt set · v14 · applied to every call
      </div>
      <div className="flex flex-col gap-[8px]">
        {prompts.map((pr) => (
          <div
            key={pr.label}
            className="rounded-[10px] border border-border px-[13px] py-[11px] hover:border-border2"
          >
            <div className="mb-[3px] flex items-center gap-[8px]">
              <div className="flex-1 text-[12.5px] font-semibold">{pr.label}</div>
              <div className="rounded-[9px] border border-border2 px-[7px] py-[2px] font-mono text-[9.5px] tracking-[.05em] text-muted">
                {pr.model}
              </div>
            </div>
            <div className="text-[11.5px] leading-[1.5] text-muted">{pr.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsModal() {
  const { showSettings, settingsTab, setShowSettings, setSettingsTab } = useStore();
  if (!showSettings) return null;
  return (
    <div
      onClick={() => setShowSettings(false)}
      className="fixed inset-0 z-50 flex animate-fadeup-fast items-center justify-center bg-black/55"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-[480px] w-[680px] max-w-[92vw] overflow-hidden rounded-[14px] border border-border2 bg-panel shadow-[0_24px_80px_rgba(0,0,0,.5)]"
      >
        <div className="flex w-[180px] flex-col gap-[2px] border-r border-border bg-panel2 px-[8px] py-[14px]">
          <div className="px-[10px] pb-[10px] pt-[4px] text-[14px] font-bold">
            Settings
          </div>
          {SETTINGS_TABS.map((st) => {
            const active = settingsTab === st.key;
            return (
              <div
                key={st.key}
                onClick={() => setSettingsTab(st.key)}
                className={`cursor-pointer rounded-[7px] px-[10px] py-[7px] text-[12.5px] ${active ? 'bg-raise font-semibold text-text' : 'font-normal text-muted hover:text-text'}`}
              >
                {st.label}
              </div>
            );
          })}
          <div className="flex-1" />
          <div
            onClick={() => setShowSettings(false)}
            className="cursor-pointer rounded-[7px] px-[10px] py-[7px] text-[12.5px] text-faint hover:text-text"
          >
            ← Close
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-[22px] py-[20px]">
          {settingsTab === 'profile' && <ProfileSection />}
          {settingsTab === 'appearance' && <AppearanceSection />}
          {settingsTab === 'pipeline' && <PipelineSection />}
          {settingsTab === 'prompts' && <PromptsSection />}
        </div>
      </div>
    </div>
  );
}
