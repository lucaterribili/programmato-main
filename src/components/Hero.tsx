import { PORTAL_DOMAINS } from "@/lib/config";

function formatOutletList(labels: string[]): string {
  if (labels.length <= 1) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} e ${labels[labels.length - 1]}`;
}

export function Hero() {
  const outlets = formatOutletList(PORTAL_DOMAINS.map((d) => d.label));

  return (
    <section className="hero">
      <div className="container">
        <span className="eyebrow">
          <span className="eyebrow-dot" />
          Un solo backend, molte testate
        </span>
        <h1>
          Il portale che unisce
          <br />
          <span className="accent">le nostre testate.</span>
        </h1>
        <p>
          Programmato è la rete editoriale che raccoglie {outlets}: contenuti
          indipendenti, temi diversi, un&apos;unica infrastruttura editoriale condivisa.
        </p>
      </div>
    </section>
  );
}
