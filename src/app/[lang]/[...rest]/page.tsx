import { notFound } from 'next/navigation';

/** Qualunque percorso che non corrisponde a una pagina: 404 (con layout, intestazione e piè di pagina nella lingua). */
export default function CatchAll(): never {
  notFound();
}
