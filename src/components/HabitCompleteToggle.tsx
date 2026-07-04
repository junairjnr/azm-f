'use client';

import { Check } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';

interface HabitCompleteToggleProps {
  completed: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}

export default function HabitCompleteToggle({
  completed,
  onToggle,
  disabled,
  className = '',
}: HabitCompleteToggleProps) {
  const tooltip = completed ? 'Mark as incomplete' : 'Mark as complete';

  return (
    <Tooltip label={tooltip} side="top">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        disabled={disabled}
        aria-label={tooltip}
        aria-pressed={completed}
        title={tooltip}
        className={`habit-complete-toggle ${completed ? 'is-checked' : ''} ${className}`}
      >
        {completed ? (
          <Check className="h-5 w-5 stroke-[3]" aria-hidden />
        ) : (
          <span className="habit-complete-toggle-inner" aria-hidden />
        )}
      </button>
    </Tooltip>
  );
}
