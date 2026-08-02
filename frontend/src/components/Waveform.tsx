/* The waveform brand mark — pure divs per the design spec. */

export function LogoTile() {
  return (
    <div className="flex h-[26px] w-[26px] items-center justify-center gap-[2px] rounded-[7px] bg-inv">
      <div className="h-[6px] w-[2.5px] rounded-[2px] bg-invtext" />
      <div className="h-[13px] w-[2.5px] rounded-[2px] bg-invtext" />
      <div className="h-[9px] w-[2.5px] rounded-[2px] bg-invtext" />
      <div className="h-[15px] w-[2.5px] rounded-[2px] bg-invtext" />
      <div className="h-[5px] w-[2.5px] rounded-[2px] bg-invtext" />
    </div>
  );
}

export function AssistantAvatar({ animated = false }: { animated?: boolean }) {
  const bar = animated ? 'animate-wave-fast' : '';
  return (
    <div className="mt-[2px] flex h-[26px] w-[26px] min-w-[26px] items-center justify-center gap-[1.5px] rounded-[7px] bg-inv">
      <div className={`h-[5px] w-[2px] rounded-[1px] bg-invtext ${bar}`} />
      <div className={`h-[10px] w-[2px] rounded-[1px] bg-invtext ${bar} [animation-delay:.15s]`} />
      <div className={`h-[7px] w-[2px] rounded-[1px] bg-invtext ${bar} [animation-delay:.3s]`} />
    </div>
  );
}

export function EmptyStateWave() {
  return (
    <div className="mb-[22px] flex h-[44px] items-end gap-[4px]">
      <div className="h-[44px] w-[5px] rounded-[3px] bg-text animate-wave [animation-delay:0s]" />
      <div className="h-[44px] w-[5px] rounded-[3px] bg-text animate-wave [animation-delay:.15s]" />
      <div className="h-[44px] w-[5px] rounded-[3px] bg-text animate-wave [animation-delay:.3s]" />
      <div className="h-[44px] w-[5px] rounded-[3px] bg-text animate-wave [animation-delay:.45s]" />
      <div className="h-[44px] w-[5px] rounded-[3px] bg-text animate-wave [animation-delay:.6s]" />
    </div>
  );
}

export function ChipGlyph() {
  return (
    <div className="flex h-[12px] items-end gap-[1.5px]">
      <div className="h-[5px] w-[2px] rounded-[1px] bg-muted" />
      <div className="h-[11px] w-[2px] rounded-[1px] bg-muted" />
      <div className="h-[7px] w-[2px] rounded-[1px] bg-muted" />
    </div>
  );
}
