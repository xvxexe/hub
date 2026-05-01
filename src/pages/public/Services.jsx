import {
  PremiumCTA,
  PremiumFAQ,
  PremiumHero,
  PremiumImageSplit,
  PremiumProcess,
  PremiumSection,
  PremiumServiceCard,
  PremiumTextCard,
  PremiumTimeline,
} from '../../components/PublicComponents'
import { PremiumChipMarquee } from '../../components/PremiumChipMarquee'
import { SEO } from '../../components/SEO'
import {
  mainHeroImage,
  operationalMethod,
  premiumServices,
  sectorsServed,
  serviceFaq,
  workMethod,
} from '../../data/publicPremiumData'
import { serviceImages } from '../../data/publicImages'

export function Services() {
  return (
    <>
      <SEO
        title="Servizi premium per edilizia, cartongesso e finiture"
        description="Servizi EuropaService: cartongesso, ristrutturazioni tecniche, finiture interne, gestione cantiere, manutenzioni e supporto operativo."
      />

      <PremiumHero
        eyebrow="Servizi"
        title="Servizi coordinati per cantieri interni di qualità"
        text="Non trattiamo le lavorazioni come elementi separati. Cartongesso, finiture, manutenzioni e gestione operativa vengono organizzati dentro un unico metodo, così il cantiere resta leggibile e il risultato finale è coerente."
        image={mainHeroImage}
        imageAlt="Lavorazioni interne in cantiere premium"
        primaryLabel="Richiedi preventivo"
        secondaryLabel="Guarda i cantieri"
        secondaryHref="#/cantieri"
        variant="page"
        meta={['Cartongesso', 'Controsoffitti', 'Ristrutturazioni', 'Manutenzioni', 'Finiture']}
      />

      <PremiumSection
        eyebrow="Cosa facciamo"
        title="Sei aree operative, un unico standard"
        text="Ogni servizio è progettato per dialogare con gli altri: meno dispersione, più controllo e una consegna più pulita."
      >
        <div className="premium-service-grid">
          {premiumServices.map((service) => <PremiumServiceCard detailed key={service.id} service={service} />)}
        </div>
      </PremiumSection>

      <PremiumImageSplit
        eyebrow="Cartongesso e sistemi a secco"
        title="Precisione millimetrica per pareti, velette e controsoffitti."
        text="Le lavorazioni in cartongesso sono spesso la struttura invisibile della qualità finale: quote, impianti, luce, acustica e finiture dipendono da una posa precisa. Per questo curiamo tracciamenti, profili, chiusure e dettagli prima ancora della rasatura."
        image={serviceImages.cartongesso.src}
        imageAlt={serviceImages.cartongesso.alt}
      >
        <div className="premium-feature-grid">
          <PremiumTextCard title="Pareti e contropareti" text="Soluzioni tecniche per distribuzione interna, isolamento e integrazione impiantistica." />
          <PremiumTextCard title="Velette e nicchie" text="Elementi architettonici per luce, estetica e funzionalità degli ambienti." />
        </div>
      </PremiumImageSplit>

      <PremiumImageSplit
        eyebrow="Ristrutturazioni tecniche"
        title="Quando il cantiere è complesso serve una regia chiara."
        text="Hotel, negozi e uffici hanno vincoli reali: orari, accessi, fornitori, clienti, pulizia, rumore e tempi di consegna. La nostra gestione serve a trasformare queste variabili in un piano operativo leggibile."
        image={serviceImages.ediliGenerali.src}
        imageAlt={serviceImages.ediliGenerali.alt}
        reverse
      >
        <div className="premium-tags">
          <small>Fasi programmate</small>
          <small>Assistenze edili</small>
          <small>Ripristini</small>
          <small>Coordinamento DL</small>
        </div>
      </PremiumImageSplit>

      <PremiumSection eyebrow="Perché EuropaService" title="Un approccio più vicino a un partner tecnico che a un semplice esecutore" tone="soft">
        <div className="premium-feature-grid">
          <PremiumTextCard title="Regia operativa" text="Un referente che segue priorità, tempi, accessi, avanzamento e criticità quotidiane." items={['Meno dispersione', 'Decisioni più rapide', 'Responsabilità chiara']} />
          <PremiumTextCard title="Qualità visiva" text="Dettagli, giunzioni, quote e finiture curate per un risultato professionale e credibile." items={['Controllo dettagli', 'Pulizia finale', 'Finiture uniformi']} />
          <PremiumTextCard title="Documentazione" text="Foto, fasi e informazioni ordinate per ridurre ambiguità, contestazioni e passaggi rifatti." items={['Foto avanzamento', 'Note operative', 'Storico lavorazioni']} />
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Processo" title="Come lavoriamo" text="Le fasi sono poche, chiare e controllabili. Ogni fase ha uno scopo preciso.">
        <PremiumProcess steps={workMethod} />
      </PremiumSection>

      <PremiumSection eyebrow="Metodo operativo" title="Cosa controlliamo durante il lavoro" tone="soft">
        <PremiumTimeline items={operationalMethod} />
      </PremiumSection>

      <PremiumSection eyebrow="Settori serviti" title="Contesti diversi, stesso livello di controllo">
        <PremiumChipMarquee items={sectorsServed} className="premium-sector-row" ariaLabel="Settori serviti" />
      </PremiumSection>

      <PremiumSection eyebrow="FAQ" title="Domande frequenti" tone="soft">
        <PremiumFAQ items={serviceFaq} />
      </PremiumSection>

      <PremiumCTA
        title="Serve un servizio tecnico per il tuo spazio?"
        text="Descrivi obiettivo, stato attuale e tempi. Ti aiutiamo a capire quale lavorazione impostare e come organizzarla senza caos."
      />
    </>
  )
}
