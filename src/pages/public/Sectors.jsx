import {
  PremiumCTA,
  PremiumHero,
  PremiumImageSplit,
  PremiumProcess,
  PremiumSection,
  PremiumTextCard,
} from '../../components/PublicComponents'
import { PremiumChipMarquee } from '../../components/PremiumChipMarquee'
import { SEO } from '../../components/SEO'
import { mainHeroImage, sectorsServed, workMethod } from '../../data/publicPremiumData'
import { driveHeroImages, driveServiceImages } from '../../data/driveProjectPhotos'
import { publicFeaturedVideos } from '../../data/driveProjectVideos'

const sectorDetails = [
  { title: 'Retail', text: 'Negozi e locali commerciali richiedono tempi certi, immagine curata, illuminazione integrata e consegne rapide.' },
  { title: 'Hospitality', text: 'Hotel e strutture ricettive hanno bisogno di pulizia, protezioni, fasi ordinate e attenzione agli ospiti o alle aree aperte.' },
  { title: 'Uffici', text: 'Gli spazi direzionali richiedono comfort acustico, distribuzione funzionale, finiture sobrie e riduzione dei disagi operativi.' },
  { title: 'Residenziale', text: 'Abitazioni e palazzine richiedono qualità percepibile, pulizia, dettagli curati e attenzione alla continuità degli ambienti.' },
  { title: 'Spazi commerciali', text: 'Ambienti ad alta percorrenza hanno bisogno di materiali resistenti, dettagli solidi e manutenzioni semplici.' },
  { title: 'Studi tecnici', text: 'Collaboriamo con progettisti e direzioni lavori per trasformare indicazioni tecniche in fasi operative ordinate.' },
]

export function Sectors() {
  return (
    <>
      <SEO
        title="Settori serviti"
        description="EuropaService lavora per retail, hospitality, uffici, residenziale, spazi commerciali, studi tecnici e general contractor."
      />
      <PremiumHero
        eyebrow="Settori"
        title="Interventi tecnici per contesti diversi"
        text="Ogni settore ha priorità diverse: tempi, pulizia, accessi, sicurezza, estetica, continuità operativa. Il nostro metodo resta costante: ordine, controllo e qualità."
        image={mainHeroImage}
        imageAlt="Cantiere interno per settori serviti"
        heroVideo={publicFeaturedVideos.international}
        variant="page"
        meta={sectorsServed.slice(0, 6)}
      />

      <PremiumSection title="Settori serviti" text="Distribuiamo competenze, foto, contenuti e processi in modo chiaro per far capire dove EuropaService può intervenire.">
        <div className="premium-feature-grid">
          {sectorDetails.map((sector) => (
            <article className="premium-card premium-text-card" key={sector.title}>
              <h3>{sector.title}</h3>
              <p>{sector.text}</p>
            </article>
          ))}
        </div>
      </PremiumSection>

      <PremiumImageSplit
        eyebrow="Retail e hospitality"
        title="Quando l’immagine finale conta quanto il rispetto dei tempi."
        text="Negozi, hotel e spazi aperti al pubblico richiedono una gestione precisa: protezioni, pulizia, programmazione, finiture di qualità e riduzione dei tempi morti."
        image={driveHeroImages.projects}
        imageAlt="Foto reale di cantiere hospitality"
      >
        <div className="premium-feature-grid">
          <PremiumTextCard title="Riaperture puntuali" text="Pianificazione serrata e fasi coordinate per ridurre il tempo fuori servizio." />
          <PremiumTextCard title="Dettagli visivi" text="Finiture e cartongesso devono sostenere l’immagine del brand o della struttura." />
        </div>
      </PremiumImageSplit>

      <PremiumImageSplit
        eyebrow="Uffici e residenziale"
        title="Comfort, funzionalità e ordine durante tutte le fasi."
        text="Negli uffici e negli immobili residenziali il cantiere deve rispettare ambienti, persone e tempi. Per questo curiamo comunicazione, protezioni e verifiche intermedie."
        image={driveServiceImages.finitureInterne}
        imageAlt="Foto reale di finiture interne"
        reverse
      >
        <div className="premium-tags">
          <small>Acustica</small>
          <small>Distribuzione spazi</small>
          <small>Rasature</small>
          <small>Manutenzioni</small>
        </div>
      </PremiumImageSplit>

      <PremiumSection eyebrow="Metodo" title="Stesso processo, adattato al contesto" tone="soft">
        <PremiumProcess steps={workMethod} />
      </PremiumSection>

      <PremiumSection eyebrow="Tutti i contesti" title="Una rete di utilizzi concreta">
        <PremiumChipMarquee items={sectorsServed} className="premium-sector-row" ariaLabel="Tutti i settori serviti" />
      </PremiumSection>

      <PremiumCTA title="Il tuo settore ha vincoli particolari?" text="Raccontaci spazi, tempi, accessi e priorità. Ti aiutiamo a tradurli in un piano di lavoro chiaro." />
    </>
  )
}
