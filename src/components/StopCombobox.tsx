import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown, MapPin, X } from 'lucide-react';
import type { PublicDictionary } from '../lib/publicI18n';
import { filterStopsForAutocomplete, type TransitStop } from '../lib/transitUtils';

interface StopComboboxProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (nextVal: string) => void;
  stops: TransitStop[];
  t: PublicDictionary;
  connectionReady: boolean;
}

export function StopCombobox({
  id,
  label,
  placeholder,
  value,
  onChange,
  stops,
  t,
  connectionReady,
}: StopComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const matches = useMemo(() => filterStopsForAutocomplete(stops, value, 50), [stops, value]);

  useEffect(() => {
    const handleOutsidePointer = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('pointerdown', handleOutsidePointer);
    return () => document.removeEventListener('pointerdown', handleOutsidePointer);
  }, []);

  const handleSelectStop = (stopName: string) => {
    onChange(stopName);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(0);
      } else if (matches.length > 0) {
        setActiveIndex((prev) => (prev + 1) % matches.length);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen && matches.length > 0) {
        setActiveIndex((prev) => (prev <= 0 ? matches.length - 1 : prev - 1));
      }
      return;
    }

    if (e.key === 'Enter' && isOpen && activeIndex >= 0 && activeIndex < matches.length) {
      e.preventDefault();
      handleSelectStop(matches[activeIndex].name);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full min-w-0">
      <label htmlFor={id} className="block text-xs font-bold text-neutral-900">
        {label}
      </label>

      <div className="relative mt-1 flex items-center">
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            isOpen && activeIndex >= 0 && matches[activeIndex]
              ? `${listboxId}-opt-${matches[activeIndex].id}`
              : undefined
          }
          autoComplete="off"
          value={value}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`min-h-[44px] w-full rounded-none border border-neutral-400 bg-white py-2 pl-3 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-[#0F3D2E] focus:outline-2 focus:outline-offset-0 focus:outline-[#0F3D2E] ${
            value.length > 0 ? 'pr-20' : 'pr-12'
          }`}
        />

        <div className="absolute right-0 top-0 bottom-0 flex items-center">
          {value.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(true);
                setActiveIndex(-1);
                inputRef.current?.focus();
              }}
              aria-label={t.clearInputAria}
              className="flex min-h-[44px] min-w-[40px] items-center justify-center text-neutral-600 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#0F3D2E]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            tabIndex={-1}
            aria-label={label}
            onClick={() => {
              setIsOpen((prev) => !prev);
              inputRef.current?.focus();
            }}
            className="flex min-h-[44px] min-w-[40px] items-center justify-center border-l border-neutral-300 text-neutral-700 hover:bg-neutral-100"
          >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 top-full z-30 mt-0.5 max-h-60 w-full overflow-y-auto border border-neutral-400 bg-white divide-y divide-neutral-200"
        >
          {stops.length === 0 ? (
            <div className="px-3 py-3 text-xs text-neutral-700">
              <p className="font-bold text-neutral-900">{t.emptyVerifiedDataTitle}</p>
              <p className="mt-0.5">
                {connectionReady ? t.emptyVerifiedDataDesc : t.emptyConnectionPendingDesc}
              </p>
            </div>
          ) : matches.length === 0 ? (
            <div className="px-3 py-3 text-xs text-neutral-700">{t.noMatchingStopsDropdown}</div>
          ) : (
            matches.map((stop, idx) => {
              const isHighlighted = idx === activeIndex;
              const meta = [stop.area, stop.landmark].filter(Boolean).join(' · ');
              return (
                <button
                  key={stop.id}
                  id={`${listboxId}-opt-${stop.id}`}
                  type="button"
                  role="option"
                  aria-selected={value.trim().toLowerCase() === stop.name.toLowerCase()}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectStop(stop.name)}
                  className={`flex min-h-[44px] w-full items-start gap-2.5 px-3 py-2 text-left focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#0F3D2E] ${
                    isHighlighted ? 'bg-neutral-100' : 'bg-white hover:bg-neutral-50'
                  }`}
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#1E3A8A]" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-neutral-900">
                      {stop.name}
                    </span>
                    {meta && (
                      <span className="block truncate text-xs text-neutral-600">{meta}</span>
                    )}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
