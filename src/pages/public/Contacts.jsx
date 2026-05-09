import { useState } from 'react'
import {
  PremiumCTA,
  PremiumFAQ,
  PremiumHero,
  PremiumSection,
  PremiumTextCard,
} from '../../components/PublicComponents'
import { SEO } from '../../components/SEO'
import { mainHeroImage } from '../../data/publicPremiumData'
import { publicCompanyLegalRows, realContactCards } from '../../data/publicRealData'

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

      <PremiumHero
        eyebrow="Contatti"
        title="Contatti e richiesta preventivo"
        text="Siamo a disposizione per informazioni, sopralluoghi e preventivi. Raccontaci il progetto: ti aiuteremo a definire lavorazioni, priorità e prossimi passaggi."
        image={mainHeroImage}
        imageAlt="Cantiere interno per richiesta preventivo"
        primaryLabel="Compila il modulo"
        primaryHref="#contatti-form"
        secondaryLabel="Scopri i servizi"
        variant="compact"
        meta={['EUROPA SERVICE S.R.L.', 'P.IVA 02399910518', 'Arezzo', 'PEC ufficiale']}
      />

      <PremiumSection eyebrow="Canali ufficiali" title="Come contattarci" text="Usa il modulo per richieste operative e sopralluoghi. Per comunicazioni formali è disponibile la PEC aziendale.">
        <div className="premium-contact-grid">
          {realContactCards.map((card) => (
            <article className="premium-card" key={card.title}>
              <h3>{card.title}</h3>
              <strong>{card.value}</strong>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </PremiumSection>

      <section className="premium-contact-layout">
        <div className="premium-contact-intro-card">
          <p className="premium-eyebrow">Informazioni aziendali</p>
          <h2>EUROPA SERVICE S.R.L.</h2>
          <p>Riferimenti societari ufficiali per clienti, fornitori, tecnici e amministrazioni.</p>
          <div className="premium-map-card">
            <strong>Sede legale</strong>
            <span>VIA MARCO PERENNIO 21 - 52100 - AREZZO (AR)</span>
          </div>
        </div>

        <div className="premium-form" aria-label="Dati societari EUROPA SERVICE S.R.L.">
          {publicCompanyLegalRows.map((row) => (
            <label key={row.label} className={row.label === 'Indirizzo' || row.label === 'PEC' ? 'premium-form-wide' : undefined}>
              {row.label}
              <strong>{row.value}</strong>
            </label>
          ))}
        </div>
      </section>

      <section className="premium-contact-layout" id="contatti-form">
        <div className="premium-contact-intro-card">
          <p className="premium-eyebrow">Richiedi un preventivo</p>
          <h2>Parlaci del tuo progetto</h2>
          <p>Compila il modulo e descrivi le tue esigenze. Ti ricontatteremo per un primo confronto e per valutare una proposta su misura.</p>
          <ul className="premium-check-list">
            <li>Sopralluogo su richiesta</li>
            <li>Preventivi chiari e trasparenti</li>
            <li>Valutazione tecnica del lavoro</li>
          </ul>
          <div className="premium-map-card">
            <strong>Canale formale</strong>
            <span>PEC: europaservizi272@pec.it</span>
          </div>
        </div>

        <form className="premium-form" onSubmit={submit}>
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
          <label className="premium-form-wide">Messaggio<textarea rows="6" value={form.message} onChange={(event) => update('message', event.target.value)} placeholder="Descrivi progetto, tempi, stato attuale, accessi, priorità e criticità" /></label>
          <button className="premium-button premium-button-primary" type="submit">Invia richiesta →</button>
          {form.fileName ? <p className="premium-form-note">Allegato selezionato: {form.fileName}</p> : null}
          {sent ? <p className="premium-form-success">Richiesta registrata. Ti ricontatteremo per i prossimi passaggi.</p> : null}
        </form>
      </section>

      <PremiumSection eyebrow="Cosa succede dopo" title="Il processo in 4 passaggi" text="Dalla prima richiesta alla proposta operativa, manteniamo il percorso chiaro e senza passaggi inutili." tone="soft">
        <div className="premium-process">
          {nextSteps.map(([step, title, text]) => (
            <article key={step} className="premium-scroll-reveal">
              <span>{step}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Prima del contatto" title="Informazioni utili per una valutazione precisa">
        <div className="premium-feature-grid">
          <PremiumTextCard title="Foto e stato attuale" text="Invia immagini larghe degli ambienti e dettagli dei punti critici." />
          <PremiumTextCard title="Misure e planimetrie" text="Quote, superfici e planimetrie aiutano a valutare materiali, tempi e lavorazioni." />
          <PremiumTextCard title="Priorità e tempi" text="Indica urgenza, vincoli di accesso e obiettivo finale dell’intervento." />
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="FAQ" title="Domande prima del contatto" tone="soft">
        <PremiumFAQ items={contactFaq} />
      </PremiumSection>

      <PremiumCTA title="Preferisci parlare subito con noi?" text="Usa il modulo o la PEC per fissare un primo confronto operativo sul progetto." />
    </>
  )
}
