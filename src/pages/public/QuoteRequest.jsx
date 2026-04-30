import { useState } from 'react'
import { FilePreviewMock } from '../../components/FilePreviewMock'
import { PageHeader } from '../../components/PageHeader'
import { SafeImage } from '../../components/SafeImage'
import { placeholderImages, serviceImages } from '../../data/publicImages'
import { publicServices } from '../../data/publicServices'

const initialForm = {
  nome: '',
  telefono: '',
  email: '',
  citta: '',
  tipoLavoro: 'Cartongesso',
  descrizione: '',
  misure: '',
  urgenza: 'Da programmare',
  budget: 'Da definire',
  fileName: '',
  consenso: false,
}

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
      <PageHeader eyebrow="Richiesta preventivo" title="Preventivo per edilizia e cartongesso">
        Compila una richiesta mock con dati, misure indicative e priorità. Nessun invio reale.
      </PageHeader>
      <section className="section">
        <SafeImage
          alt={serviceImages.cartongesso.alt}
          className="public-card-image"
          fallbackSrc={placeholderImages.service.src}
          src={serviceImages.cartongesso.src}
          title="Richiesta preventivo cartongesso e finiture"
        />
        <form className="mock-form estimate-form" onSubmit={submit}>
          <label>Nome<input value={form.nome} onChange={(event) => update('nome', event.target.value)} required /></label>
          <label>Telefono<input type="tel" value={form.telefono} onChange={(event) => update('telefono', event.target.value)} required /></label>
          <label>Email<input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} /></label>
          <label>Città<input value={form.citta} onChange={(event) => update('citta', event.target.value)} /></label>
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
          <label className="form-wide">Descrizione lavoro<textarea rows="5" value={form.descrizione} onChange={(event) => update('descrizione', event.target.value)} /></label>
          <label className="form-wide">
            Foto mock
            <input type="file" accept="image/*" onChange={(event) => update('fileName', event.target.files?.[0]?.name ?? '')} />
          </label>
          <div className="form-wide"><FilePreviewMock fileName={form.fileName} type="image" /></div>
          <label className="checkbox-row form-wide">
            <input type="checkbox" checked={form.consenso} onChange={(event) => update('consenso', event.target.checked)} />
            Acconsento a essere ricontattato per questa richiesta mock.
          </label>
          <button className="button button-primary" type="submit">Invia richiesta mock</button>
        </form>

        {submitted ? (
          <article className="public-card confirmation-card">
            <h2>Richiesta mock salvata</h2>
            <p>Nessun dato è stato inviato. Riepilogo: {submitted.nome} · {submitted.citta} · {submitted.tipoLavoro} · {submitted.urgenza}.</p>
          </article>
        ) : null}
      </section>
    </>
  )
}
