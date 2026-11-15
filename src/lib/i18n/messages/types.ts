/** Forme plurali: l'italiano e l'inglese usano `one`/`other`, il russo anche `few` e `many`. */
export interface Plural {
  one: string;
  few?: string;
  many?: string;
  other: string;
}

export const plural = (forms: Plural): Plural => forms;

/**
 * Allarga i letterali di una struttura a `string`: l'italiano è il modello, inglese e russo devono avere le stesse chiavi
 * (il compilatore segnala quelle mancanti).
 */
export type Widen<T> = T extends Plural
  ? Plural
  : T extends string
    ? string
    : T extends readonly (infer U)[]
      ? Widen<U>[]
      : T extends object
        ? { -readonly [K in keyof T]: Widen<T[K]> }
        : T;
