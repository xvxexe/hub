import {
  PremiumCTA,
  PremiumHero,
  PremiumProcess,
  PremiumProjectCard,
  PremiumSection,
  PremiumServiceCard,
  PremiumStats,
  TestimonialMock,
} from '../../components/PublicComponents'
import { SEO } from '../../components/SEO'
import { SafeImage } from '../../components/SafeImage'
import {
  partners,
  premiumProjects,
  premiumServices,
  premiumStats,
  testimonials,
  teamImage,
  workMethod,
} from '../../data/publicPremiumData'

export function Home() {
  return (
    <>
      <SEO
        title="Costruiamo spazi di valore"
        description="EuropaService realizza edilizia, cartongesso, ristrutturazioni tecniche, finiture interne e gestione cantieri per spazi di valore."
      />

      <PremiumHero
        eyebrow="EuropaService"
        title="Costruiamo spazi di valore"
        text="Edilizia, cartongesso, ristrutturazioni tecniche e finiture interne di alta qualità per clienti che cercano ordine, affidabilità e un risultato finale impeccabile."
        image={premiumProjects[0].image}
        imageAlt="Cantiere interno premium con lavorazioni di cartongesso e finiture"
        variant="overlay"
        meta={['Edilizia tecnica', 'Cartongesso', 'Finiture interne', 'Gestione cantieri']}
      />

      <PremiumSection title="Numeri che raccontano metodo" text="Esperienza, cantieri e continuità operativa al servizio di progetti residenziali e professionali.">
        <PremiumStats stats={premiumStats} />
      </PremiumSection>

      <PremiumSection
        eyebrow="Servizi"
        title="Una struttura operativa per interni complessi"
        text="Dalle pareti tecniche al controllo finale, ogni servizio è pensato per integrarsi con tempi, fornitori e obiettivi del cantiere."
        action={<a className="premium-button premium-button-secondary" href="#/servizi">Scopri i servizi</a>}
      >
        <div className="premium-service-grid">
          {premiumServices.slice(0, 6).map((service) => <PremiumServiceCard key={service.id} service={service} />)}
        </div>
      </PremiumSection>

      <PremiumSection
        eyebrow="Portfolio"
        title="Cantieri in evidenza"
        text="Progetti selezionati per mostrare lavorazioni tecniche, organizzazione e qualità visiva degli ambienti consegnati."
        tone="soft"
        action={<a className="premium-button premium-button-secondary" href="#/cantieri">Guarda il portfolio</a>}
      >
        <div className="premium-project-grid">
          {premiumProjects.slice(0, 3).map((project, index) => (
            <PremiumProjectCard featured={index === 0} key={project.id} project={project} />
          ))}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Metodo" title="Dal sopralluogo alla consegna" text="Un processo chiaro riduce attriti, tempi morti e decisioni improvvisate.">
        <PremiumProcess steps={workMethod} />
      </PremiumSection>

      <section className="premium-split-section">
        <SafeImage
          alt="Squadra EuropaService in cantiere interno"
          className="premium-split-image"
          fallbackSrc="/assets/images/placeholders/placeholder-cantiere.jpg"
          src={teamImage}
          title="Squadra EuropaService"
        />
        <div>
          <p className="premium-eyebrow">Chi siamo</p>
          <h2>Una società organizzata per gestire lavorazioni interne con standard elevati.</h2>
          <p>
            EuropaService lavora con un approccio tecnico e ordinato: referenti chiari,
            squadre coordinate, materiali selezionati, documentazione delle fasi e attenzione
            ai dettagli che definiscono la qualità finale.
          </p>
          <a className="premium-button premium-button-secondary" href="#/chi-siamo">Conosci Europaservice</a>
        </div>
      </section>

      <PremiumSection eyebrow="Partner e certificazioni" title="Collaboriamo con filiere tecniche affidabili" text="Un cantiere premium dipende da competenze, fornitori e responsabilità ben distribuite.">
        <div className="premium-logo-row">
          {partners.map((partner) => <span key={partner}>{partner}</span>)}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Clienti" title="Fiducia costruita sul campo" tone="soft">
        <div className="premium-testimonial-grid">
          {testimonials.map((testimonial) => <TestimonialMock key={testimonial.author} testimonial={testimonial} />)}
        </div>
      </PremiumSection>

      <PremiumCTA />
    </>
  )
}
