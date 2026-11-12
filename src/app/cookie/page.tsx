import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie',
  description:
    'Cookie policy di Programmato: quali cookie utilizziamo, perché e come gestire le preferenze.',
};

export default function CookiePage() {
  return (
    <>
      <header className="page-header">
        <div className="container-page">
          <span className="pill pill-accent">Legale</span>
          <h1 className="page-title">Cookie policy</h1>
          <p className="page-lede">
            Cosa sono i cookie, quali usa Programmato e come puoi gestirli dal tuo browser.
          </p>
          <p className="mt-5 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-muted">
            Ultimo aggiornamento: novembre 2026
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container-page">
          <div className="prose-page max-w-3xl">
            <h2>1. Cosa sono i cookie</h2>
            <p>
              I cookie sono piccoli file di testo che un sito salva nel browser dell’utente.
              Servono a far funzionare il sito, ricordare preferenze o raccogliere informazioni
              statistiche. Tecnologie analoghe (local storage, pixel) sono trattate allo stesso
              modo in questa informativa.
            </p>

            <h2>2. Cookie utilizzati</h2>
            <p>
              Programmato è progettato per funzionare con il minor numero possibile di cookie.
              Le categorie utilizzate sono:
            </p>
            <ul>
              <li>
                <strong>Cookie tecnici necessari:</strong> indispensabili per la sicurezza e
                per il corretto funzionamento delle pagine. Non richiedono consenso.
              </li>
              <li>
                <strong>Preferenze:</strong> memorizzano scelte dell’utente, come il consenso
                alla newsletter o impostazioni di visualizzazione.
              </li>
              <li>
                <strong>Statistiche anonime:</strong> se attive, raccolgono dati aggregati
                sull’uso del sito senza identificare il singolo utente. Vengono attivate solo
                con il consenso, ove richiesto.
              </li>
            </ul>
            <p>
              Non utilizziamo cookie di profilazione pubblicitaria di prima parte. Eventuali
              incorporamenti di terze parti (per esempio video o repository esterni) possono
              impostare cookie propri: in quel caso valgono le informative dei rispettivi
              fornitori.
            </p>

            <h2>3. Gestire le preferenze</h2>
            <p>
              Puoi gestire o eliminare i cookie dalle impostazioni del tuo browser. Puoi anche
              navigare in modalità privata o bloccare i cookie di terze parti. Tieni presente
              che il blocco dei cookie tecnici può compromettere alcune funzionalità del sito.
            </p>
            <p>
              Per revocare il consenso a strumenti statistici o di marketing, usa le
              impostazioni del browser o i link di opt-out dei singoli fornitori.
            </p>

            <h2>4. Newsletter</h2>
            <p>
              L’iscrizione alla newsletter non dipende dai cookie: il consenso viene raccolto
              esplicitamente nel form. La disiscrizione è possibile tramite il link presente in
              ogni email.
            </p>

            <h2>5. Contatti</h2>
            <p>
              Per domande sui cookie scrivi a{' '}
              <a href="mailto:privacy@programmato.it">privacy@programmato.it</a>. Per il
              trattamento dei dati personali consulta la{' '}
              <a href="/privacy">privacy policy</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
