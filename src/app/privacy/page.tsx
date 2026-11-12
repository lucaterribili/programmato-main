import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'Informativa sul trattamento dei dati personali degli utenti di Programmato, ai sensi del Regolamento UE 2016/679 (GDPR).',
};

export default function PrivacyPage() {
  return (
    <>
      <header className="page-header">
        <div className="container-page">
          <span className="pill pill-accent">Legale</span>
          <h1 className="page-title">Informativa privacy</h1>
          <p className="page-lede">
            Come raccogliamo, usiamo e proteggiamo i dati personali di chi legge e si iscrive
            alla newsletter di Programmato.
          </p>
          <p className="mt-5 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-muted">
            Ultimo aggiornamento: novembre 2026
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container-page">
          <div className="prose-page max-w-3xl">
            <h2>1. Titolare del trattamento</h2>
            <p>
              Il titolare del trattamento dei dati personali è la redazione di Programmato.
              Per qualsiasi richiesta relativa alla privacy puoi scrivere a{' '}
              <a href="mailto:privacy@programmato.it">privacy@programmato.it</a>.
            </p>

            <h2>2. Quali dati raccogliamo</h2>
            <p>
              Raccogliamo esclusivamente i dati necessari a erogare il servizio:
            </p>
            <ul>
              <li>
                <strong>Dati di navigazione:</strong> informazioni tecniche anonime o
                pseudonimizzate necessarie al funzionamento del sito (indirizzo IP, tipo di
                browser, pagine visitate).
              </li>
              <li>
                <strong>Dati forniti volontariamente:</strong> indirizzo email e, se indicato,
                nome, al momento dell’iscrizione alla newsletter o dell’invio di un messaggio
                alla redazione.
              </li>
              <li>
                <strong>Dati relativi alle comunicazioni:</strong> il contenuto dei messaggi
                che ci invii e i relativi metadati.
              </li>
            </ul>

            <h2>3. Finalità e base giuridica</h2>
            <p>Trattiamo i dati per le seguenti finalità:</p>
            <ul>
              <li>
                <strong>Erogazione del sito e sicurezza:</strong> interesse legittimo a
                mantenere il servizio funzionante e protetto.
              </li>
              <li>
                <strong>Newsletter:</strong> consenso esplicito dell’interessato, revocabile in
                qualsiasi momento tramite il link di disiscrizione presente in ogni email.
              </li>
              <li>
                <strong>Risposta alle richieste:</strong> esecuzione di misure precontrattuali
                o contrattuali su richiesta dell’interessato.
              </li>
              <li>
                <strong>Adempimenti di legge:</strong> obblighi legali a cui siamo soggetti.
              </li>
            </ul>

            <h2>4. Conservazione</h2>
            <p>
              I dati della newsletter sono conservati fino alla revoca del consenso. I dati di
              navigazione sono conservati per il tempo strettamente necessario alle finalità
              tecniche e di sicurezza. I messaggi inviati alla redazione sono conservati per il
              tempo necessario a gestire la richiesta e gli eventuali rapporti successivi.
            </p>

            <h2>5. Comunicazione a terzi</h2>
            <p>
              Non vendiamo né cediamo i dati personali a terzi per finalità di marketing. I
              dati possono essere trattati da fornitori tecnici (hosting, invio email,
              infrastruttura) nominati responsabili del trattamento ai sensi dell’art. 28 GDPR,
              nei limiti di quanto necessario a erogare il servizio.
            </p>

            <h2>6. Trasferimenti extra-UE</h2>
            <p>
              Qualora un fornitore tratti dati al di fuori dello Spazio Economico Europeo,
              il trasferimento avviene sulla base di garanzie adeguate previste dagli artt.
              44 e seguenti del GDPR.
            </p>

            <h2>7. I tuoi diritti</h2>
            <p>
              Puoi esercitare in qualsiasi momento i diritti previsti dagli artt. 15–22 del
              GDPR: accesso, rettifica, cancellazione, limitazione, opposizione e portabilità.
              Puoi inoltre revocare il consenso alla newsletter senza che ciò pregiudichi la
              liceità del trattamento svolto prima della revoca.
            </p>
            <p>
              Per esercitare i tuoi diritti scrivi a{' '}
              <a href="mailto:privacy@programmato.it">privacy@programmato.it</a>. Hai inoltre
              il diritto di proporre reclamo al Garante per la protezione dei dati personali.
            </p>

            <h2>8. Cookie</h2>
            <p>
              Per informazioni sui cookie utilizzati dal sito consulta la{' '}
              <a href="/cookie">cookie policy</a>.
            </p>

            <h2>9. Modifiche</h2>
            <p>
              Questa informativa può essere aggiornata per riflettere cambiamenti tecnici o
              normativi. La data di ultimo aggiornamento è indicata in cima alla pagina.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
