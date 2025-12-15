import { cn } from '@/lib/utils';

interface LikertScaleProps {
  value: number | null;
  onChange: (value: 1 | 2 | 3 | 4 | 5) => void;
}

const options = [
  { value: 1, label: 'Discordo totalmente' },
  { value: 2, label: 'Discordo' },
  { value: 3, label: 'Neutro' },
  { value: 4, label: 'Concordo' },
  { value: 5, label: 'Concordo totalmente' },
] as const;

export function LikertScale({ value, onChange }: LikertScaleProps) {
  return (
    <div className="likert-scale">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'likert-option',
            value === option.value && 'likert-option-selected'
          )}
        >
          <span className="block text-lg font-semibold mb-1">{option.value}</span>
          <span className="block text-xs leading-tight">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
