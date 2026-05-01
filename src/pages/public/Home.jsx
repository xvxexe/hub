import {
  PremiumCTA,
  PremiumHero,
  PremiumImageSplit,
  PremiumProcess,
  PremiumProjectCard,
  PremiumSection,
  PremiumServiceCard,
  PremiumStats,
  PremiumTextCard,
  TestimonialMock,
} from '../../components/PublicComponents'
import { PremiumChipMarquee } from '../../components/PremiumChipMarquee'
import { SEO } from '../../components/SEO'
import {
  operationalMethod,
  partners,
  premiumProjects,
  premiumServices,
  premiumStats,
  sectorsServed,
  testimonials,
  teamImage,
  workMethod,
} from '../../data/publicPremiumData'
import { heroImages, serviceImages } from '../../data/publicImages'

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
        image={premiumProjects[0].image}
        imageAlt="Cantiere interno premium con lavorazioni di cartongesso e finiture"
        variant="overlay"
        meta={['Edilizia tecnica', 'Cartongesso', 'Finiture interne', 'Gestione cantieri']}
      />

      <PremiumSection title="Numeri che raccontano metodo" text="Non vendiamo solo manodopera: portiamo controllo, ordine e continuità operativa nei cantieri interni.">
        <PremiumStats stats={premiumStats} />
      </PremiumSection>

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

      <PremiumSection eyebrow="Dove interveniamo" title="Settori con esigenze diverse, stesso livello di controllo" text="Retail, hospitality, uffici e residenziale richiedono tempi, finiture e comunicazione differenti. Il metodo resta costante: analisi, piano, esecuzione, verifica.">
        <PremiumChipMarquee items={sectorsServed} className="premium-sector-row" ariaLabel="Settori serviti" />
      </PremiumSection>

      <PremiumSection
        eyebrow="Portfolio"
        title="Cantieri in evidenza"
        text="Progetti selezionati per mostrare lavorazioni tecniche, gestione operativa e qualità finale degli ambienti consegnati."
        tone="soft"
        action={<a className="premium-button premium-button-secondary" href="#/cantieri">Guarda il portfolio</a>}
      >
        <div className="premium-project-grid">
          {premiumProjects.slice(0, 3).map((project, index) => (
            <PremiumProjectCard featured={index === 0} key={project.id} project={project} />
          ))}
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
          {operationalMethod.slice(0, 2).map((item) => (
            <PremiumTextCard key={item.title} title={item.title} text={item.text} eyebrow={item.step} />
          ))}
        </div>
      </PremiumImageSplit>

      <PremiumSection eyebrow="Perché sceglierci" title="Più ordine, meno improvvisazione" tone="soft">
        <div className="premium-feature-grid">
          <PremiumTextCard title="Referente unico" text="Ogni progetto ha una regia chiara: meno telefonate sparse e più responsabilità operative." />
          <PremiumTextCard title="Finiture controllate" text="Allineamenti, rasature, chiusure, pulizia e dettagli vengono verificati prima della consegna." />
          <PremiumTextCard title="Cantiere leggibile" text="Le fasi sono organizzate in modo che cliente, tecnici e squadre capiscano sempre lo stato reale." />
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Partner e filiera" title="Collaboriamo con una rete tecnica affidabile">
        <PremiumChipMarquee items={partners} className="premium-logo-row" ariaLabel="Partner e filiera" speed="slow" />
      </PremiumSection>

      <PremiumImageSplit
        eyebrow="Chi siamo"
        title="Una squadra pensata per gestire lavorazioni interne con standard elevati."
        text="EuropaService lavora con un approccio tecnico e ordinato: referenti chiari, squadre coordinate, materiali selezionati, documentazione delle fasi e attenzione ai dettagli che definiscono la qualità finale."
        image={teamImage}
        imageAlt="Squadra EuropaService in cantiere interno"
      >
        <a className="premium-button premium-button-secondary" href="#/chi-siamo">Conosci EuropaService</a>
      </PremiumImageSplit>

      <PremiumSection eyebrow="Clienti" title="Fiducia costruita sul campo" tone="soft">
        <div className="premium-testimonial-grid">
          {testimonials.map((testimonial) => <TestimonialMock key={testimonial.author} testimonial={testimonial} />)}
        </div>
      </PremiumSection>

      <PremiumCTA />
    </>
  )
}
