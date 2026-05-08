import { useState } from 'react'
import {
  PremiumCTA,
  PremiumFAQ,
  PremiumHero,
  PremiumImageSplit,
  PremiumSection,
  PremiumTextCard,
} from '../../components/PublicComponents'
import { SEO } from '../../components/SEO'
import { mainHeroImage } from '../../data/publicPremiumData'
import { publicCompanyLegalRows, realContactCards } from '../../data/publicRealData'
import { serviceImages } from '../../data/publicImages'

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
  ['01', 'Analisi richiesta', 'Valutiamo intervento, zona, urgenza, foto e allegati ricevuti.'],
  ['02', 'Primo contatto', 'Chiariamo obiettivi, vincoli, misure e disponibilità per un sopralluogo.'],
  ['03', 'Sopralluogo', 'Verifichiamo accessi, materiali, superfici, impianti e complessità del lavoro.'],
  ['04', 'Proposta', 'Definiamo lavorazioni, tempi, priorità operative e prossimi passaggi.'],
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
        title="Parliamo del tuo progetto"
        text="Raccontaci spazi, tempi, obiettivi e vincoli. Trasformiamo una richiesta generica in informazioni chiare: lavorazioni, priorità, sopralluogo, documenti e prossimi passi."
        image={mainHeroImage}
        imageAlt="Cantiere interno per richiesta preventivo"
        primaryLabel="Compila il modulo"
        primaryHref="#contatti-form"
        secondaryLabel="Scopri i servizi"
        variant="contact"
        meta={['EUROPA SERVICE S.R.L.', 'P.IVA 02399910518', 'Arezzo', 'PEC ufficiale']}
      />

      <PremiumSection eyebrow="Contatti diretti" title="Dati aziendali e canali ufficiali" text="Informazioni aggiornate per identificazione aziendale, comunicazioni amministrative e richieste operative.">
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

      <PremiumSection eyebrow="Informazioni aziendali" title="Anagrafica EUROPA SERVICE S.R.L." tone="soft">
        <div className="premium-feature-grid">
          {publicCompanyLegalRows.map((row) => (
            <PremiumTextCard key={row.label} title={row.label} text={row.value} />
          ))}
        </div>
      </PremiumSection>

      <PremiumImageSplit
        eyebrow="Prima del preventivo"
        title="Più informazioni abbiamo, più precisa sarà la valutazione."
        text="Un preventivo serio parte da dati leggibili: foto, misure, città, accessi, stato attuale e obiettivo finale. Questo riduce errori, sopralluoghi inutili e passaggi poco chiari."
        image={serviceImages.supportoCantieri.src}
        imageAlt={serviceImages.supportoCantieri.alt}
        reverse
      >
        <div className="premium-feature-grid">
          <PremiumTextCard title="Foto reali" text="Servono immagini larghe degli ambienti e dettagli dei punti critici." />
          <PremiumTextCard title="Misure e planimetrie" text="Aiutano a valutare superfici, quote, materiali e tempi." />
          <PremiumTextCard title="Priorità" text="Capire urgenza, budget e vincoli permette di proporre una soluzione realistica." />
        </div>
      </PremiumImageSplit>

      <section className="premium-contact-layout" id="contatti-form">
        <div className="premium-contact-intro-card">
          <p className="premium-eyebrow">Richiedi preventivo</p>
          <h2>Raccontaci il lavoro da realizzare</h2>
          <p>Invia le informazioni principali sul cantiere: città, tipologia di intervento, tempi, foto disponibili e priorità. Ti ricontatteremo per chiarire i dettagli e valutare i prossimi passaggi.</p>
          <div className="premium-tags">
            <small>Cartongesso</small>
            <small>Finiture interne</small>
            <small>Ristrutturazioni tecniche</small>
            <small>Gestione cantiere</small>
          </div>
          <div className="premium-map-card">
            <strong>EUROPA SERVICE S.R.L.</strong>
            <span>VIA MARCO PERENNIO 21 - 52100 - AREZZO (AR)</span>
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
          <button className="premium-button premium-button-primary" type="submit">Invia richiesta</button>
          {form.fileName ? <p className="premium-form-note">Allegato selezionato: {form.fileName}</p> : null}
          {sent ? <p className="premium-form-success">Richiesta registrata. Ti ricontatteremo per i prossimi passaggi.</p> : null}
        </form>
      </section>

      <section className="premium-section premium-section-soft">
        <div className="premium-section-heading premium-scroll-reveal" style={{ textAlign: 'center', justifyItems: 'center', marginInline: 'auto' }}>
          <p className="premium-eyebrow">Dopo l’invio</p>
          <h2>Cosa succede dopo</h2>
          <p>Ti accompagniamo dai primi dati alla proposta operativa, con un percorso chiaro e senza passaggi inutili.</p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: '1rem',
            width: 'min(100%, var(--pub-max))',
            marginInline: 'auto',
          }}
        >
          {nextSteps.map(([step, title, text]) => (
            <article key={step} className="premium-card premium-scroll-reveal">
              <span
                style={{
                  display: 'inline-grid',
                  width: '2.15rem',
                  height: '2.15rem',
                  placeItems: 'center',
                  borderRadius: '999px',
                  background: 'var(--pub-ink)',
                  color: '#fff',
                  fontSize: '0.76rem',
                  fontWeight: 900,
                  marginBottom: '1rem',
                }}
              >
                {step}
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <PremiumSection eyebrow="FAQ" title="Domande prima del contatto">
        <PremiumFAQ items={contactFaq} />
      </PremiumSection>

      <PremiumCTA title="Preferisci parlare subito con noi?" text="Usa il modulo o la PEC per fissare un primo confronto operativo sul progetto." />
    </>
  )
}
