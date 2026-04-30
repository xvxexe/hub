import { useState } from 'react'
import { FAQ } from '../../components/PublicComponents'
import { FilePreviewMock } from '../../components/FilePreviewMock'
import { PageHeader } from '../../components/PageHeader'
import { SEO } from '../../components/SEO'
import { SafeImage } from '../../components/SafeImage'
import { placeholderImages, serviceImages } from '../../data/publicImages'
import { publicServices } from '../../data/publicServices'

const initialForm = {
  nome: '',
  telefono: '',
  email: '',
  citta: '',
  tipoCliente: 'Privato',
  tipoLavoro: 'Cartongesso',
  descrizione: '',
  misure: '',
  urgenza: 'Da programmare',
  budget: 'Da definire',
  fileName: '',
  preferenzaContatto: 'Telefono',
  consenso: false,
}

const faq = [
  {
    question: 'Posso allegare foto?',
    answer: 'Sì. In questa versione l’allegato è solo mock, ma nel flusso reale le foto aiutano a capire stato degli ambienti, accessi e lavorazioni necessarie.',
  },
  {
    question: 'Serve il sopralluogo?',
    answer: 'Per lavori complessi è spesso necessario. Il modulo serve a raccogliere una prima base chiara prima di fissare eventuali verifiche sul posto.',
  },
  {
    question: 'Fate lavori per aziende?',
    answer: 'Sì, gestiamo uffici, spazi operativi, manutenzioni e modifiche interne per aziende e attività professionali.',
  },
  {
    question: 'Lavorate anche su hotel e negozi?',
    answer: 'Sì, con attenzione a tempi, accessi, pulizia e coordinamento con le attività della struttura o del locale.',
  },
  {
    question: 'Quanto è dettagliato il preventivo?',
    answer: 'Dipende dalle informazioni disponibili. Misure, foto, località e descrizione aiutano a preparare una valutazione più precisa.',
  },
]

export function QuoteRequest() {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(null)

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function submit(event) {
    event.preventDefault()
    setSubmitted(form)
  }

  return (
    <>
      <SEO
        title="Richiesta preventivo cartongesso e lavori edili"
        description="Richiedi un preventivo per cartongesso, controsoffitti, pareti divisorie, rasature, finiture interne, lavori edili, hotel e negozi."
      />
      <PageHeader eyebrow="Richiesta preventivo" title="Richiedi una valutazione per lavori interni, cartongesso e finiture">
        Il modulo serve a raccogliere le informazioni principali: tipo di intervento, zona,
        misure indicative, urgenza, preferenza di contatto ed eventuali foto mock.
      </PageHeader>

      <section className="section image-text-section">
        <SafeImage
          alt={serviceImages.cartongesso.alt}
          className="public-card-image image-text-media"
          fallbackSrc={placeholderImages.service.src}
          src={serviceImages.cartongesso.src}
          title="Preventivo cartongesso e finiture interne"
        />
        <div className="image-text-copy">
          <p className="eyebrow">Prima valutazione</p>
          <h2>Più informazioni inserisci, più semplice sarà capire tempi e prossimi passaggi</h2>
          <p>
            Puoi richiedere cartongesso, controsoffitti, pareti divisorie, rasature, isolamenti,
            manutenzioni, lavori edili, interventi per hotel, negozi e supporto a cantieri.
          </p>
        </div>
      </section>

      <section className="section section-muted">
        <div className="public-grid">
          <article className="public-card">
            <h2>Perché usare il modulo</h2>
            <p>Raccoglie in modo ordinato dati di contatto, zona, tipologia di lavoro, urgenza e budget indicativo.</p>
          </article>
          <article className="public-card">
            <h2>Perché allegare foto aiuta</h2>
            <p>Le foto aiutano a valutare accessi, superfici, stato attuale e complessità prima del sopralluogo.</p>
          </article>
          <article className="public-card">
            <h2>Cosa succede dopo?</h2>
            <p>Richiesta ricevuta. I dati inseriti sono stati salvati in modalità dimostrativa. In una versione reale, la richiesta verrà inviata all’area interna per essere valutata.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <form className="mock-form estimate-form" onSubmit={submit}>
          <label>Nome e cognome<input value={form.nome} onChange={(event) => update('nome', event.target.value)} required /></label>
          <label>Telefono<input type="tel" value={form.telefono} onChange={(event) => update('telefono', event.target.value)} required /></label>
          <label>Email<input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} /></label>
          <label>Città / zona intervento<input value={form.citta} onChange={(event) => update('citta', event.target.value)} /></label>
          <label>
            Tipo cliente
            <select value={form.tipoCliente} onChange={(event) => update('tipoCliente', event.target.value)}>
              <option>Privato</option>
              <option>Azienda</option>
              <option>Hotel</option>
              <option>Negozio</option>
              <option>Studio tecnico</option>
              <option>Altro</option>
            </select>
          </label>
          <label>
            Tipo lavoro
            <select value={form.tipoLavoro} onChange={(event) => update('tipoLavoro', event.target.value)}>
              {publicServices.map((service) => <option key={service.id} value={service.title}>{service.title}</option>)}
            </select>
          </label>
          <label>Misure indicative<input value={form.misure} onChange={(event) => update('misure', event.target.value)} placeholder="Es. 80 mq, 3 stanze, 20 ml pareti" /></label>
          <label>
            Urgenza
            <select value={form.urgenza} onChange={(event) => update('urgenza', event.target.value)}>
              <option>Da programmare</option>
              <option>Entro 2 settimane</option>
              <option>Urgente</option>
            </select>
          </label>
          <label>
            Budget indicativo
            <select value={form.budget} onChange={(event) => update('budget', event.target.value)}>
              <option>Da definire</option>
              <option>Fino a 5.000 EUR</option>
              <option>5.000 - 20.000 EUR</option>
              <option>Oltre 20.000 EUR</option>
            </select>
          </label>
          <label>
            Preferenza contatto
            <select value={form.preferenzaContatto} onChange={(event) => update('preferenzaContatto', event.target.value)}>
              <option>Telefono</option>
              <option>WhatsApp</option>
              <option>Email</option>
            </select>
          </label>
          <label className="form-wide">Descrizione intervento<textarea rows="5" value={form.descrizione} onChange={(event) => update('descrizione', event.target.value)} placeholder="Descrivi ambiente, obiettivo, stato attuale e vincoli di tempo" /></label>
          <label className="form-wide">
            Allegati foto mock
            <input type="file" accept="image/*" onChange={(event) => update('fileName', event.target.files?.[0]?.name ?? '')} />
          </label>
          <div className="form-wide"><FilePreviewMock fileName={form.fileName} type="image" /></div>
          <label className="checkbox-row form-wide">
            <input type="checkbox" checked={form.consenso} onChange={(event) => update('consenso', event.target.checked)} required />
            Acconsento a essere ricontattato per questa richiesta.
          </label>
          <button className="button button-primary" type="submit">Invia richiesta mock</button>
        </form>

        {submitted ? (
          <article className="public-card confirmation-card">
            <h2>Richiesta ricevuta</h2>
            <p>
              I dati inseriti sono stati salvati in modalità dimostrativa. In una versione reale,
              la richiesta verrà inviata all’area interna per essere valutata.
            </p>
            <dl className="detail-list">
              <div><dt>Cliente</dt><dd>{submitted.nome}</dd></div>
              <div><dt>Zona</dt><dd>{submitted.citta || 'Non indicata'}</dd></div>
              <div><dt>Tipo cliente</dt><dd>{submitted.tipoCliente}</dd></div>
              <div><dt>Lavoro</dt><dd>{submitted.tipoLavoro}</dd></div>
              <div><dt>Contatto preferito</dt><dd>{submitted.preferenzaContatto}</dd></div>
            </dl>
          </article>
        ) : null}
      </section>

      <section className="section section-muted">
        <div className="section-heading">
          <h2>Per un preventivo più preciso</h2>
          <p>Indica misure, foto, località, piano dell’immobile, accessi, urgenza e risultato desiderato.</p>
        </div>
        <FAQ items={faq} />
      </section>
    </>
  )
}
