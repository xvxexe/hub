import { useState } from 'react'
import {
  PremiumCTA,
  PremiumFAQ,
} from '../../components/PublicComponents'
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

const page = {
  wrap: {
    background: 'linear-gradient(180deg, #f7f8fb 0%, #ffffff 42%, #f7f8fb 100%)',
  },
  shell: {
    width: 'min(100%, var(--pub-max))',
    marginInline: 'auto',
    paddingInline: 'clamp(1rem, 3vw, 1.25rem)',
  },
  hero: {
    padding: 'clamp(4rem, 7vw, 6.5rem) 0 clamp(1.75rem, 4vw, 3rem)',
    position: 'relative',
    overflow: 'hidden',
  },
  heroInner: {
    display: 'grid',
    gap: '1rem',
    maxWidth: '760px',
  },
  eyebrow: {
    margin: 0,
    color: 'var(--pub-accent)',
    fontSize: 'clamp(0.78rem, 1.5vw, 0.86rem)',
    fontWeight: 900,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  h1: {
    margin: 0,
    color: 'var(--pub-ink)',
    fontSize: 'clamp(2.65rem, 7.4vw, 5rem)',
    lineHeight: 0.96,
    letterSpacing: '-0.055em',
    fontWeight: 900,
  },
  lead: {
    margin: 0,
    maxWidth: '680px',
    color: 'var(--pub-text)',
    fontSize: 'clamp(1.04rem, 2.2vw, 1.22rem)',
    lineHeight: 1.62,
    fontWeight: 650,
  },
  section: {
    padding: 'clamp(1.3rem, 3.5vw, 2.1rem) 0',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '0.85rem',
  },
  infoCard: {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    gap: '0.9rem',
    alignItems: 'center',
    minHeight: '5.2rem',
    padding: '1rem',
    border: '1px solid var(--pub-line)',
    borderRadius: '1.25rem',
    background: '#fff',
    boxShadow: 'var(--pub-shadow)',
  },
  icon: {
    display: 'inline-grid',
    width: '2.65rem',
    height: '2.65rem',
    placeItems: 'center',
    borderRadius: '999px',
    background: '#f0f5ff',
    color: '#1f57a4',
  },
  cardTitle: {
    margin: 0,
    color: 'var(--pub-ink)',
    fontSize: '1rem',
    lineHeight: 1.2,
    fontWeight: 900,
  },
  cardValue: {
    margin: '0.2rem 0 0',
    color: '#203047',
    fontSize: 'clamp(0.96rem, 1.9vw, 1.02rem)',
    lineHeight: 1.35,
    fontWeight: 800,
    overflowWrap: 'anywhere',
  },
  cardDetail: {
    margin: '0.18rem 0 0',
    color: 'var(--pub-muted)',
    fontSize: 'clamp(0.9rem, 1.8vw, 0.96rem)',
    lineHeight: 1.35,
    fontWeight: 650,
  },
  companyPanel: {
    display: 'grid',
    gap: '1rem',
    padding: 'clamp(1.1rem, 3vw, 1.6rem)',
    border: '1px solid var(--pub-line)',
    borderRadius: '1.5rem',
    background: '#fff',
    boxShadow: 'var(--pub-shadow)',
  },
  companyHeader: {
    display: 'grid',
    gap: '0.35rem',
  },
  h2: {
    margin: 0,
    color: 'var(--pub-ink)',
    fontSize: 'clamp(1.65rem, 4.4vw, 2.5rem)',
    lineHeight: 1.04,
    letterSpacing: '-0.04em',
    fontWeight: 900,
  },
  companyText: {
    margin: 0,
    color: 'var(--pub-muted)',
    fontSize: 'clamp(0.98rem, 2vw, 1.05rem)',
    lineHeight: 1.6,
    fontWeight: 650,
  },
  legalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '0.6rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid var(--pub-line)',
  },
  legalItem: {
    padding: '0.72rem 0',
    borderBottom: '1px solid rgba(226, 232, 240, 0.75)',
  },
  label: {
    display: 'block',
    marginBottom: '0.28rem',
    color: '#64748b',
    fontSize: '0.78rem',
    fontWeight: 900,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  legalValue: {
    display: 'block',
    color: 'var(--pub-ink)',
    fontSize: 'clamp(0.98rem, 2vw, 1.04rem)',
    lineHeight: 1.35,
    fontWeight: 800,
    overflowWrap: 'anywhere',
  },
  formBlock: {
    display: 'grid',
    gridTemplateColumns: 'minmax(280px, 0.72fr) minmax(320px, 1fr)',
    gap: '0',
    overflow: 'hidden',
    border: '1px solid rgba(15, 23, 42, 0.1)',
    borderRadius: '1.65rem',
    background: '#fff',
    boxShadow: '0 28px 80px rgba(15, 23, 42, 0.14)',
  },
  darkPanel: {
    display: 'grid',
    gap: '1rem',
    alignContent: 'center',
    padding: 'clamp(1.4rem, 4vw, 2.1rem)',
    background: 'radial-gradient(circle at 90% 20%, rgba(29, 78, 216, 0.2), transparent 34%), linear-gradient(135deg, #080f1f 0%, #101827 58%, #172a46 100%)',
    color: '#fff',
  },
  darkTitle: {
    margin: 0,
    color: '#fff',
    fontSize: 'clamp(1.8rem, 4.8vw, 2.7rem)',
    lineHeight: 1.02,
    letterSpacing: '-0.045em',
    fontWeight: 900,
  },
  darkText: {
    margin: 0,
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: 'clamp(1rem, 2.2vw, 1.08rem)',
    lineHeight: 1.6,
    fontWeight: 600,
  },
  bulletList: {
    display: 'grid',
    gap: '0.55rem',
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '0.85rem',
    padding: 'clamp(1.1rem, 3vw, 1.6rem)',
    alignContent: 'center',
  },
  field: {
    display: 'grid',
    gap: '0.35rem',
    color: 'var(--pub-ink)',
    fontSize: 'clamp(0.95rem, 1.8vw, 1rem)',
    fontWeight: 850,
  },
  input: {
    width: '100%',
    minHeight: '3.25rem',
    border: '1px solid var(--pub-line)',
    borderRadius: '0.9rem',
    background: '#fff',
    color: 'var(--pub-ink)',
    padding: '0.9rem 1rem',
    fontSize: '1rem',
    fontWeight: 650,
  },
  full: {
    gridColumn: '1 / -1',
  },
  textarea: {
    width: '100%',
    minHeight: '8.5rem',
    border: '1px solid var(--pub-line)',
    borderRadius: '0.9rem',
    background: '#fff',
    color: 'var(--pub-ink)',
    padding: '0.95rem 1rem',
    fontSize: '1rem',
    lineHeight: 1.5,
    fontWeight: 650,
    resize: 'vertical',
  },
  submit: {
    gridColumn: '1 / -1',
    minHeight: '3.35rem',
    border: 0,
    borderRadius: '999px',
    background: 'var(--pub-ink)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 900,
    cursor: 'pointer',
  },
  stepsHeading: {
    display: 'grid',
    gap: '0.5rem',
    textAlign: 'center',
    justifyItems: 'center',
    marginBottom: '1.2rem',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '0.85rem',
  },
  stepCard: {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    gap: '0.85rem',
    alignItems: 'start',
    padding: '1rem',
    border: '1px solid var(--pub-line)',
    borderRadius: '1.25rem',
    background: '#fff',
    boxShadow: 'var(--pub-shadow)',
  },
  stepNum: {
    display: 'inline-grid',
    width: '2.6rem',
    height: '2.6rem',
    placeItems: 'center',
    borderRadius: '999px',
    background: '#f0f5ff',
    color: '#1f57a4',
    fontSize: '0.78rem',
    fontWeight: 900,
  },
  bottomCta: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: '1rem',
    alignItems: 'center',
    padding: 'clamp(1.1rem, 3vw, 1.5rem)',
    border: '1px solid var(--pub-line)',
    borderRadius: '1.35rem',
    background: '#fff',
    boxShadow: 'var(--pub-shadow)',
  },
}

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

      <main style={page.wrap}>
        <section style={page.hero}>
          <div style={page.shell}>
            <div style={page.heroInner}>
              <p style={page.eyebrow}>Contatti</p>
              <h1 style={page.h1}>Contatti e richiesta preventivo</h1>
              <p style={page.lead}>Siamo a disposizione per informazioni, sopralluoghi e preventivi. Raccontaci il progetto: ti aiuteremo a definire lavorazioni, priorità e prossimi passaggi.</p>
            </div>
          </div>
        </section>

        <section style={page.section}>
          <div style={page.shell}>
            <div style={page.cardGrid}>
              {contactCards.map((card) => (
                <article key={card.title} style={page.infoCard}>
                  <span style={page.icon} aria-hidden="true"><ContactIcon name={card.icon} /></span>
                  <div>
                    <h3 style={page.cardTitle}>{card.title}</h3>
                    <p style={page.cardValue}>{card.value}</p>
                    <p style={page.cardDetail}>{card.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section style={page.section}>
          <div style={page.shell}>
            <article style={page.companyPanel}>
              <div style={page.companyHeader}>
                <p style={page.eyebrow}>Informazioni aziendali</p>
                <h2 style={page.h2}>EUROPA SERVICE S.R.L.</h2>
                <p style={page.companyText}>Riferimenti societari ufficiali per clienti, fornitori, tecnici e amministrazioni. Per comunicazioni formali è disponibile il canale PEC indicato.</p>
              </div>
              <div style={page.legalGrid}>
                {publicCompanyLegalRows.map((row) => (
                  <div key={row.label} style={page.legalItem}>
                    <span style={page.label}>{row.label}</span>
                    <strong style={page.legalValue}>{row.value}</strong>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section style={page.section} id="contatti-form">
          <div style={page.shell}>
            <div style={page.formBlock}>
              <aside style={page.darkPanel}>
                <p style={{ ...page.eyebrow, color: '#f59e0b' }}>Richiedi un preventivo</p>
                <h2 style={page.darkTitle}>Parlaci del tuo progetto</h2>
                <p style={page.darkText}>Compila il modulo e descrivi le tue esigenze. Ti ricontatteremo per un primo confronto e per valutare una proposta su misura.</p>
                <ul style={page.bulletList}>
                  {['Sopralluogo su richiesta', 'Preventivi chiari e trasparenti', 'Valutazione tecnica del lavoro'].map((item) => (
                    <li key={item} style={{ color: '#fff', fontSize: '1rem', fontWeight: 750, lineHeight: 1.35 }}><span style={{ color: '#f59e0b', marginRight: '0.55rem' }}>✓</span>{item}</li>
                  ))}
                </ul>
                <div style={{ marginTop: '0.5rem', padding: '1rem', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '1rem', background: 'rgba(255,255,255,0.06)' }}>
                  <strong style={{ display: 'block', color: '#fff', fontSize: '1rem', marginBottom: '0.25rem' }}>Preferisci un canale formale?</strong>
                  <span style={{ color: 'rgba(255,255,255,0.76)', fontSize: '0.95rem', lineHeight: 1.45 }}>PEC: europaservizi272@pec.it</span>
                </div>
              </aside>

              <form style={page.form} onSubmit={submit}>
                <label style={page.field}>Nome e cognome<input style={page.input} value={form.name} onChange={(event) => update('name', event.target.value)} required /></label>
                <label style={page.field}>Azienda<input style={page.input} value={form.company} onChange={(event) => update('company', event.target.value)} /></label>
                <label style={page.field}>Email<input style={page.input} type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required /></label>
                <label style={page.field}>Telefono<input style={page.input} type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} required /></label>
                <label style={page.field}>Città<input style={page.input} value={form.city} onChange={(event) => update('city', event.target.value)} /></label>
                <label style={page.field}>
                  Tipologia intervento
                  <select style={page.input} value={form.intervention} onChange={(event) => update('intervention', event.target.value)}>
                    <option>Cartongesso</option>
                    <option>Ristrutturazioni tecniche</option>
                    <option>Finiture interne</option>
                    <option>Gestione cantiere</option>
                    <option>Manutenzioni</option>
                    <option>Supporto operativo</option>
                  </select>
                </label>
                <label style={page.field}>
                  Budget indicativo
                  <select style={page.input} value={form.budget} onChange={(event) => update('budget', event.target.value)}>
                    <option>Da definire</option>
                    <option>Fino a 10.000 EUR</option>
                    <option>10.000 - 50.000 EUR</option>
                    <option>Oltre 50.000 EUR</option>
                  </select>
                </label>
                <label style={page.field}>Upload allegati<input style={page.input} type="file" onChange={(event) => update('fileName', event.target.files?.[0]?.name ?? '')} /></label>
                <label style={{ ...page.field, ...page.full }}>Messaggio<textarea style={page.textarea} rows="6" value={form.message} onChange={(event) => update('message', event.target.value)} placeholder="Descrivi progetto, tempi, stato attuale, accessi, priorità e criticità" /></label>
                <button style={page.submit} type="submit">Invia richiesta →</button>
                {form.fileName ? <p style={{ ...page.companyText, ...page.full }}>Allegato selezionato: {form.fileName}</p> : null}
                {sent ? <p style={{ ...page.companyText, ...page.full, color: '#166534', fontWeight: 800 }}>Richiesta registrata. Ti ricontatteremo per i prossimi passaggi.</p> : null}
              </form>
            </div>
          </div>
        </section>

        <section style={{ ...page.section, paddingTop: 'clamp(2rem, 5vw, 3.5rem)' }}>
          <div style={page.shell}>
            <div style={page.stepsHeading}>
              <p style={page.eyebrow}>Cosa succede dopo</p>
              <h2 style={page.h2}>Il processo in 4 passaggi</h2>
              <p style={page.companyText}>Dalla prima richiesta alla proposta operativa, manteniamo il percorso chiaro e senza passaggi inutili.</p>
            </div>
            <div style={page.stepsGrid}>
              {nextSteps.map(([step, title, text]) => (
                <article key={step} style={page.stepCard}>
                  <span style={page.stepNum}>{step}</span>
                  <div>
                    <h3 style={page.cardTitle}>{title}</h3>
                    <p style={page.cardDetail}>{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section style={{ ...page.section, paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
          <div style={page.shell}>
            <div style={page.bottomCta}>
              <div>
                <p style={page.eyebrow}>Domande frequenti</p>
                <h2 style={{ ...page.h2, fontSize: 'clamp(1.35rem, 3.2vw, 2rem)' }}>Hai dubbi prima di contattarci?</h2>
                <p style={page.companyText}>Consulta le risposte principali o inviaci direttamente la tua richiesta.</p>
              </div>
              <a className="premium-button premium-button-primary" href="#/contatti">Contattaci</a>
            </div>
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
