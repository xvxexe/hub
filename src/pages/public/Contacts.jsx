import { useState } from 'react'
import { CTASection } from '../../components/PublicComponents'
import { PageHeader } from '../../components/PageHeader'
import { SafeImage } from '../../components/SafeImage'
import { company } from '../../data/mockData'
import { placeholderImages, teamImages } from '../../data/publicImages'

export function Contacts() {
  const [sent, setSent] = useState(false)

  return (
    <>
      <PageHeader eyebrow="Contatti" title="Parla con EuropaService">
        Telefono, WhatsApp, email e sopralluoghi mock per lavori di edilizia e cartongesso.
      </PageHeader>
      <section className="section">
        <SafeImage
          alt={teamImages.squadra.alt}
          className="public-card-image"
          fallbackSrc={placeholderImages.project.src}
          src={teamImages.squadra.src}
          title="Squadra EuropaService per sopralluoghi e cantieri"
        />
        <div className="contact-grid">
          <article className="public-card"><h2>Telefono</h2><p>{company.phone}</p></article>
          <article className="public-card"><h2>Email</h2><p>{company.email}</p></article>
          <article className="public-card"><h2>WhatsApp</h2><p>+39 045 000 0000</p></article>
          <article className="public-card"><h2>Zone servite</h2><p>{company.area}, Roma e Milano per cantieri strutturati mock.</p></article>
          <article className="public-card"><h2>Orari</h2><p>Lun-Ven 8:00-18:00 · Sabato su appuntamento.</p></article>
          <article className="public-card"><h2>Sopralluogo</h2><p>Valutazione spazi, misure indicative, priorità e tempi di intervento.</p></article>
        </div>
      </section>
      <section className="section">
        <form className="mock-form contact-form" onSubmit={(event) => { event.preventDefault(); setSent(true) }}>
          <label>Nome<input required /></label>
          <label>Telefono<input type="tel" required /></label>
          <label>Email<input type="email" /></label>
          <label className="form-wide">Messaggio<textarea rows="5" placeholder="Descrivi il lavoro o chiedi un sopralluogo" /></label>
          <button className="button button-primary" type="submit">Invia contatto mock</button>
        </form>
        {sent ? <article className="public-card confirmation-card"><h2>Messaggio mock registrato</h2><p>Nessun invio reale: la conferma serve solo per la demo.</p></article> : null}
      </section>
      <CTASection title="Vuoi un preventivo più dettagliato?" text="Passa al modulo preventivo mock e aggiungi tipo lavoro, misure e urgenza." />
    </>
  )
}
