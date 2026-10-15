import { Hero } from "@/components/Hero";
import { ContentGrid } from "@/components/ContentGrid";
import { OutletsSection } from "@/components/OutletsSection";
import { fetchLatestPosts } from "@/lib/api";
import { PORTAL_DOMAIN_NAMES, PORTAL_DOMAINS } from "@/lib/config";

export default async function Home() {
  const posts = await fetchLatestPosts({ domains: PORTAL_DOMAIN_NAMES, pageSize: 9 });

  return (
    <main>
      <Hero />

      <section className="section" id="ultimi-contenuti">
        <div className="container">
          <div className="section-head">
            <span className="section-tag">{"// Ultimi contenuti"}</span>
            <h2>Dalle nostre testate</h2>
            <p>Gli ultimi articoli pubblicati, aggregati in tempo reale da tutta la rete.</p>
          </div>
          <ContentGrid posts={posts} />
        </div>
      </section>

      <OutletsSection />

      <section className="section" id="chi-siamo" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <span className="section-tag">{"// Chi siamo"}</span>
            <h2>Un&apos;unica infrastruttura editoriale</h2>
            <p style={{ maxWidth: 640, margin: "10px auto 0" }}>
              Progettiamo e sviluppiamo portali editoriali indipendenti, condividendo tra
              le testate la stessa infrastruttura: un&apos;API REST comune, un database
              multi-dominio e un backoffice per gestire i contenuti di ogni sito.
            </p>
          </div>
          <div className="about-grid">
            <div className="about-stat">
              <strong>{PORTAL_DOMAINS.length}</strong>
              <span>testate attive</span>
            </div>
            <div className="about-stat">
              <strong>1</strong>
              <span>API condivisa</span>
            </div>
            <div className="about-stat">
              <strong>1</strong>
              <span>database multi-dominio</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
