'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    { className, checked = false, onCheckedChange, disabled = false, ...props },
    ref
  ) => (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      ref={ref}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        'peer h-4 w-4 shrink-0 rounded border border-gray-300 ring-offset-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        checked
          ? 'border-blue-600 bg-blue-600 text-white'
          : 'bg-white hover:border-blue-400',
        className
      )}
      {...props}
    >
      {checked && (
        <div className="flex items-center justify-center text-current">
          <Check className="h-3 w-3" />
        </div>
      )}
    </button>
  )
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
