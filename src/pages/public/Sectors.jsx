import { CTASection, SectorCard } from '../../components/PublicComponents'
import { PageHeader } from '../../components/PageHeader'
import { sectors } from '../../data/mockSectors'

export function Sectors() {
  return (
    <>
      <PageHeader eyebrow="Settori" title="Soluzioni per privati, aziende, hotel e negozi">
        EuropaService organizza lavorazioni interne diverse in base a contesto, tempi e priorità del cliente.
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
