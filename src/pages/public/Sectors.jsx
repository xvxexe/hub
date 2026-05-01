import { PremiumCTA, PremiumHero, PremiumSection } from '../../components/PublicComponents'
import { SEO } from '../../components/SEO'
import { mainHeroImage, sectorsServed } from '../../data/publicPremiumData'

export function Sectors() {
  return (
    <>
      <SEO
        title="Settori serviti"
        description="EuropaService lavora per retail, hospitality, uffici, residenziale e spazi commerciali."
      />
      <PremiumHero
        eyebrow="Settori"
        title="Interventi tecnici per contesti diversi"
        text="Retail, hospitality, uffici, residenziale e spazi commerciali richiedono tempi, finiture e organizzazione diversi. Il metodo resta lo stesso: ordine e qualità."
        image={mainHeroImage}
        imageAlt="Cantiere interno per settori serviti"
      />
      <PremiumSection title="Settori serviti">
        <div className="premium-feature-grid">
          {sectorsServed.map((sector) => (
            <article className="premium-card" key={sector}>
              <h3>{sector}</h3>
              <p>Soluzioni di cartongesso, finiture e gestione cantiere adattate a vincoli e standard del settore.</p>
            </article>
          ))}
        </div>
      </PremiumSection>
      <PremiumCTA />
    </>
  )
}
