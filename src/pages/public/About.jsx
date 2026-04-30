import { CTASection } from '../../components/PublicComponents'
import { PageHeader } from '../../components/PageHeader'
import { SEO } from '../../components/SEO'
import { SafeImage } from '../../components/SafeImage'
import { publicDocuments } from '../../data/publicDocuments'
import { placeholderImages, teamImages } from '../../data/publicImages'

const values = [
  'Affidabilità',
  'Precisione',
  'Organizzazione',
  'Pulizia',
  'Rispetto dei tempi',
  'Comunicazione chiara',
]

const sections = [
  {
    title: 'Chi è EuropaService',
    text: 'EuropaService è una realtà specializzata in edilizia, cartongesso, controsoffitti, pareti divisorie, rasature e finiture interne per clienti privati e professionali.',
  },
  {
    title: 'Il nostro metodo',
    text: 'Ogni intervento parte da sopralluogo, analisi delle necessità e organizzazione delle fasi. L’obiettivo è lavorare con un percorso chiaro, non con decisioni improvvisate.',
  },
  {
    title: 'Come lavoriamo in cantiere',
    text: 'Proteggiamo gli ambienti, manteniamo ordine nelle aree di lavoro e coordiniamo le lavorazioni con attenzione a tempi, accessi e passaggi successivi.',
  },
  {
    title: 'Ordine e documentazione',
    text: 'Un cantiere documentato è più facile da seguire. Foto, fasi e informazioni ordinate aiutano cliente, tecnici e squadra a mantenere controllo sul lavoro.',
  },
  {
    title: 'Qualità delle finiture',
    text: 'La qualità si vede nei dettagli: superfici regolari, giunzioni curate, chiusure coerenti e pulizia finale prima della consegna.',
  },
  {
    title: 'Collaborazione con clienti e professionisti',
    text: 'Lavoriamo con privati, aziende, hotel, negozi, studi tecnici e general contractor con comunicazione diretta e responsabilità operative chiare.',
  },
]

export function About() {
  return (
    <>
      <SEO
        title="Chi siamo"
        description="EuropaService lavora con metodo su edilizia, cartongesso, controsoffitti, pareti divisorie, rasature e finiture interne per cantieri organizzati."
      />
      <PageHeader eyebrow="Chi siamo" title="EuropaService, metodo e precisione per lavori interni curati">
        Non puntiamo su slogan generici: puntiamo su organizzazione, pulizia, comunicazione chiara e qualità delle finiture.
      </PageHeader>

      <section className="section image-text-section">
        <SafeImage
          alt={teamImages.squadra.alt}
          className="public-card-image image-text-media"
          fallbackSrc={placeholderImages.project.src}
          src={teamImages.squadra.src}
          title={teamImages.squadra.title}
        />
        <div className="image-text-copy">
          <p className="eyebrow">Presenza in cantiere</p>
          <h2>Un referente operativo per lavorazioni interne e finiture professionali</h2>
          <p>
            Gestiamo interventi di cartongesso, controsoffitti, lavori edili e manutenzioni con
            attenzione alle esigenze del cliente e al risultato finale degli ambienti.
          </p>
          <a className="button button-secondary" href="#/servizi">Scopri i servizi</a>
        </div>
      </section>

      <section className="section section-muted">
        <div className="public-grid">
          {sections.map((section) => (
            <article className="public-card" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Valori aziendali</h2>
          <p>Valori semplici, verificabili sul campo e utili a mantenere il cantiere sotto controllo.</p>
        </div>
        <div className="public-grid">
          {values.map((value) => (
            <article className="public-card value-card" key={value}>
              <h3>{value}</h3>
              <p>Un criterio operativo che guida sopralluogo, preventivo, lavorazione e consegna.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-muted">
        <div className="section-heading">
          <h2>Documenti utili</h2>
          <p>Solo documenti pubblici dimostrativi. I documenti interni restano esclusi dalla cartella public.</p>
        </div>
        <div className="public-grid">
          {publicDocuments.slice(0, 3).map((document) => (
            <article className="public-card document-card" key={document.title}>
              <h3>{document.title}</h3>
              <p>{document.description}</p>
              <span className="status-badge status-muted">
                {document.ready ? document.type : 'In preparazione'}
              </span>
            </article>
          ))}
        </div>
      </section>

      <CTASection
        title="Cerchi una squadra ordinata per il tuo intervento?"
        text="Raccontaci il lavoro, la zona e le priorità: ti aiuteremo a impostare i prossimi passaggi in modo chiaro."
      />
    </>
  )
}
