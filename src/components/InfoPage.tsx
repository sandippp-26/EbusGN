import { useEffect, useState, type FormEvent } from 'react';
import { getIssueTypeLabel, type PublicDictionary } from '../lib/publicI18n';
import { submitPublicComplaint, type TransitDataset } from '../lib/transitService';
import {
  getCooldownRemainingSeconds,
  type AppLanguage,
  type IssueType,
} from '../lib/transitUtils';

const COOLDOWN_STORAGE_KEY = 'gb_complaint_last_submit_ms';
const COOLDOWN_SECONDS = 60;

interface InfoPageProps {
  t: PublicDictionary;
  lang: AppLanguage;
  dataset: TransitDataset;
}

export function InfoPage({ t, lang, dataset }: InfoPageProps) {
  const [issueType, setIssueType] = useState<IssueType>('wrong_timing');
  const [routeOrStopName, setRouteOrStopName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [cooldownSec, setCooldownSec] = useState<number>(() => {
    try {
      const stored = Number(window.localStorage.getItem(COOLDOWN_STORAGE_KEY) || 0);
      return getCooldownRemainingSeconds(stored, Date.now(), COOLDOWN_SECONDS);
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const timer = window.setInterval(() => {
      try {
        const stored = Number(window.localStorage.getItem(COOLDOWN_STORAGE_KEY) || 0);
        setCooldownSec(getCooldownRemainingSeconds(stored, Date.now(), COOLDOWN_SECONDS));
      } catch {
        setCooldownSec((prev) => Math.max(0, prev - 1));
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownSec]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (cooldownSec > 0) return;

    const cleanTarget = routeOrStopName.trim();
    const cleanDesc = description.trim();
    if (cleanTarget.length < 2 || cleanDesc.length < 10) {
      setErrorMsg(t.complaintValidationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitPublicComplaint({
        issueType,
        routeOrStopName: cleanTarget,
        description: cleanDesc,
        lang,
      });

      if (!result.ok || !result.referenceNumber) {
        if (result.cooldownSeconds && result.cooldownSeconds > 0) {
          const untilMs = Date.now() - (COOLDOWN_SECONDS - result.cooldownSeconds) * 1000;
          try {
            window.localStorage.setItem(COOLDOWN_STORAGE_KEY, String(untilMs));
          } catch {
            // ignore storage errors
          }
          setCooldownSec(result.cooldownSeconds);
        } else {
          setErrorMsg(t.complaintServerError);
        }
        return;
      }

      const nowMs = Date.now();
      try {
        window.localStorage.setItem(COOLDOWN_STORAGE_KEY, String(nowMs));
      } catch {
        // ignore storage errors
      }
      setCooldownSec(COOLDOWN_SECONDS);
      setSubmittedRef(result.referenceNumber);
      setRouteOrStopName('');
      setDescription('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const issueTypes: IssueType[] = ['wrong_route', 'wrong_stop', 'wrong_timing', 'other'];

  return (
    <div>
      <section className="border-b border-neutral-300 bg-white">
        <div className="mx-auto max-w-5xl px-3 py-4 sm:px-5">
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
            {t.infoPageTitle}
          </h1>
          <p className="mt-0.5 text-sm text-neutral-700">{t.infoPageSubtitle}</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-4 px-3 py-4 sm:px-5">
        <section className="border border-neutral-300 border-l-4 border-l-[#0F3D2E] bg-white p-4">
          <div className="flex items-start gap-3.5">
            <img
              src="/assets/aistudio/gandhinagar_bus_logo_ef8ba37c.jpg"
              alt={t.brandTitle}
              referrerPolicy="no-referrer"
              className="h-14 w-14 shrink-0 border border-neutral-300 bg-[#FAF3E6] object-contain"
            />
            <div>
              <h2 className="text-base font-bold text-neutral-900">{t.aboutSectionTitle}</h2>
              <p className="mt-1 text-sm font-bold text-neutral-900">{t.aboutPublisherLine}</p>
              <p className="mt-1 text-sm leading-snug text-neutral-700">{t.aboutScopeBody}</p>
            </div>
          </div>

          <div className="mt-3 border-t border-neutral-300 pt-3">
            <h3 className="text-xs font-bold text-neutral-900">{t.dataSourcesSectionTitle}</h3>
            {dataset.dataSources.length === 0 ? (
              <p className="mt-1 text-sm text-neutral-600">{t.noDataSourcesListed}</p>
            ) : (
              <ul className="mt-1.5 space-y-1 text-sm text-neutral-800 list-disc pl-5">
                {dataset.dataSources.map((src) => (
                  <li key={src.id}>
                    <span>{src.name}</span>
                    {src.sourceType ? <span className="text-neutral-600"> · {src.sourceType}</span> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="border border-neutral-300 border-l-4 border-l-[#1E3A8A] bg-white p-4">
          <h2 className="text-base font-bold text-neutral-900">{t.dpdpSectionTitle}</h2>
          <p className="mt-1.5 text-sm leading-snug text-neutral-800">{t.dpdpBody1}</p>
          <p className="mt-1.5 text-sm leading-snug text-neutral-800">{t.dpdpBody2}</p>
        </section>

        <section className="border border-neutral-300 border-l-4 border-l-amber-700 bg-white p-4">
          <h2 className="text-base font-bold text-neutral-900">{t.complaintSectionTitle}</h2>
          <p className="mt-1 text-sm text-neutral-700">{t.complaintSectionSubtitle}</p>
          <p className="mt-2 border border-amber-400 bg-amber-50 px-3 py-2 text-xs font-semibold text-neutral-900">
            {t.complaintNoticeBeforeSubmit}
          </p>

          {submittedRef && (
            <div
              role="status"
              className="mt-3 border border-[#0F3D2E] bg-emerald-50 px-3.5 py-2.5 text-sm text-neutral-900"
            >
              <p className="font-bold text-[#0F3D2E]">{t.complaintSuccessTitle}</p>
              <p className="mt-1 text-xs">
                <span>{t.complaintRefLabel}: </span>
                <strong className="font-mono text-sm tabular-nums">{submittedRef}</strong>
              </p>
              <p className="mt-0.5 text-xs text-neutral-800">{t.complaintPendingReviewNote}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-3 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="issue-type-select" className="block text-xs font-bold text-neutral-900">
                  {t.issueTypeLabel}
                </label>
                <select
                  id="issue-type-select"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as IssueType)}
                  className="mt-1 min-h-[40px] w-full rounded-none border border-neutral-400 bg-white px-3 py-1.5 text-sm text-neutral-900 focus:border-[#0F3D2E] focus:outline-2 focus:outline-offset-0 focus:outline-[#0F3D2E]"
                >
                  {issueTypes.map((type) => (
                    <option key={type} value={type}>
                      {getIssueTypeLabel(type, t)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="route-stop-input" className="block text-xs font-bold text-neutral-900">
                  {t.routeOrStopInputLabel}
                </label>
                <input
                  id="route-stop-input"
                  type="text"
                  maxLength={120}
                  value={routeOrStopName}
                  onChange={(e) => setRouteOrStopName(e.target.value)}
                  placeholder={t.routeOrStopInputPlaceholder}
                  className="mt-1 min-h-[40px] w-full rounded-none border border-neutral-400 bg-white px-3 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-[#0F3D2E] focus:outline-2 focus:outline-offset-0 focus:outline-[#0F3D2E]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="problem-desc-input" className="block text-xs font-bold text-neutral-900">
                {t.problemDescLabel}
              </label>
              <textarea
                id="problem-desc-input"
                rows={3}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.problemDescPlaceholder}
                className="mt-1 w-full rounded-none border border-neutral-400 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-[#0F3D2E] focus:outline-2 focus:outline-offset-0 focus:outline-[#0F3D2E]"
              />
            </div>

            {errorMsg && (
              <p role="alert" className="text-xs font-bold text-red-700">
                {errorMsg}
              </p>
            )}

            {cooldownSec > 0 && (
              <p className="text-xs font-semibold text-neutral-700 tabular-nums">
                {t.cooldownActivePrefix} {cooldownSec} {t.cooldownActiveSuffix}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || cooldownSec > 0}
              className="inline-flex min-h-[40px] items-center justify-center rounded-xs bg-neutral-900 px-5 py-2 text-sm font-bold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            >
              {isSubmitting ? t.submittingComplaintButton : t.submitComplaintButton}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
