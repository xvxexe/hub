import { useState } from 'react'
import { PremiumCTA, PremiumFAQ } from '../../components/PublicComponents'
import { SEO } from '../../components/SEO'
import { publicCompanyLegalRows } from '../../data/publicRealData'

const initialForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  city: '',
  intervention: 'Cartongesso',
  message: '',
  budget: 'Da definire',
  fileName: '',
}

const contactFaq = [
  {
    question: 'Quali informazioni devo inviare per partire bene?',
    answer: 'Sono utili città, tipologia intervento, foto dello stato attuale, planimetrie se disponibili, tempi desiderati, vincoli di accesso e budget indicativo.',
  },
  {
    question: 'Posso allegare foto, planimetrie o capitolati?',
    answer: 'Sì. Puoi allegare materiale utile alla valutazione del lavoro: foto degli ambienti, planimetrie, capitolati o documenti tecnici.',
  },
  {
    question: 'Dove ha sede EuropaService?',
    answer: 'La sede legale è in VIA MARCO PERENNIO 21 - 52100 - AREZZO (AR). La società opera su cantieri in Toscana, Roma e altre zone in base al progetto.',
  },
  {
    question: 'Quanto tempo serve per ricevere una prima risposta?',
    answer: 'Dopo la richiesta valutiamo le informazioni inviate e ti ricontattiamo per chiarire obiettivi, misure, urgenza e disponibilità per eventuale sopralluogo.',
  },
]

const contactCards = [
  { icon: 'mail', title: 'PEC', value: 'europaservizi272@pec.it', detail: 'Comunicazioni ufficiali' },
  { icon: 'pin', title: 'Sede legale', value: 'VIA MARCO PERENNIO 21', detail: '52100 - AREZZO (AR)' },
  { icon: 'phone', title: 'Contatti', value: 'Richiesta preventivo', detail: 'Risposta dopo valutazione dei dettagli' },
  { icon: 'globe', title: 'Area operativa', value: 'Arezzo · Toscana · Roma', detail: 'Cantieri valutati su richiesta' },
  { icon: 'clock', title: 'Sopralluoghi', value: 'Su appuntamento', detail: 'Valutazione tecnica del lavoro' },
]

const nextSteps = [
  ['01', 'Ricezione richiesta', 'Analizziamo le informazioni ricevute e individuiamo i primi punti da chiarire.'],
  ['02', 'Primo contatto', 'Verifichiamo obiettivi, tempi, misure, accessi e disponibilità per il sopralluogo.'],
  ['03', 'Valutazione tecnica', 'Controlliamo materiali, superfici, vincoli e complessità dell’intervento.'],
  ['04', 'Proposta operativa', 'Definiamo lavorazioni, priorità, tempistiche e prossimi passaggi.'],
]

const contactPageStyles = `
.contact-page-redesign {
  background: linear-gradient(180deg, #f7f8fb 0%, #fff 42%, #f7f8fb 100%);
  color: var(--pub-ink);
}

.contact-shell {
  width: min(100%, var(--pub-max));
  margin-inline: auto;
  padding-inline: clamp(1rem, 3vw, 1.25rem);
}

.contact-hero-panel {
  padding: clamp(4rem, 7vw, 6.5rem) 0 clamp(1.75rem, 4vw, 3rem);
  overflow: hidden;
}

.contact-hero-copy {
  display: grid;
  gap: 1rem;
  max-width: calc(var(--pub-max) + 2.5rem);
}

.contact-hero-copy > * {
  max-width: 760px;
}

.contact-hero-copy h1 {
  margin: 0;
  color: var(--pub-ink);
  font-size: clamp(2.65rem, 7.4vw, 5rem);
  line-height: 0.96;
  letter-spacing: -0.055em;
  font-weight: 900;
}

.contact-hero-copy > p:not(.premium-eyebrow) {
  margin: 0;
  color: var(--pub-text);
  font-size: clamp(1.04rem, 2.2vw, 1.22rem);
  line-height: 1.62;
  font-weight: 650;
}

.contact-section-tight {
  padding-block: clamp(1.3rem, 3.5vw, 2.1rem);
}

.contact-section-spaced {
  padding-block: clamp(2rem, 5vw, 3.5rem);
}

.contact-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 0.85rem;
}

.contact-info-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.9rem;
  align-items: center;
  min-height: 5.2rem;
  padding: 1rem;
  border: 1px solid var(--pub-line);
  border-radius: 1.25rem;
  background: #fff;
  box-shadow: var(--pub-shadow);
}

.contact-icon {
  display: inline-grid;
  width: 2.65rem;
  height: 2.65rem;
  place-items: center;
  border-radius: 999px;
  background: #f0f5ff;
  color: #1f57a4;
}

.contact-info-card h3,
.contact-step-card h3 {
  margin: 0;
  color: var(--pub-ink);
  font-size: 1rem;
  line-height: 1.2;
  font-weight: 900;
}

.contact-info-card strong {
  display: block;
  margin-top: 0.2rem;
  color: #203047;
  font-size: clamp(0.96rem, 1.9vw, 1.02rem);
  line-height: 1.35;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.contact-info-card p,
.contact-step-card p,
.contact-company-head p,
.contact-bottom-cta p {
  margin: 0;
  color: var(--pub-muted);
  font-size: clamp(0.92rem, 1.8vw, 1rem);
  line-height: 1.52;
  font-weight: 650;
}

.contact-company-panel,
.contact-bottom-cta {
  display: grid;
  gap: 1rem;
  padding: clamp(1.1rem, 3vw, 1.6rem);
  border: 1px solid var(--pub-line);
  border-radius: 1.5rem;
  background: #fff;
  box-shadow: var(--pub-shadow);
}

.contact-company-head {
  display: grid;
  gap: 0.35rem;
}

.contact-company-head h2,
.contact-steps-heading h2,
.contact-bottom-cta h2,
.contact-request-intro h2 {
  margin: 0;
  color: var(--pub-ink);
  font-size: clamp(1.65rem, 4.4vw, 2.5rem);
  line-height: 1.04;
  letter-spacing: -0.04em;
  font-weight: 900;
}

.contact-legal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 0.6rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--pub-line);
}

.contact-legal-row {
  padding: 0.72rem 0;
  border-bottom: 1px solid rgba(226, 232, 240, 0.75);
}

.contact-legal-row span {
  display: block;
  margin-bottom: 0.28rem;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.contact-legal-row strong {
  display: block;
  color: var(--pub-ink);
  font-size: clamp(0.98rem, 2vw, 1.04rem);
  line-height: 1.35;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.contact-request-block {
  display: grid;
  grid-template-columns: minmax(280px, 0.72fr) minmax(320px, 1fr);
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 1.65rem;
  background: #fff;
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.14);
}

.contact-request-intro {
  display: grid;
  gap: 1rem;
  align-content: center;
  padding: clamp(1.4rem, 4vw, 2.1rem);
  background: radial-gradient(circle at 90% 20%, rgba(29, 78, 216, 0.2), transparent 34%), linear-gradient(135deg, #080f1f 0%, #101827 58%, #172a46 100%);
  color: #fff;
}

.contact-request-intro .premium-eyebrow {
  color: #f59e0b !important;
}

.contact-request-intro h2 {
  color: #fff;
  font-size: clamp(1.8rem, 4.8vw, 2.7rem);
}

.contact-request-intro p {
  margin: 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: clamp(1rem, 2.2vw, 1.08rem);
  line-height: 1.6;
  font-weight: 600;
}

.contact-request-intro ul {
  display: grid;
  gap: 0.55rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.contact-request-intro li {
  color: #fff;
  font-size: 1rem;
  font-weight: 750;
  line-height: 1.35;
}

.contact-request-intro li::before {
  content: '✓';
  color: #f59e0b;
  margin-right: 0.55rem;
}

.contact-pec-box {
  margin-top: 0.5rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.06);
}

.contact-pec-box strong,
.contact-pec-box span {
  display: block;
}

.contact-pec-box strong {
  color: #fff;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.contact-pec-box span {
  color: rgba(255, 255, 255, 0.76);
  font-size: 0.95rem;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.contact-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.85rem;
  padding: clamp(1.1rem, 3vw, 1.6rem);
  align-content: center;
}

.contact-form label {
  display: grid;
  gap: 0.35rem;
  color: var(--pub-ink);
  font-size: clamp(0.95rem, 1.8vw, 1rem);
  font-weight: 850;
}

.contact-form input,
.contact-form select,
.contact-form textarea {
  width: 100%;
  min-height: 3.25rem;
  border: 1px solid var(--pub-line);
  border-radius: 0.9rem;
  background: #fff;
  color: var(--pub-ink);
  padding: 0.9rem 1rem;
  font-size: 1rem;
  font-weight: 650;
}

.contact-form textarea {
  min-height: 8.5rem;
  line-height: 1.5;
  resize: vertical;
}

.contact-form-wide,
.contact-form button,
.contact-form-note,
.contact-form-success {
  grid-column: 1 / -1;
}

.contact-form button {
  min-height: 3.35rem;
  border: 0;
  border-radius: 999px;
  background: var(--pub-ink);
  color: #fff;
  font-size: 1rem;
  font-weight: 900;
  cursor: pointer;
}

.contact-form-note,
.contact-form-success {
  margin: 0;
  font-size: 1rem;
  line-height: 1.45;
  font-weight: 750;
}

.contact-form-success {
  color: #166534;
}

.contact-steps-heading {
  display: grid;
  gap: 0.5rem;
  text-align: center;
  justify-items: center;
  margin-bottom: 1.2rem;
}

.contact-steps-heading p:not(.premium-eyebrow) {
  max-width: 680px;
  margin: 0;
  color: var(--pub-muted);
  font-size: clamp(0.98rem, 2vw, 1.05rem);
  line-height: 1.6;
  font-weight: 650;
}

.contact-steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.85rem;
}

.contact-step-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.85rem;
  align-items: start;
  padding: 1rem;
  border: 1px solid var(--pub-line);
  border-radius: 1.25rem;
  background: #fff;
  box-shadow: var(--pub-shadow);
}

.contact-step-card > span {
  display: inline-grid;
  width: 2.6rem;
  height: 2.6rem;
  place-items: center;
  border-radius: 999px;
  background: #f0f5ff;
  color: #1f57a4;
  font-size: 0.78rem;
  font-weight: 900;
}

.contact-bottom-cta {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
}

@media (max-width: 760px) {
  .contact-page-redesign {
    background: #f8fafc;
  }

  .contact-shell {
    padding-inline: 1rem;
  }

  .contact-hero-panel {
    padding: 2.2rem 0 1rem;
  }

  .contact-hero-copy {
    gap: 0.75rem;
  }

  .contact-hero-copy h1 {
    font-size: clamp(2.35rem, 12vw, 3.25rem);
    line-height: 0.98;
    letter-spacing: -0.05em;
  }

  .contact-hero-copy > p:not(.premium-eyebrow) {
    font-size: 1.06rem;
    line-height: 1.55;
    font-weight: 650;
  }

  .contact-section-tight,
  .contact-section-spaced {
    padding-block: 0.8rem;
  }

  .contact-info-grid,
  .contact-steps-grid {
    grid-template-columns: 1fr;
    gap: 0.65rem;
  }

  .contact-info-card,
  .contact-step-card {
    padding: 1rem;
    border-radius: 1.05rem;
  }

  .contact-info-card h3,
  .contact-step-card h3 {
    font-size: 1.05rem;
  }

  .contact-info-card strong {
    font-size: 1rem;
  }

  .contact-info-card p,
  .contact-step-card p {
    font-size: 0.98rem;
    line-height: 1.45;
  }

  .contact-company-panel,
  .contact-bottom-cta {
    border-radius: 1.2rem;
    padding: 1.1rem;
  }

  .contact-company-head h2,
  .contact-steps-heading h2,
  .contact-bottom-cta h2 {
    font-size: clamp(1.8rem, 8vw, 2.35rem);
  }

  .contact-legal-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .contact-legal-row {
    display: grid;
    grid-template-columns: minmax(110px, 0.8fr) minmax(0, 1.2fr);
    gap: 0.75rem;
    align-items: center;
    padding: 0.72rem 0;
  }

  .contact-legal-row span {
    margin: 0;
    font-size: 0.78rem;
  }

  .contact-legal-row strong {
    font-size: 0.98rem;
    text-align: right;
  }

  .contact-request-block {
    grid-template-columns: 1fr;
    border-radius: 1.25rem;
  }

  .contact-request-intro {
    padding: 1.2rem;
    align-content: start;
  }

  .contact-request-intro h2 {
    font-size: 2rem;
    line-height: 1.02;
  }

  .contact-request-intro p,
  .contact-request-intro li {
    font-size: 1.02rem;
    line-height: 1.5;
  }

  .contact-form {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .contact-form label {
    font-size: 1rem;
  }

  .contact-form input,
  .contact-form select,
  .contact-form textarea {
    min-height: 3.35rem;
    font-size: 1.02rem;
    padding: 0.92rem 1rem;
  }

  .contact-form textarea {
    min-height: 8rem;
  }

  .contact-form button {
    min-height: 3.5rem;
    font-size: 1.06rem;
  }

  .contact-bottom-cta {
    grid-template-columns: 1fr;
  }

  .contact-bottom-cta .premium-button {
    width: 100%;
  }
}
`

export function Contacts() {
  const [form, setForm] = useState(initialForm)
  const [sent, setSent] = useState(false)

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function submit(event) {
    event.preventDefault()
    setSent(true)
  }

  return (
    <>
      <style>{contactPageStyles}</style>
      <SEO
        title="Contatti e richiesta preventivo"
        description="Parla con EUROPA SERVICE S.R.L. per edilizia, cartongesso, ristrutturazioni tecniche, finiture interne e gestione cantieri."
      />

      <main className="contact-page-redesign">
        <section className="contact-hero-panel">
          <div className="contact-shell contact-hero-copy">
            <p className="premium-eyebrow">Contatti</p>
            <h1>Contatti e richiesta preventivo</h1>
            <p>Siamo a disposizione per informazioni, sopralluoghi e preventivi. Raccontaci il progetto: ti aiuteremo a definire lavorazioni, priorità e prossimi passaggi.</p>
          </div>
        </section>

        <section className="contact-shell contact-section-tight">
          <div className="contact-info-grid">
            {contactCards.map((card) => (
              <article className="contact-info-card" key={card.title}>
                <span className="contact-icon" aria-hidden="true"><ContactIcon name={card.icon} /></span>
                <div>
                  <h3>{card.title}</h3>
                  <strong>{card.value}</strong>
                  <p>{card.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="contact-shell contact-section-tight">
          <article className="contact-company-panel">
            <div className="contact-company-head">
              <p className="premium-eyebrow">Informazioni aziendali</p>
              <h2>EUROPA SERVICE S.R.L.</h2>
              <p>Riferimenti societari ufficiali per clienti, fornitori, tecnici e amministrazioni. Per comunicazioni formali è disponibile il canale PEC indicato.</p>
            </div>
            <div className="contact-legal-grid">
              {publicCompanyLegalRows.map((row) => (
                <div className="contact-legal-row" key={row.label}>
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="contact-shell contact-section-tight" id="contatti-form">
          <div className="contact-request-block">
            <aside className="contact-request-intro">
              <p className="premium-eyebrow">Richiedi un preventivo</p>
              <h2>Parlaci del tuo progetto</h2>
              <p>Compila il modulo e descrivi le tue esigenze. Ti ricontatteremo per un primo confronto e per valutare una proposta su misura.</p>
              <ul>
                <li>Sopralluogo su richiesta</li>
                <li>Preventivi chiari e trasparenti</li>
                <li>Valutazione tecnica del lavoro</li>
              </ul>
              <div className="contact-pec-box">
                <strong>Preferisci un canale formale?</strong>
                <span>PEC: europaservizi272@pec.it</span>
              </div>
            </aside>

            <form className="contact-form" onSubmit={submit}>
              <label>Nome e cognome<input value={form.name} onChange={(event) => update('name', event.target.value)} required /></label>
              <label>Azienda<input value={form.company} onChange={(event) => update('company', event.target.value)} /></label>
              <label>Email<input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required /></label>
              <label>Telefono<input type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} required /></label>
              <label>Città<input value={form.city} onChange={(event) => update('city', event.target.value)} /></label>
              <label>
                Tipologia intervento
                <select value={form.intervention} onChange={(event) => update('intervention', event.target.value)}>
                  <option>Cartongesso</option>
                  <option>Ristrutturazioni tecniche</option>
                  <option>Finiture interne</option>
                  <option>Gestione cantiere</option>
                  <option>Manutenzioni</option>
                  <option>Supporto operativo</option>
                </select>
              </label>
              <label>
                Budget indicativo
                <select value={form.budget} onChange={(event) => update('budget', event.target.value)}>
                  <option>Da definire</option>
                  <option>Fino a 10.000 EUR</option>
                  <option>10.000 - 50.000 EUR</option>
                  <option>Oltre 50.000 EUR</option>
                </select>
              </label>
              <label>Upload allegati<input type="file" onChange={(event) => update('fileName', event.target.files?.[0]?.name ?? '')} /></label>
              <label className="contact-form-wide">Messaggio<textarea rows="6" value={form.message} onChange={(event) => update('message', event.target.value)} placeholder="Descrivi progetto, tempi, stato attuale, accessi, priorità e criticità" /></label>
              <button type="submit">Invia richiesta →</button>
              {form.fileName ? <p className="contact-form-note">Allegato selezionato: {form.fileName}</p> : null}
              {sent ? <p className="contact-form-success">Richiesta registrata. Ti ricontatteremo per i prossimi passaggi.</p> : null}
            </form>
          </div>
        </section>

        <section className="contact-shell contact-section-spaced">
          <div className="contact-steps-heading">
            <p className="premium-eyebrow">Cosa succede dopo</p>
            <h2>Il processo in 4 passaggi</h2>
            <p>Dalla prima richiesta alla proposta operativa, manteniamo il percorso chiaro e senza passaggi inutili.</p>
          </div>
          <div className="contact-steps-grid">
            {nextSteps.map(([step, title, text]) => (
              <article className="contact-step-card" key={step}>
                <span>{step}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="contact-shell contact-section-tight">
          <div className="contact-bottom-cta">
            <div>
              <p className="premium-eyebrow">Domande frequenti</p>
              <h2>Hai dubbi prima di contattarci?</h2>
              <p>Consulta le risposte principali o inviaci direttamente la tua richiesta.</p>
            </div>
            <a className="premium-button premium-button-primary" href="#/contatti">Contattaci</a>
          </div>
        </section>

        <PremiumSection eyebrow="FAQ" title="Domande prima del contatto">
          <PremiumFAQ items={contactFaq} />
        </PremiumSection>

        <PremiumCTA title="Preferisci parlare subito con noi?" text="Usa il modulo o la PEC per fissare un primo confronto operativo sul progetto." />
      </main>
    </>
  )
}

function ContactIcon({ name }) {
  const icons = {
    mail: <><path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" /></>,
    pin: <><path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.4" /></>,
    phone: <><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.2 2.5 3.2 5.5 3.2 9s-1 6.5-3.2 9c-2.2-2.5-3.2-5.5-3.2-9s1-6.5 3.2-9Z" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></>,
  }

  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[name] ?? icons.mail}
    </svg>
  )
}
