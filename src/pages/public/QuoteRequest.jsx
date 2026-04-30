import { PageHeader } from '../../components/PageHeader'

export function QuoteRequest() {
  return (
    <>
      <PageHeader eyebrow="Preventivo" title="Richiesta preventivo mock">
        Form dimostrativo senza invio reale, pronto per essere collegato in una fase successiva.
      </PageHeader>
      <section className="section">
        <form className="mock-form">
          <label>
            Nome cliente
            <input type="text" placeholder="Mario Rossi" />
          </label>
          <label>
            Telefono
            <input type="tel" placeholder="+39 ..." />
          </label>
          <label>
            Tipo lavoro
            <select defaultValue="cartongesso">
              <option value="cartongesso">Cartongesso</option>
              <option value="ristrutturazione">Ristrutturazione</option>
              <option value="finiture">Finiture</option>
            </select>
          </label>
          <label>
            Note
            <textarea rows="5" placeholder="Descrivi il lavoro richiesto" />
          </label>
          <button className="button button-primary" type="button">
            Salva richiesta mock
          </button>
        </form>
      </section>
    </>
  )
}
