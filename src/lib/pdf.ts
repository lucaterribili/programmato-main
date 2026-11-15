/**
 * Esportazione PDF del solo contenuto principale di un articolo/tutorial.
 *
 * Il testo viene estratto dal DOM del contenitore indicato (non dal modello
 * server) così il PDF rispecchia esattamente ciò che l'utente sta leggendo:
 * niente sidebar, articoli correlati, breadcrumb o altri blocchi di pagina.
 * jsPDF viene caricato on demand per non appesantire il bundle iniziale.
 */

import {INTL_LOCALE, type Locale} from '@/lib/i18n/config';
import {format, getMessages} from '@/lib/i18n/messages';

export interface ExportPdfOptions {
    title: string;
    url: string;
    contentId: string;

    publishedAt?: string | null;
    /** Lingua della pagina: testi del PDF, formato della data e (per il russo) il font con il cirillico. */
    locale?: Locale;
}

const PAGE = {width: 210, height: 297};
const MARGIN = 18;
const FOOTER_SPACE = 12;
const CONTENT_WIDTH = PAGE.width - MARGIN * 2;

type Rgb = [number, number, number];

const COLORS = {
    text: [31, 41, 55] as Rgb,
    muted: [107, 114, 128] as Rgb,
    border: [229, 231, 235] as Rgb,
    brand: [196, 118, 10] as Rgb,
};

function slugify(value: string, fallback: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 70) || fallback;
}

function formatDate(value: string | null | undefined, locale: Locale): string | null {
    if (!value) return null;
    try {
        return new Intl.DateTimeFormat(INTL_LOCALE[locale], {day: '2-digit', month: 'long', year: 'numeric'}).format(new Date(value));
    } catch {
        return value;
    }
}

/**
 * Porta qualsiasi immagine su un URL same-origin: le immagini del CMS stanno su
 * S3 e finirebbero per "sporcare" il canvas (CORS), quindi passiamo dal
 * optimizer di Next che risponde dallo stesso dominio.
 */
function toSameOriginUrl(src: string, width = 1200): string {
    try {
        const url = new URL(src, window.location.href);
        // Le immagini già servite dall'optimizer hanno una width scelta in base
        // alla viewport: per il PDF ne chiediamo una più alta e uniforme.
        if (url.pathname === '/_next/image') {
            url.searchParams.set('w', String(width));
            url.searchParams.set('q', '75');
            return url.toString();
        }
        if (url.origin === window.location.origin) return url.toString();
        return `${window.location.origin}/_next/image?url=${encodeURIComponent(url.toString())}&w=${width}&q=75`;
    } catch {
        return src;
    }
}

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Immagine non caricabile: ${src}`));
        img.src = src;
    });
}

async function imageToJpeg(src: string, maxWidth = 1200): Promise<{ dataUrl: string; width: number; height: number; naturalWidth: number } | null> {
    try {
        const img = await loadImage(toSameOriginUrl(src, maxWidth));
        if (!img.naturalWidth || !img.naturalHeight) return null;

        const scale = Math.min(1, maxWidth / img.naturalWidth);
        const width = Math.round(img.naturalWidth * scale);
        const height = Math.round(img.naturalHeight * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Il JPEG non supporta la trasparenza: fondo bianco per evitare aloni neri.
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        return {dataUrl: canvas.toDataURL('image/jpeg', 0.85), width, height, naturalWidth: img.naturalWidth};
    } catch {
        // Un'immagine che non si carica non deve bloccare l'esportazione.
        return null;
    }
}

/**
 * I font base di jsPDF (Helvetica, Courier) non hanno il cirillico: per il russo si incorporano Liberation Sans/Mono
 * (metriche di Arial/Courier New, licenza SIL OFL), già ridotti a latino + cirillico e serviti da /fonts. Si scaricano
 * solo quando serve.
 */
const CYRILLIC_FONTS: Array<[file: string, family: string, style: 'normal' | 'bold' | 'italic']> = [
    ['LiberationSans-Regular.ttf', 'LiberationSans', 'normal'],
    ['LiberationSans-Bold.ttf', 'LiberationSans', 'bold'],
    ['LiberationSans-Italic.ttf', 'LiberationSans', 'italic'],
    ['LiberationMono-Regular.ttf', 'LiberationMono', 'normal'],
];

function toBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return btoa(binary);
}

type PdfDoc = InstanceType<(typeof import('jspdf'))['jsPDF']>;

async function registerCyrillicFonts(doc: PdfDoc): Promise<void> {
    await Promise.all(
        CYRILLIC_FONTS.map(async ([file, family, style]) => {
            const response = await fetch(`/fonts/${file}`);
            if (!response.ok) throw new Error(`Font non disponibile: ${file}`);
            doc.addFileToVFS(file, toBase64(await response.arrayBuffer()));
            doc.addFont(file, family, style);
        }),
    );
}

export async function exportContentToPdf({title, url, contentId, publishedAt, locale = 'it'}: ExportPdfOptions): Promise<void> {
    const container = document.getElementById(contentId);
    if (!container) throw new Error('Contenuto non trovato');

    const text = getMessages(locale).common;
    const {jsPDF} = await import('jspdf');
    const doc = new jsPDF({unit: 'mm', format: 'a4', compress: true});

    const cyrillic = locale === 'ru';
    if (cyrillic) await registerCyrillicFonts(doc);
    const SANS = cyrillic ? 'LiberationSans' : 'helvetica';
    const MONO = cyrillic ? 'LiberationMono' : 'courier';

    let y = MARGIN;

    const ensureSpace = (needed: number) => {
        if (y + needed > PAGE.height - MARGIN - FOOTER_SPACE) {
            doc.addPage();
            y = MARGIN;
        }
    };

    interface TextOptions {
        size?: number;
        style?: 'normal' | 'bold' | 'italic';
        color?: Rgb;
        indent?: number;
        before?: number;
        after?: number;
        font?: 'sans' | 'mono';
    }

    const addText = (raw: string, options: TextOptions = {}) => {
        const text = raw.replace(/\s+/g, ' ').trim();
        if (!text) return;

        const size = options.size ?? 10.5;
        const indent = options.indent ?? 0;
        const lineHeight = size * 0.3528 * 1.4;

        doc.setFont(options.font === 'mono' ? MONO : SANS, options.style ?? 'normal');
        doc.setFontSize(size);
        doc.setTextColor(...(options.color ?? COLORS.text));

        const lines = doc.splitTextToSize(text, CONTENT_WIDTH - indent) as string[];
        y += options.before ?? 0;

        for (const line of lines) {
            ensureSpace(lineHeight);
            doc.text(line, MARGIN + indent, y);
            y += lineHeight;
        }

        y += options.after ?? 1.5;
    };

    const addCode = (raw: string) => {
        const text = raw.replace(/\t/g, '    ').replace(/\s+$/, '');
        if (!text.trim()) return;

        const size = 8;
        const lineHeight = size * 0.3528 * 1.35;
        doc.setFont(MONO, 'normal');
        doc.setFontSize(size);
        doc.setTextColor(...COLORS.text);

        const lines: string[] = [];
        for (const line of text.split('\n')) {
            lines.push(...(doc.splitTextToSize(line || ' ', CONTENT_WIDTH - 8) as string[]));
        }

        y += 2;
        for (const line of lines) {
            ensureSpace(lineHeight);
            doc.text(line, MARGIN + 4, y);
            y += lineHeight;
        }
        y += 3;
    };

    /**
     * Le immagini del testo. Quelle piccolissime (icone, emoji, separatori) si saltano: la misura si legge dopo il
     * caricamento, non dal DOM, perché le immagini «lazy» non ancora scorse nella pagina risultano larghe 0.
     */
    const addImage = async (src: string, maxHeight: number, minNaturalWidth = 0) => {
        const image = await imageToJpeg(src);
        if (!image || image.naturalWidth < minNaturalWidth) return;

        const ratio = image.height / image.width;
        let drawWidth = CONTENT_WIDTH;
        let drawHeight = drawWidth * ratio;
        if (drawHeight > maxHeight) {
            drawHeight = maxHeight;
            drawWidth = drawHeight / ratio;
        }

        ensureSpace(drawHeight + 5);
        const x = MARGIN + (CONTENT_WIDTH - drawWidth) / 2;
        doc.addImage(image.dataUrl, 'JPEG', x, y, drawWidth, drawHeight);
        y += drawHeight + 5;
    };

    // Intestazione
    doc.setFont(SANS, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.brand);
    doc.text(`Programmato — ${text.header.topbarNote}`, MARGIN, y);
    y += 7;

    addText(title, {size: 20, style: 'bold', after: 2});

    const meta = [formatDate(publishedAt, locale), url].filter(Boolean).join('  ·  ');
    if (meta) addText(meta, {size: 8.5, color: COLORS.muted, after: 4});

    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, PAGE.width - MARGIN, y);
    y += 6;



    interface WalkState {
        depth: number;
    }

    const addList = async (list: Element, state: WalkState) => {
        const ordered = list.tagName.toLowerCase() === 'ol';
        const items = Array.from(list.children).filter((child) => child.tagName.toLowerCase() === 'li');

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const clone = item.cloneNode(true) as Element;
            clone.querySelectorAll('ul, ol').forEach((nested) => nested.remove());
            const text = (clone.textContent ?? '').replace(/\s+/g, ' ').trim();
            if (text) {
                addText(`${ordered ? `${i + 1}.` : '•'} ${text}`, {
                    indent: 4 + state.depth * 5,
                    after: 0.8,
                });
            }

            for (const nested of Array.from(item.children)) {
                if (['ul', 'ol'].includes(nested.tagName.toLowerCase())) {
                    await addList(nested, {depth: state.depth + 1});
                }
            }
        }
        y += 1.5;
    };

    const addTable = (table: Element) => {
        const rows = Array.from(table.querySelectorAll('tr'));
        for (const row of rows) {
            const cells = Array.from(row.querySelectorAll('th, td'))
                .map((cell) => (cell.textContent ?? '').replace(/\s+/g, ' ').trim())
                .filter(Boolean);
            if (cells.length === 0) continue;
            addText(cells.join('  |  '), {
                size: 9,
                style: row.querySelector('th') ? 'bold' : 'normal',
                after: 0.6,
            });
        }
        y += 2;
    };

    const walk = async (element: Element, state: WalkState): Promise<void> => {
        const tag = element.tagName.toLowerCase();

        if (['script', 'style', 'button', 'nav', 'svg'].includes(tag)) return;
        if (element.classList.contains('copy-icon') || element.classList.contains('copy-feedback')) return;

        switch (tag) {
            case 'h1':
                addText(element.textContent ?? '', {size: 17, style: 'bold', before: 4, after: 2.5});
                return;
            case 'h2':
                addText(element.textContent ?? '', {size: 14.5, style: 'bold', before: 4, after: 2});
                return;
            case 'h3':
                addText(element.textContent ?? '', {size: 12.5, style: 'bold', before: 3, after: 1.5});
                return;
            case 'h4':
            case 'h5':
            case 'h6':
                addText(element.textContent ?? '', {size: 11.5, style: 'bold', before: 3, after: 1.5});
                return;
            case 'p': {
                // Il Markdown mette le immagini dentro un <p>: il testo e le immagini vanno nell'ordine in cui compaiono
                if (element.querySelector('img')) {
                    let pending = '';
                    const flush = () => {
                        if (pending.trim()) addText(pending, {size: 10.5, after: 2.5});
                        pending = '';
                    };
                    for (const node of Array.from(element.childNodes)) {
                        const el = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : null;
                        const target = el
                            ? ((el.tagName.toLowerCase() === 'img' ? el : el.querySelector('img')) as HTMLImageElement | null)
                            : null;
                        if (target) {
                            flush();
                            await addImage(target.currentSrc || target.src, 110, 220);
                        } else {
                            pending += node.textContent ?? '';
                        }
                    }
                    flush();
                    return;
                }
                addText(element.textContent ?? '', {size: 10.5, after: 2.5});
                return;
            }
            case 'pre':
                addCode((element as HTMLElement).innerText ?? element.textContent ?? '');
                return;
            case 'blockquote':
                addText(element.textContent ?? '', {size: 10.5, style: 'italic', indent: 6, color: COLORS.muted, after: 2.5});
                return;
            case 'ul':
            case 'ol':
                await addList(element, state);
                return;
            case 'table':
                addTable(element);
                return;
            case 'hr':
                ensureSpace(4);
                doc.setDrawColor(...COLORS.border);
                doc.line(MARGIN, y, PAGE.width - MARGIN, y);
                y += 4;
                return;
            case 'img': {
                const img = element as HTMLImageElement;
                await addImage(img.currentSrc || img.src, 110, 220);
                return;
            }
            case 'figure': {
                for (const child of Array.from(element.children)) {
                    await walk(child, state);
                }
                const caption = element.querySelector('figcaption');
                if (caption) addText(caption.textContent ?? '', {size: 8.5, color: COLORS.muted, after: 2});
                return;
            }
            default: {
                if (element.children.length > 0) {
                    for (const child of Array.from(element.children)) {
                        await walk(child, state);
                    }
                } else {
                    addText(element.textContent ?? '', {size: 10.5, after: 1.5});
                }
            }
        }
    };

    await walk(container, {depth: 0});

    // Footer su ogni pagina
    const totalPages = doc.getNumberOfPages();
    for (let page = 1; page <= totalPages; page++) {
        doc.setPage(page);
        doc.setFont(SANS, 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.muted);
        doc.text('programmato.it', MARGIN, PAGE.height - 8);
        doc.text(format(text.actions.pdfPage, {p: page, n: totalPages}), PAGE.width - MARGIN, PAGE.height - 8, {align: 'right'});
    }

    doc.save(`${slugify(title, text.actions.pdfFile)}.pdf`);
}
