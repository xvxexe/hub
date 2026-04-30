import { useState } from 'react'
import { CTASection } from '../../components/PublicComponents'
import { PageHeader } from '../../components/PageHeader'
import { SEO } from '../../components/SEO'
import { SafeImage } from '../../components/SafeImage'
import { company } from '../../data/mockData'
import { placeholderImages, teamImages } from '../../data/publicImages'

const contactMethods = [
  {
    title: 'Chiamaci',
    text: 'Per informazioni rapide, sopralluoghi e prime valutazioni operative.',
    value: company.phone,
  },
  {
    title: 'Scrivici su WhatsApp',
    text: 'Utile per inviare foto, indirizzo e dettagli preliminari del lavoro.',
    value: '+39 045 000 0000',
  },
  {
    title: 'Invia una richiesta',
    text: 'Descrivi lavorazioni, zona e urgenza per ricevere un primo contatto ordinato.',
    value: company.email,
  },
  {
    title: 'Richiedi sopralluogo',
    text: 'Valutiamo spazi, misure indicative, accessi e priorità prima di organizzare il lavoro.',
    value: 'Su appuntamento',
  },
]

export function Contacts() {
  const [sent, setSent] = useState(false)

  return (
    <>
      <SEO
        title="Contatti"
        description="Contatta EuropaService per informazioni, sopralluoghi e preventivi su cartongesso, controsoffitti, pareti divisorie, rasature, finiture interne e lavori edili."
      />
      <PageHeader eyebrow="Contatti" title="Contatta EuropaService per informazioni, sopralluoghi e preventivi">
        Per informazioni, sopralluoghi o richieste di preventivo, puoi contattare EuropaService indicando
        il tipo di intervento, la zona e allegando eventuali foto. Più informazioni riceviamo, più sarà
        semplice valutare correttamente il lavoro.
      </PageHeader>

      <section className="section image-text-section">
        <SafeImage
          alt={teamImages.squadra.alt}
          className="public-card-image image-text-media"
          fallbackSrc={placeholderImages.project.src}
          src={teamImages.squadra.src}
          title="Squadra EuropaService per sopralluoghi e cantieri"
        />
        <div className="image-text-copy">
          <p className="eyebrow">Primo contatto</p>
          <h2>Raccontaci il lavoro con dati concreti</h2>
          <p>
            Indica zona, tipo di immobile, lavorazione richiesta, urgenza e stato attuale degli ambienti.
            Per una valutazione più ordinata puoi usare direttamente il modulo preventivo.
          </p>
          <a className="button button-primary" href="#/preventivo">Richiedi preventivo</a>
        </div>
      </section>

      <section className="section section-muted">
        <div className="contact-grid">
          {contactMethods.map((method) => (
            <article className="public-card contact-method-card" key={method.title}>
              <h2>{method.title}</h2>
              <p>{method.text}</p>
              <strong>{method.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="detail-layout contact-layout">
          <form className="mock-form contact-form" onSubmit={(event) => { event.preventDefault(); setSent(true) }}>
            <label>Nome e cognome<input required /></label>
            <label>Telefono<input type="tel" required /></label>
            <label>Email<input type="email" /></label>
            <label>Città / zona intervento<input /></label>
            <label className="form-wide">Messaggio<textarea rows="5" placeholder="Descrivi il lavoro, la zona, l’urgenza e il tipo di immobile" /></label>
            <button className="button button-primary" type="submit">Invia contatto mock</button>
          </form>

          <aside className="info-card">
            <h2>Informazioni utili</h2>
            <dl className="detail-list">
              <div><dt>Zone servite</dt><dd>{company.area}</dd></div>
              <div><dt>Cantieri strutturati</dt><dd>Roma, Milano e Nord Italia mock</dd></div>
              <div><dt>Orari</dt><dd>Lun-Ven 8:00-18:00</dd></div>
              <div><dt>Sabato</dt><dd>Su appuntamento</dd></div>
            </dl>
            <h3>Box sopralluogo</h3>
            <p>Il sopralluogo serve a verificare misure, accessi, materiali, vincoli e tempi prima della proposta.</p>
          </aside>
        </div>
        {sent ? (
          <article className="public-card confirmation-card">
            <h2>Messaggio mock registrato</h2>
            <p>Nessun invio reale: la conferma serve solo per la demo del sito pubblico.</p>
          </article>
        ) : null}
      </section>

      <CTASection
        title="Vuoi una richiesta più completa?"
        text="Usa il modulo preventivo per aggiungere tipo cliente, lavorazione, misure indicative, urgenza, budget e allegati foto mock."
      />
    </>
  )
}
