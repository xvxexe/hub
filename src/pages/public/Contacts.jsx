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
