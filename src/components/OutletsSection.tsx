import { PORTAL_DOMAINS } from "@/lib/config";

export function OutletsSection() {
  return (
    <section className="section" id="testate">
      <div className="container">
        <div className="section-head">
          <span className="section-tag">{"// Le nostre testate"}</span>
          <h2>Una rete, tanti temi</h2>
          <p>Ogni testata ha un&apos;identità propria, costruita sulla stessa infrastruttura editoriale.</p>
        </div>
        <div className="grid">
          {PORTAL_DOMAINS.map((outlet) => (
            <div key={outlet.domain} className={`outlet-card ${outlet.theme}`}>
              <div className="outlet-mark" />
              <div>
                <h3>{outlet.label}</h3>
                <span className="outlet-tagline">{outlet.tagline}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
