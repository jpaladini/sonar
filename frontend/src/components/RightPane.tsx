import { useStore } from '../store';
import type { Tab } from '../types';
import { BG_COLOR, TEXT_COLOR } from '../ui';

const TABS: { key: Tab; label: string }[] = [
  { key: 'report', label: 'Report' },
  { key: 'charts', label: 'Charts' },
  { key: 'transcripts', label: 'Transcripts' },
  { key: 'data', label: 'Data' },
  { key: 'saved', label: 'Saved' },
];

function ReportTab() {
  const { report, saveReportToLibrary, exportReportMd } = useStore();
  if (!report) return null;
  return (
    <div className="animate-fadeup">
      <div className="mb-[6px] font-mono text-[10.5px] text-faint">{report.kicker}</div>
      <div className="mb-[4px] text-[17px] font-bold">{report.title}</div>
      <div className="mb-[16px] text-[11.5px] text-muted">{report.meta}</div>

      <div className="mb-[8px] text-[12px] font-bold uppercase tracking-[.06em] text-faint">
        Summary
      </div>
      <div className="mb-[14px] text-[12.5px] leading-[1.65] text-text">
        {report.summary.map((seg, i) =>
          seg.bold ? <b key={i}>{seg.text}</b> : <span key={i}>{seg.text}</span>,
        )}
      </div>

      <div className="mb-[8px] text-[12px] font-bold uppercase tracking-[.06em] text-faint">
        Key findings
      </div>
      <div className="mb-[16px] flex flex-col gap-[7px]">
        {report.findings.map((f) => (
          <div key={f} className="flex gap-[8px] text-[12.5px] leading-[1.55]">
            <div className="text-faint">–</div>
            <div>{f}</div>
          </div>
        ))}
      </div>

      <div className="mb-[8px] text-[12px] font-bold uppercase tracking-[.06em] text-faint">
        Recommended actions
      </div>
      <div className="mb-[18px] flex flex-col gap-[7px]">
        {report.actions.map((a, i) => (
          <div key={a} className="flex gap-[8px] text-[12.5px] leading-[1.55]">
            <div className="font-mono text-faint">{i + 1}.</div>
            <div>{a}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-[8px]">
        <div
          onClick={exportReportMd}
          className="flex-1 cursor-pointer rounded-[8px] border border-border2 p-[8px] text-center text-[12px] font-semibold hover:bg-hover"
        >
          Export .md
        </div>
        <div
          onClick={() => void saveReportToLibrary()}
          className="flex-1 cursor-pointer rounded-[8px] bg-inv p-[8px] text-center text-[12px] font-semibold text-invtext hover:opacity-[.88]"
        >
          Save to library
        </div>
      </div>
    </div>
  );
}

function ChartsTab() {
  const charts = useStore((s) => s.charts);
  if (!charts) return null;
  return (
    <div className="flex animate-fadeup flex-col gap-[16px]">
      <div className="rounded-[10px] border border-border p-[14px]">
        <div className="mb-[14px] text-[11px] font-semibold uppercase tracking-[.07em] text-faint">
          {charts.volume.title}
        </div>
        <div className="flex h-[110px] items-end gap-[8px]">
          {charts.volume.items.map((d) => (
            <div
              key={d.day}
              className="flex h-full flex-1 flex-col items-center justify-end gap-[6px]"
            >
              <div
                className={`w-full rounded-[4px_4px_2px_2px] ${d.muted ? 'bg-muted' : 'bg-text'}`}
                style={{ height: `${d.pct}%` }}
              />
              <div className="text-[10px] text-faint">{d.day}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[10px] border border-border p-[14px]">
        <div className="mb-[12px] text-[11px] font-semibold uppercase tracking-[.07em] text-faint">
          {charts.sentiment.title}
        </div>
        <div className="flex flex-col gap-[10px]">
          {charts.sentiment.items.map((sr) => (
            <div
              key={sr.label}
              className="grid grid-cols-[110px_1fr_40px] items-center gap-[10px]"
            >
              <div className="text-[12px] text-muted">{sr.label}</div>
              <div className="h-[7px] overflow-hidden rounded-[4px] bg-track">
                <div
                  className={`h-full rounded-[4px] ${BG_COLOR[sr.color]}`}
                  style={{ width: sr.pct }}
                />
              </div>
              <div
                className={`text-right font-mono text-[11.5px] ${TEXT_COLOR[sr.color]}`}
              >
                {sr.value}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-[12px] border-t border-border pt-[10px] text-[11px] leading-[1.5] text-faint">
          {charts.sentiment.footnote}
        </div>
      </div>

      <div className="rounded-[10px] border border-border p-[14px]">
        <div className="mb-[12px] text-[11px] font-semibold uppercase tracking-[.07em] text-faint">
          {charts.driverDelta.title}
        </div>
        <div className="flex flex-col gap-[9px]">
          {charts.driverDelta.items.map((dd) => (
            <div key={dd.label} className="flex items-center gap-[10px]">
              <div className="w-[110px] text-[12px] text-muted">{dd.label}</div>
              <div className="flex-1 font-mono text-[11.5px]">{dd.share}</div>
              <div className={`font-mono text-[11.5px] ${TEXT_COLOR[dd.color]}`}>
                {dd.delta}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TranscriptsTab() {
  const { transcripts, openTranscript, setOpenTranscript } = useStore();
  if (!transcripts) return null;
  return (
    <div className="animate-fadeup">
      <div className="mb-[12px] flex items-baseline justify-between">
        <div className="text-[13px] font-bold">{transcripts.header}</div>
        <div className="font-mono text-[10.5px] text-faint">{transcripts.counter}</div>
      </div>
      <div className="flex flex-col gap-[10px]">
        {transcripts.items.map((t) => {
          const open = openTranscript === t.id;
          return (
            <div key={t.id} className="overflow-hidden rounded-[10px] border border-border">
              <div
                onClick={() => setOpenTranscript(open ? null : t.id)}
                className="cursor-pointer bg-panel2 px-[13px] py-[11px] hover:bg-hover"
              >
                <div className="mb-[5px] flex items-center gap-[9px]">
                  <div className="font-mono text-[11.5px] font-semibold">{t.id}</div>
                  <div className="text-[11px] text-faint">{t.meta}</div>
                  <div className="flex-1" />
                  <div className="font-mono text-[11.5px] font-semibold text-bad">
                    {t.score}
                  </div>
                </div>
                <div className="flex flex-wrap gap-[5px]">
                  {t.labels.map((lb) => (
                    <div
                      key={lb}
                      className="rounded-[10px] border border-border2 px-[7px] py-[2.5px] text-[9.5px] uppercase tracking-[.05em] text-muted"
                    >
                      {lb}
                    </div>
                  ))}
                </div>
              </div>
              {open && (
                <div className="flex flex-col gap-[10px] border-t border-border px-[13px] py-[12px]">
                  {t.turns.map((tn, i) => (
                    <div key={i} className="flex gap-[9px]">
                      <div
                        className={`min-w-[44px] pt-[2px] font-mono text-[10px] font-semibold ${tn.agent ? 'text-bad' : 'text-muted'}`}
                      >
                        {tn.who}
                      </div>
                      <div className="text-[12px] leading-[1.55] text-text">{tn.text}</div>
                    </div>
                  ))}
                  <div className="font-mono text-[10.5px] text-faint">
                    … full transcript in Databricks · {t.id}.wav
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DataTab() {
  const agentsTable = useStore((s) => s.agentsTable);
  if (!agentsTable) return null;
  return (
    <div className="animate-fadeup">
      <div className="mb-[12px] flex items-baseline justify-between">
        <div className="text-[13px] font-bold">{agentsTable.title}</div>
        <div className="font-mono text-[10.5px] text-faint">{agentsTable.sort}</div>
      </div>
      <div className="overflow-hidden rounded-[10px] border border-border">
        <div className="grid grid-cols-[1.5fr_.7fr_.7fr_.8fr] gap-[6px] border-b border-border bg-panel2 px-[12px] py-[9px]">
          <div className="text-[10px] font-semibold uppercase tracking-[.06em] text-faint">
            Agent
          </div>
          <div className="text-right text-[10px] font-semibold uppercase tracking-[.06em] text-faint">
            Sent.
          </div>
          <div className="text-right text-[10px] font-semibold uppercase tracking-[.06em] text-faint">
            Calls
          </div>
          <div className="text-right text-[10px] font-semibold uppercase tracking-[.06em] text-faint">
            Esc. rate
          </div>
        </div>
        {agentsTable.rows.map((ag) => (
          <div
            key={ag.name}
            className="grid grid-cols-[1.5fr_.7fr_.7fr_.8fr] items-center gap-[6px] border-b border-border px-[12px] py-[9px] hover:bg-hover"
          >
            <div className="text-[12.5px] font-medium">{ag.name}</div>
            <div
              className={`text-right font-mono text-[11.5px] font-semibold ${TEXT_COLOR[ag.color]}`}
            >
              {ag.sent}
            </div>
            <div className="text-right font-mono text-[11.5px] text-muted">
              {ag.calls}
            </div>
            <div className="text-right font-mono text-[11.5px] text-muted">
              {ag.esc}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-[10px] text-[11px] leading-[1.5] text-faint">
        {agentsTable.footnote}
      </div>
    </div>
  );
}

function SavedTab() {
  const saved = useStore((s) => s.saved);
  return (
    <div className="flex animate-fadeup flex-col gap-[10px]">
      {saved.map((sv) => (
        <div
          key={sv.id}
          className="cursor-pointer rounded-[10px] border border-border px-[13px] py-[12px] hover:border-border2 hover:bg-hover"
        >
          <div className="mb-[4px] flex items-center gap-[8px]">
            <div className="h-[5px] w-[5px] rounded-full bg-text" />
            <div className="text-[12.5px] font-semibold">{sv.title}</div>
          </div>
          <div className="mb-[6px] text-[11.5px] leading-[1.5] text-muted">{sv.desc}</div>
          <div className="font-mono text-[10px] text-faint">{sv.meta}</div>
        </div>
      ))}
    </div>
  );
}

export function RightPane() {
  const { rightOpen, activeTab, setTab } = useStore();
  if (!rightOpen) return null;
  return (
    <div className="flex w-[clamp(300px,30vw,400px)] min-w-[300px] flex-col border-l border-border bg-panel">
      <div className="flex gap-[2px] overflow-x-auto border-b border-border px-[10px] py-[9px]">
        {TABS.map((t) => {
          const active = activeTab === t.key;
          return (
            <div
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`cursor-pointer whitespace-nowrap rounded-[7px] px-[11px] py-[6px] text-[12px] ${active ? 'bg-raise font-semibold text-text' : 'font-normal text-muted hover:text-text'}`}
            >
              {t.label}
            </div>
          );
        })}
      </div>
      <div className="flex-1 overflow-y-auto p-[16px]">
        {activeTab === 'report' && <ReportTab />}
        {activeTab === 'charts' && <ChartsTab />}
        {activeTab === 'transcripts' && <TranscriptsTab />}
        {activeTab === 'data' && <DataTab />}
        {activeTab === 'saved' && <SavedTab />}
      </div>
    </div>
  );
}
