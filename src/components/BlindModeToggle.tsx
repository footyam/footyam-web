interface BlindModeToggleProps {
  enabled: boolean;
  onChange: (value: boolean) => void;
}

export function BlindModeToggle({ enabled, onChange }: BlindModeToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
        enabled
          ? 'border-brand-500 bg-brand-500/20 text-brand-500'
          : 'border-slate-600 bg-slate-800 text-slate-200'
      }`}
    >
      Blind Mode: {enabled ? 'ON' : 'OFF'}
    </button>
  );
}
