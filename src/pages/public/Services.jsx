import {
  PremiumCTA,
  PremiumFAQ,
  PremiumHero,
  PremiumProcess,
  PremiumSection,
  PremiumServiceCard,
} from '../../components/PublicComponents'
import { SEO } from '../../components/SEO'
import {
  mainHeroImage,
  premiumServices,
  sectorsServed,
  workMethod,
} from '../../data/publicPremiumData'

const serviceFaq = [
  {
    question: 'Gestite solo cartongesso o anche lavorazioni edili?',
    answer: 'Gestiamo cartongesso, controsoffitti, finiture, manutenzioni e assistenze edili coordinate, sempre con dati mock in questa versione.',
  },
  {
    question: 'Lavorate con aziende e strutture aperte al pubblico?',
    answer: 'Sì. Retail, hospitality e uffici richiedono fasi ordinate, protezioni, orari pianificati e comunicazione precisa.',
  },
  {
    question: 'È necessario un sopralluogo?',
    answer: 'Per interventi tecnici o con vincoli di accesso il sopralluogo è il modo più serio per valutare tempi, materiali e priorità.',
  },
  {
    question: 'Potete coordinare più lavorazioni?',
    answer: 'La gestione cantiere serve proprio a ridurre passaggi dispersi e mantenere una regia operativa chiara.',
  },
]

export function Services() {
  return (
    <>
      <SEO
        title="Servizi premium per edilizia, cartongesso e finiture"
        description="Servizi EuropaService: cartongesso, ristrutturazioni tecniche, finiture interne, gestione cantiere, manutenzioni e supporto operativo."
      />

      <PremiumHero
        eyebrow="Servizi"
        title="I nostri servizi"
        text="Soluzioni su misura per costruire spazi di qualità, duraturi nel tempo."
        image={mainHeroImage}
        imageAlt="Lavorazioni interne in cantiere premium"
        primaryLabel="Richiedi preventivo"
        secondaryLabel="Guarda i cantieri"
        secondaryHref="#/cantieri"
        variant="page"
        meta={['Retail', 'Hospitality', 'Uffici', 'Residenziale']}
      />

      <PremiumSection
        eyebrow="Cosa facciamo"
        title="Sei aree operative, un unico standard"
        text="Ogni servizio è progettato per dialogare con gli altri: meno dispersione, più controllo e una consegna più pulita."
      >
        <div className="premium-service-grid">
          {premiumServices.map((service) => <PremiumServiceCard key={service.id} service={service} />)}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Perché Europaservice" title="Un approccio più vicino a un partner tecnico che a un semplice esecutore" tone="soft">
        <div className="premium-feature-grid">
          {[
            ['Regia operativa', 'Un referente che segue priorità, tempi, accessi e avanzamento.'],
            ['Qualità visiva', 'Dettagli, giunzioni, quote e finiture curate per un risultato premium.'],
            ['Documentazione', 'Foto, fasi e informazioni ordinate per ridurre ambiguità.'],
            ['Sicurezza e ordine', 'Aree protette, pulizia e attenzione alla convivenza con altri fornitori.'],
          ].map(([title, text]) => (
            <article className="premium-card" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Processo" title="Come lavoriamo" text="Le fasi sono poche, chiare e controllabili.">
        <PremiumProcess steps={workMethod} />
      </PremiumSection>

      <PremiumSection eyebrow="Settori serviti" title="Contesti diversi, stesso livello di controllo" tone="soft">
        <div className="premium-sector-row">
          {sectorsServed.map((sector) => <span key={sector}>{sector}</span>)}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="FAQ" title="Domande frequenti">
        <PremiumFAQ items={serviceFaq} />
      </PremiumSection>

      <PremiumCTA
        title="Serve un servizio tecnico per il tuo spazio?"
        text="Descrivi obiettivo, stato attuale e tempi. Ti aiutiamo a capire quale lavorazione impostare."
      />
    </>
  )
}
