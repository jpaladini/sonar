import { useStore } from '../store';
import type {
  AgentsBlock,
  BarsBlock,
  Block,
  ChipsBlock,
  TableBlock,
  TextBlock,
} from '../types';
import { FONT_WEIGHT, TEXT_COLOR } from '../ui';
import { ChipGlyph } from './Waveform';

function Text({ block }: { block: TextBlock }) {
  return (
    <div className="whitespace-pre-wrap text-[13.5px] leading-[1.62] text-text">
      {block.text}
      {block.cursor && (
        <span className="ml-[2px] inline-block h-[14px] w-[7px] animate-blinkdot-fast bg-text align-text-bottom" />
      )}
    </div>
  );
}

function Bars({ block }: { block: BarsBlock }) {
  return (
    <div className="rounded-[10px] border border-border bg-panel px-[16px] py-[14px]">
      <div className="mb-[12px] text-[11px] font-semibold uppercase tracking-[.07em] text-faint">
        {block.title}
      </div>
      <div className="flex flex-col gap-[9px]">
        {block.items.map((r) => (
          <div
            key={r.label}
            className="grid grid-cols-[130px_1fr_74px] items-center gap-[10px]"
          >
            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[12px] text-muted">
              {r.label}
            </div>
            <div className="h-[7px] overflow-hidden rounded-[4px] bg-track">
              <div
                className="h-full rounded-[4px] bg-text"
                style={{ width: r.pct }}
              />
            </div>
            <div className="text-right font-mono text-[11.5px] text-text">
              {r.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Table({ block }: { block: TableBlock }) {
  return (
    <div className="overflow-x-auto rounded-[10px] border border-border bg-panel">
      <div
        className="grid min-w-[460px] gap-[8px] border-b border-border px-[14px] py-[9px]"
        style={{ gridTemplateColumns: block.cols }}
      >
        {block.headers.map((h) => (
          <div
            key={h}
            className="text-[10.5px] font-semibold uppercase tracking-[.06em] text-faint"
          >
            {h}
          </div>
        ))}
      </div>
      {block.rows.map((row, i) => (
        <div
          key={i}
          className="grid min-w-[460px] items-center gap-[8px] border-b border-border px-[14px] py-[8px] hover:bg-hover"
          style={{ gridTemplateColumns: block.cols }}
        >
          {row.cells.map((cell, j) => (
            <div
              key={j}
              className={`text-[12.5px] ${cell.mono ? 'font-mono' : 'font-sans'} ${TEXT_COLOR[cell.color]} ${FONT_WEIGHT[cell.weight]}`}
            >
              {cell.text}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function Agents({ block }: { block: AgentsBlock }) {
  const openTab = useStore((s) => s.openTab);
  return (
    <div className="flex flex-col gap-[7px]">
      {block.items.map((a) => (
        <div
          key={a.name}
          onClick={() => openTab(a.tab ?? 'data')}
          className="flex cursor-pointer items-center gap-[11px] rounded-[10px] border border-border bg-panel px-[13px] py-[10px] hover:border-border2 hover:bg-hover"
        >
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-border2 bg-raise text-[11px] font-semibold">
            {a.initials}
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-semibold">{a.name}</div>
            <div className="text-[11px] text-faint">{a.team}</div>
          </div>
          <div className="text-right">
            <div
              className={`font-mono text-[14px] font-semibold ${TEXT_COLOR[a.scoreColor]}`}
            >
              {a.score}
            </div>
            <div className="text-[10px] text-faint">{a.calls} calls</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Chips({ block }: { block: ChipsBlock }) {
  const openTab = useStore((s) => s.openTab);
  return (
    <div className="flex flex-wrap gap-[8px]">
      {block.items.map((ch) => (
        <div
          key={ch.label}
          onClick={() => openTab(ch.tab ?? 'transcripts')}
          className="flex cursor-pointer items-center gap-[8px] rounded-[9px] border border-border bg-panel px-[12px] py-[8px] hover:border-border2 hover:bg-hover"
        >
          <ChipGlyph />
          <div>
            <div className="font-mono text-[11.5px] font-semibold">{ch.label}</div>
            <div className="text-[10.5px] text-faint">{ch.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BlockView({ block }: { block: Block }) {
  if ('isText' in block) return <Text block={block} />;
  if ('isBars' in block) return <Bars block={block} />;
  if ('isTable' in block) return <Table block={block} />;
  if ('isAgents' in block) return <Agents block={block} />;
  if ('isChips' in block) return <Chips block={block} />;
  return null;
}
