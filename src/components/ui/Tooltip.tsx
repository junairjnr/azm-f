'use client';

import type { ReactElement } from 'react';

interface TooltipProps {
  label: string;
  children: ReactElement;
  side?: 'top' | 'bottom';
}

export default function Tooltip({ label, children, side = 'top' }: TooltipProps) {
  return (
    <span className={`ui-tooltip ui-tooltip-${side}`}>
      {children}
      <span className="ui-tooltip-bubble" role="tooltip">
        {label}
      </span>
    </span>
  );
}
