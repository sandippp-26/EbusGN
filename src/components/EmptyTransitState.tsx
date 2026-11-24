import type { PublicDictionary } from '../lib/publicI18n';

interface EmptyTransitStateProps {
  t: PublicDictionary;
  connectionReady: boolean;
  customMessage?: string;
}

export function EmptyTransitState({
  t,
  connectionReady,
  customMessage,
}: EmptyTransitStateProps) {
  return (
    <div className="border border-neutral-300 border-l-4 border-l-neutral-600 bg-neutral-50 px-4 py-4 text-left">
      <h3 className="text-sm font-bold text-neutral-900">{t.emptyVerifiedDataTitle}</h3>
      <p className="mt-1 text-sm leading-snug text-neutral-700">
        {customMessage ??
          (connectionReady ? t.emptyVerifiedDataDesc : t.emptyConnectionPendingDesc)}
      </p>
    </div>
  );
}
