import { useState } from 'react'
import {
  PremiumCTA,
  PremiumFAQ,
  PremiumHero,
  PremiumSection,
} from '../../components/PublicComponents'
import { SEO } from '../../components/SEO'
import { contactCards, mainHeroImage } from '../../data/publicPremiumData'

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
    question: 'Quanto tempo serve per ricevere una risposta?',
    answer: 'In questa demo non parte nessun invio reale. Nel flusso previsto la richiesta viene presa in carico e qualificata in base a urgenza e complessità.',
  },
  {
    question: 'Posso allegare planimetrie o foto?',
    answer: 'Sì, il campo allegati è predisposto in modalità mock. In futuro potrà collegarsi allo storage reale.',
  },
  {
    question: 'Fate sopralluoghi fuori Verona?',
    answer: 'Sì, valutiamo cantieri in Veneto, Lombardia, Roma e Nord Italia in base al tipo di intervento.',
  },
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
        description="Parla con EuropaService per edilizia, cartongesso, ristrutturazioni tecniche, finiture interne e gestione cantieri."
      />

      <PremiumHero
        eyebrow="Contatti"
        title="Parliamo del tuo progetto"
        text="Raccontaci spazi, tempi, obiettivi e vincoli. Ti aiutiamo a trasformare la richiesta in un piano operativo chiaro."
        image={mainHeroImage}
        imageAlt="Cantiere interno per richiesta preventivo"
        primaryLabel="Compila il modulo"
        primaryHref="#contatti-form"
        secondaryLabel="Scopri i servizi"
        variant="contact"
      />

      <PremiumSection eyebrow="Contatti diretti" title="Scegli il canale più comodo">
        <div className="premium-contact-grid">
          {contactCards.map((card) => (
            <article className="premium-card" key={card.title}>
              <h3>{card.title}</h3>
              <strong>{card.value}</strong>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </PremiumSection>

      <section className="premium-contact-layout" id="contatti-form">
        <div>
          <p className="premium-eyebrow">Richiedi preventivo</p>
          <h2>Inserisci le informazioni essenziali</h2>
          <p>Il modulo è mock: serve a progettare il flusso futuro verso area interna e backend.</p>
          <div className="premium-map-card">
            <strong>EuropaService</strong>
            <span>Verona · Veneto · Nord Italia</span>
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
          <label className="premium-form-wide">Messaggio<textarea rows="6" value={form.message} onChange={(event) => update('message', event.target.value)} placeholder="Descrivi progetto, tempi, stato attuale e priorità" /></label>
          <button className="premium-button premium-button-primary" type="submit">Invia richiesta mock</button>
          {form.fileName ? <p className="premium-form-note">Allegato selezionato: {form.fileName}</p> : null}
          {sent ? <p className="premium-form-success">Richiesta mock registrata. Nessun invio reale eseguito.</p> : null}
        </form>
      </section>

      <PremiumSection eyebrow="Dopo l’invio" title="Cosa succede dopo">
        <div className="premium-process">
          {[
            ['01', 'Analisi richiesta', 'Valutiamo tipo intervento, zona, urgenza e allegati.'],
            ['02', 'Primo contatto', 'Chiariamo obiettivo, vincoli e disponibilità per sopralluogo.'],
            ['03', 'Sopralluogo', 'Verifichiamo misure, accessi, materiali e complessità.'],
            ['04', 'Proposta', 'Impostiamo tempi, lavorazioni e priorità operative.'],
          ].map(([step, title, text]) => (
            <article key={step}><span>{step}</span><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="FAQ" title="Domande prima del contatto" tone="soft">
        <PremiumFAQ items={contactFaq} />
      </PremiumSection>

      <PremiumCTA title="Preferisci parlare subito con noi?" text="Usa telefono o email per fissare un primo confronto operativo sul progetto." />
    </>
  )
}
