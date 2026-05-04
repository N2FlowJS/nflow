import React, { useEffect, useRef, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface NumberInputProps {
  value?: string | number;
  onChange: (val: number | string) => void;
  step?: number;
  min?: number;
  max?: number;
  className?: string;
  name?: string;
  onFocus?: () => void;
  inputRef?: (el: HTMLInputElement | null) => void;
}

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  step = 1,
  min,
  max,
  className,
  name,
  onFocus,
  inputRef,
}) => {
  const [internal, setInternal] = useState<string>(() => (value ?? '').toString());
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setInternal(value === undefined || value === null ? '' : String(value));
  }, [value]);

  useEffect(() => {
    if (inputRef) inputRef(ref.current);
  }, [ref.current]);

  const parseVal = (v: string) => {
    if (v === '' || v === '-' || v === '.' || v === '-.') return NaN;
    return v.includes('.') ? parseFloat(v) : parseInt(v, 10);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInternal(v);
    const n = parseVal(v);
    if (!Number.isNaN(n)) {
      if (min !== undefined && n < min) {
        onChange(min);
        return;
      }
      if (max !== undefined && n > max) {
        onChange(max);
        return;
      }
      onChange(n);
    } else {
      onChange(v);
    }
  };

  const inc = (dir = 1) => {
    const cur = parseVal(internal);
    const base = Number.isNaN(cur) ? 0 : cur;
    const next = +(base + dir * step).toFixed(10);
    if (max !== undefined && next > max) return;
    if (min !== undefined && next < min) return;
    setInternal(String(next));
    onChange(next);
    ref.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      inc(1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      inc(-1);
    }
  };

  const onWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    if (document.activeElement !== ref.current) return;
    e.preventDefault();
    inc(e.deltaY < 0 ? 1 : -1);
  };

  return (
    <div className="relative w-full">
      <input
        ref={(el) => {
          ref.current = el;
          if (inputRef) inputRef(el);
        }}
        name={name}
        type="number"
        value={internal}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        onWheel={onWheel}
        onFocus={onFocus}
        min={min}
        max={max}
        step={step}
        className={`${className ?? ''} no-native-spinner themed-number pr-10`}
      />

      <div className="absolute inset-y-0 right-1 flex flex-col items-center justify-center gap-[4px] z-10 pl-2 bg-transparent rounded-r-sm">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation();
            inc(1);
          }}
          aria-label="increase"
          className="h-5 w-5 flex items-center justify-center rounded-none bg-transparent text-cyber-primary/70 hover:text-cyber-primary"
        >
          <ChevronUp size={10} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation();
            inc(-1);
          }}
          aria-label="decrease"
          className="h-5 w-5 flex items-center justify-center rounded-none bg-transparent text-cyber-primary/70 hover:text-cyber-primary"
        >
          <ChevronDown size={10} />
        </button>
      </div>
    </div>
  );
};

export default NumberInput;
