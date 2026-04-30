import { CTASection, SectorCard } from '../../components/PublicComponents'
import { PageHeader } from '../../components/PageHeader'
import { SEO } from '../../components/SEO'
import { sectors } from '../../data/publicSectors'

export function Sectors() {
  return (
    <>
      <SEO
        title="Settori serviti"
        description="EuropaService lavora per privati, aziende, hotel, negozi, studi tecnici, general contractor e amministratori immobiliari con cartongesso e finiture interne."
      />
      <PageHeader eyebrow="Settori" title="Soluzioni per privati, aziende, hotel, negozi e cantieri professionali">
        Ogni cliente ha vincoli diversi: tempi, accessi, finiture, coordinamento e livello di documentazione.
        EuropaService organizza le lavorazioni interne in base al contesto reale del cantiere.
      </PageHeader>
      <section className="section">
        <div className="public-grid">
          {sectors.map((sector) => <SectorCard key={sector.id} sector={sector} />)}
        </div>
      </section>
      <CTASection title="Hai un settore con esigenze specifiche?" text="Descrivi spazi, vincoli e tempi: il modulo preventivo mock raccoglie le informazioni principali." />
    </>
  )
}
