import {
  PremiumCTA,
  PremiumHero,
  PremiumImageSplit,
  PremiumProcess,
  PremiumProjectCard,
  PremiumSection,
  PremiumServiceCard,
  PremiumTextCard,
} from '../../components/PublicComponents'
import { SEO } from '../../components/SEO'
import {
  homeHeroImage,
  premiumServices,
  workMethod,
} from '../../data/publicPremiumData'
import { driveHeroImages, drivePublicProjects } from '../../data/driveProjectPhotos'

const visibleProjects = drivePublicProjects.filter((project) => project.status !== 'Da verificare')
const featuredProject = visibleProjects[0]

export function Home() {
  return (
    <>
      <SEO
        title="Costruiamo spazi di valore"
        description="EuropaService realizza edilizia tecnica, cartongesso, ristrutturazioni, finiture interne e gestione cantieri con metodo professionale."
      />

      <PremiumHero
        eyebrow="EuropaService"
        title="Costruiamo spazi di valore"
        text="Edilizia tecnica, cartongesso, ristrutturazioni e finiture interne per chi cerca un partner serio: organizzazione, presenza in cantiere, documentazione e un risultato finale pulito."
        image={homeHeroImage}
        imageAlt="Foto reale di cantiere edile in lavorazione"
        variant="overlay"
        meta={['Edilizia tecnica', 'Cartongesso', 'Finiture interne', 'Gestione cantieri']}
      />

      <PremiumImageSplit
        eyebrow="Approccio"
        title="Un cantiere ben fatto si vede prima ancora della consegna."
        text="Protezione degli ambienti, materiali pronti, foto di avanzamento, referenti chiari e fasi controllate riducono ritardi, incomprensioni e lavorazioni rifatte. Il nostro obiettivo è rendere ogni intervento leggibile per cliente, direzione lavori e squadre operative."
        image={driveHeroImages.method}
        imageAlt="Foto reale di lavorazioni in cantiere"
      >
        <div className="premium-tags">
          <small>Ordine</small>
          <small>Controllo</small>
          <small>Qualità visiva</small>
          <small>Consegna pulita</small>
        </div>
      </PremiumImageSplit>

      <PremiumSection
        eyebrow="Servizi"
        title="Una struttura operativa per interni complessi"
        text="Ogni servizio è pensato per integrarsi con gli altri: meno dispersione, più controllo, più coerenza tra progetto, cantiere e risultato finale."
        tone="soft"
        action={<a className="premium-button premium-button-secondary" href="#/servizi">Scopri tutti i servizi</a>}
      >
        <div className="premium-service-grid">
          {premiumServices.map((service) => <PremiumServiceCard key={service.id} service={service} />)}
        </div>
      </PremiumSection>

      <PremiumSection
        eyebrow="Portfolio"
        title="Cantieri in evidenza"
        text="Foto reali collegate ai cantieri disponibili nel portfolio."
        tone="soft"
        action={<a className="premium-button premium-button-secondary" href="#/cantieri">Apri i case study</a>}
      >
        <div className="premium-project-grid">
          {visibleProjects.map((project) => <PremiumProjectCard featured={project.id === featuredProject.id} key={project.id} project={project} />)}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Metodo" title="Dal sopralluogo alla consegna" text="Un processo chiaro riduce tempi morti, varianti improvvisate e problemi scoperti troppo tardi.">
        <PremiumProcess steps={workMethod} />
      </PremiumSection>

      <PremiumImageSplit
        eyebrow="Controllo operativo"
        title="Documentiamo le fasi per rendere il lavoro trasparente."
        text="Foto, note, aggiornamenti e verifiche sono parte della qualità. Il cliente capisce cosa è stato fatto, cosa manca e quali decisioni servono. Questo rende il cantiere più ordinato e professionale."
        image={driveHeroImages.documentation}
        imageAlt="Foto reale di documentazione cantiere"
        reverse
      >
        <div className="premium-feature-grid">
          <PremiumTextCard title="Ordine documentale" text="Foto, note, preventivi e aggiornamenti vengono organizzati per cantiere e fase." />
          <PremiumTextCard title="Comunicazione chiara" text="Il cliente sa cosa è stato fatto, cosa manca e quali decisioni servono." />
        </div>
      </PremiumImageSplit>

      <PremiumSection eyebrow="Perché sceglierci" title="Più ordine, meno improvvisazione" tone="soft">
        <div className="premium-feature-grid">
          <PremiumTextCard title="Referente unico" text="Ogni progetto ha una regia chiara: meno telefonate sparse e più responsabilità operative." />
          <PremiumTextCard title="Finiture controllate" text="Allineamenti, rasature, chiusure, pulizia e dettagli vengono verificati prima della consegna." />
          <PremiumTextCard title="Cantiere leggibile" text="Le fasi sono organizzate in modo che cliente, tecnici e squadre capiscano sempre lo stato reale." />
        </div>
      </PremiumSection>

      <PremiumCTA />
    </>
  )
}
