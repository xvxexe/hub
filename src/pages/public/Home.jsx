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
  premiumServices,
  workMethod,
} from '../../data/publicPremiumData'
import { realPublicProjects } from '../../data/publicRealData'
import { heroImages, serviceImages } from '../../data/publicImages'

const featuredProject = realPublicProjects[0]

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
        image={featuredProject.image}
        imageAlt="Cantiere interno con lavorazioni di cartongesso e finiture"
        variant="overlay"
        meta={['Edilizia tecnica', 'Cartongesso', 'Finiture interne', 'Gestione cantieri']}
      />

      <PremiumImageSplit
        eyebrow="Approccio"
        title="Un cantiere ben fatto si vede prima ancora della consegna."
        text="Protezione degli ambienti, materiali pronti, foto di avanzamento, referenti chiari e fasi controllate riducono ritardi, incomprensioni e lavorazioni rifatte. Il nostro obiettivo è rendere ogni intervento leggibile per cliente, direzione lavori e squadre operative."
        image={heroImages.main.src}
        imageAlt={heroImages.main.alt}
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
        title="Cantiere in evidenza"
        text="Al momento mostriamo solo cantieri con informazioni operative disponibili e verificabili. Gli altri case study verranno aggiunti quando saranno pronti."
        tone="soft"
        action={<a className="premium-button premium-button-secondary" href="#/cantieri">Apri il case study</a>}
      >
        <div className="premium-project-grid">
          <PremiumProjectCard featured project={featuredProject} />
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Metodo" title="Dal sopralluogo alla consegna" text="Un processo chiaro riduce tempi morti, varianti improvvisate e problemi scoperti troppo tardi.">
        <PremiumProcess steps={workMethod} />
      </PremiumSection>

      <PremiumImageSplit
        eyebrow="Controllo operativo"
        title="Documentiamo le fasi per rendere il lavoro trasparente."
        text="Foto, note, aggiornamenti e verifiche sono parte della qualità. Il cliente capisce cosa è stato fatto, cosa manca e quali decisioni servono. Questo rende il cantiere più ordinato e professionale."
        image={serviceImages.supportoCantieri.src}
        imageAlt={serviceImages.supportoCantieri.alt}
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
