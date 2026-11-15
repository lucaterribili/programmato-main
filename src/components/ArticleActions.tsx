'use client';

import { useEffect, useState } from 'react';
import { BookOpen, FileDown, Loader2, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n/client';

interface ArticleActionsProps {
  title: string;
  /** URL canonico assoluto della pagina (finisce nell'intestazione del PDF). */
  url: string;
  /** Id del contenitore del testo (per l'esportazione PDF). */
  contentId: string;
  publishedAt?: string | null;
}

/**
 * Modalità lettura ed esportazione PDF di un articolo. La lettura mette la classe `reader-mode` su <html>: le regole stanno
 * in globals.css e nascondono intestazione, barra laterale, correlati e piè di pagina. Il PDF si costruisce nel browser,
 * dal testo che si sta leggendo (jsPDF si scarica solo al clic).
 */
export function ArticleActions({ title, url, contentId, publishedAt }: ArticleActionsProps) {
  const { locale, messages } = useI18n();
  const t = messages.actions;
  const [readerMode, setReaderMode] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('reader-mode', readerMode);
    return () => root.classList.remove('reader-mode');
  }, [readerMode]);

  const exportPdf = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const { exportContentToPdf } = await import('@/lib/pdf');
      await exportContentToPdf({ title, url, contentId, publishedAt, locale });
    } catch (error) {
      console.error("Errore durante l'esportazione PDF:", error);
      setExportError(t.exportError);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      {readerMode && (
        <button type="button" onClick={() => setReaderMode(false)} className="reader-exit">
          <X size={16} aria-hidden="true" />
          {t.exitReader}
        </button>
      )}

      <div className="article-actions" data-reader-hide>
        <button
          type="button"
          onClick={() => setReaderMode((active) => !active)}
          aria-pressed={readerMode}
          className="article-action"
        >
          <BookOpen size={16} aria-hidden="true" />
          {t.readerMode}
        </button>

        <button type="button" onClick={exportPdf} disabled={exporting} className="article-action">
          {exporting ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <FileDown size={16} aria-hidden="true" />
          )}
          {exporting ? t.generating : t.exportPdf}
        </button>

        {exportError && (
          <span className="text-xs text-red-600" role="alert">
            {exportError}
          </span>
        )}
      </div>
    </>
  );
}
