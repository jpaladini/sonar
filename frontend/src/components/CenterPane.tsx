import { useEffect, useRef } from 'react';
import { useStore } from '../store';
import { BlockView } from './blocks';
import { AssistantAvatar, EmptyStateWave } from './Waveform';

function TopBar() {
  const { convs, activeId, bootstrap, rightOpen, toggleRight } = useStore();
  const title = activeId ? convs[activeId]?.title ?? '' : 'New conversation';
  return (
    <div className="flex h-[50px] items-center gap-[12px] border-b border-border px-[16px]">
      <div className="min-w-0 flex-1">
        <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[13.5px] font-semibold">
          {title}
        </div>
      </div>
      <div className="flex items-center gap-[6px] rounded-[20px] border border-border px-[9px] py-[4px] text-[10.5px] text-muted">
        <div className="relative h-[6px] w-[6px]">
          <div className="absolute inset-0 rounded-full bg-good" />
          <div className="absolute inset-0 animate-sping rounded-full bg-good" />
        </div>
        {bootstrap?.statusPill ?? ''}
      </div>
      <div
        onClick={toggleRight}
        title="Toggle panel"
        className="flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[7px] border border-border hover:border-border2 hover:bg-hover"
      >
        <div className="flex h-[11px] w-[13px] justify-end rounded-[3px] border-[1.5px] border-muted">
          <div
            className={`h-full w-[4px] border-l-[1.5px] border-muted ${rightOpen ? 'bg-muted' : 'bg-transparent'}`}
          />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  const { bootstrap, send } = useStore();
  return (
    <div className="flex animate-fadeup-slow flex-col items-center pt-[11vh] text-center">
      <EmptyStateWave />
      <div className="mb-[6px] text-[21px] font-bold">Ask Sonar about your calls</div>
      <div className="mb-[24px] max-w-[420px] text-[13px] leading-[1.5] text-muted">
        Every call is transcribed, labeled and scored by the pipeline. Ask about
        drivers, sentiment, agents, or pull raw transcripts.
      </div>
      <div className="flex max-w-[560px] flex-wrap justify-center gap-[8px]">
        {(bootstrap?.suggestions ?? []).map((s) => (
          <div
            key={s}
            onClick={() => void send(s)}
            className="cursor-pointer rounded-[20px] border border-border bg-panel px-[13px] py-[8px] text-[12px] text-muted hover:border-border2 hover:text-text"
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

function Thinking() {
  const label = useStore((s) => s.thinkingLabel);
  return (
    <div className="flex animate-fadeup gap-[11px]">
      <AssistantAvatar animated />
      <div className="flex items-center gap-[5px] pt-[6px]">
        <div className="h-[5px] w-[5px] animate-blinkdot rounded-full bg-muted" />
        <div className="h-[5px] w-[5px] animate-blinkdot rounded-full bg-muted [animation-delay:.2s]" />
        <div className="h-[5px] w-[5px] animate-blinkdot rounded-full bg-muted [animation-delay:.4s]" />
        <div className="ml-[5px] text-[11.5px] text-faint">{label}</div>
      </div>
    </div>
  );
}

function Composer() {
  const { draft, bootstrap, setDraft, send } = useStore();
  return (
    <div className="px-[24px] pb-[18px]">
      <div className="mx-auto max-w-[720px]">
        <div className="flex items-center gap-[10px] rounded-[12px] border border-border2 bg-panel py-[6px] pl-[16px] pr-[6px] focus-within:border-muted">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder="Ask about drivers, sentiment, agents, transcripts…"
            className="flex-1 border-none bg-transparent py-[8px] text-[13.5px] text-text outline-none placeholder:text-faint"
          />
          <div
            onClick={() => void send()}
            className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[9px] bg-inv hover:opacity-[.85]"
          >
            <div className="ml-[2px] h-0 w-0 border-y-[5px] border-l-[6px] border-y-transparent border-l-invtext" />
          </div>
        </div>
        <div className="mt-[8px] text-center text-[10.5px] text-faint">
          {bootstrap?.disclaimer ?? ''}
        </div>
      </div>
    </div>
  );
}

export function CenterPane() {
  const { convs, activeId, thinking, scrollTick } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const conv = activeId ? convs[activeId] : null;
  const messages = conv?.messages ?? [];
  const showEmpty = !conv || messages.length === 0;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [scrollTick, thinking, activeId]);

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-bg">
      <TopBar />
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-[20px]">
        <div className="mx-auto flex max-w-[720px] flex-col gap-[18px] px-[24px]">
          {showEmpty && !thinking && <EmptyState />}
          {messages.map((m, i) => (
            <div key={i} className="flex animate-fadeup flex-col">
              {'isUser' in m ? (
                <div className="max-w-[78%] self-end rounded-[14px_14px_4px_14px] border border-border bg-panel2 px-[14px] py-[9px] text-[13.5px] leading-[1.5]">
                  {m.text}
                </div>
              ) : (
                <div className="flex gap-[11px]">
                  <AssistantAvatar />
                  <div className="flex min-w-0 flex-1 flex-col gap-[12px] pt-[3px]">
                    {m.blocks.map((b, j) => (
                      <div key={j} className="flex flex-col">
                        <BlockView block={b} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {thinking && <Thinking />}
        </div>
      </div>
      <Composer />
    </div>
  );
}
