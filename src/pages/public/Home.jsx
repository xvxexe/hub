import {
  CTASection,
  HeroSection,
  ProcessSteps,
  ProjectCard,
  SectorCard,
  StatsBand,
} from '../../components/PublicComponents'
import { SEO } from '../../components/SEO'
import { Section } from '../../components/Section'
import { SafeImage } from '../../components/SafeImage'
import { heroImages, placeholderImages } from '../../data/publicImages'
import {
  companyStats,
  homeTrustItems,
  publicServices,
  whyChooseUs,
  workProcess,
} from '../../data/publicServices'
import { publicProjects } from '../../data/publicProjects'
import { sectors } from '../../data/publicSectors'

export function Home() {
  return (
    <>
      <SEO
        title="Edilizia, cartongesso e finiture interne"
        description="EuropaService realizza edilizia, cartongesso, controsoffitti, pareti divisorie, rasature e finiture interne per privati, aziende, hotel, negozi e cantieri organizzati."
      />
      <HeroSection
        eyebrow="Edilizia, cartongesso e finiture interne"
        title="Edilizia, cartongesso e finiture interne per cantieri organizzati e risultati professionali"
        text="EuropaService realizza interventi di cartongesso, controsoffitti, pareti divisorie, rasature, finiture interne e lavori edili per privati, aziende, hotel, negozi e cantieri professionali."
        image={heroImages.main}
        trustItems={homeTrustItems}
      >
        <div className="hero-panel" aria-label="Metodo EuropaService">
          <span>Metodo di lavoro</span>
          <strong>Sopralluogo, organizzazione, esecuzione e controllo</strong>
          <p>Gestiamo lavorazioni interne con attenzione a tempi, ordine di cantiere e qualità delle finiture.</p>
        </div>
      </HeroSection>

      <Section
        title="Cosa facciamo"
        intro="Dalle pareti in cartongesso ai controsoffitti, fino alle finiture interne, lavoriamo per ottenere ambienti puliti, funzionali e pronti all’uso."
      >
        <div className="public-grid">
          {publicServices.slice(0, 6).map((service) => (
            <article className="public-card service-summary-card" key={service.id}>
              <SafeImage
                alt={service.imageAlt}
                className="public-card-image"
                fallbackSrc={service.fallbackImage}
                src={service.image}
                title={service.seoTitle}
              />
              <span className="service-icon">{service.icon}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </article>
          ))}
        </div>
        <a className="button button-secondary section-action" href="#/servizi">Scopri i servizi</a>
      </Section>

      <Section title="Perché scegliere EuropaService" tone="muted">
        <div className="public-grid">
          {whyChooseUs.map((item) => (
            <article className="public-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <StatsBand stats={companyStats} />

      <Section title="Metodo di lavoro" intro="Ogni intervento viene seguito con metodo: sopralluogo, valutazione, lavorazione, controllo e consegna.">
        <ProcessSteps steps={workProcess} />
      </Section>

      <Section
        title="Cantieri e lavori reali"
        intro="Il portfolio mostra esempi di lavorazioni e tipologie di intervento: cartongesso, controsoffitti, finiture interne e lavori edili documentati."
        tone="muted"
      >
        <div className="public-project-grid">
          {publicProjects.slice(0, 3).map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
        <a className="button button-secondary section-action" href="#/cantieri">Guarda i cantieri</a>
      </Section>

      <Section title="Settori serviti" intro="Adattiamo lavorazioni, tempi e comunicazione al tipo di cliente e al contesto operativo.">
        <div className="public-grid">
          {sectors.slice(0, 6).map((sector) => <SectorCard key={sector.id} sector={sector} />)}
        </div>
      </Section>

      <section className="section section-muted image-text-section">
        <SafeImage
          alt={heroImages.ceiling.alt}
          className="public-card-image image-text-media"
          fallbackSrc={placeholderImages.hero.src}
          src={heroImages.ceiling.src}
          title={heroImages.ceiling.title}
        />
        <div className="image-text-copy">
          <p className="eyebrow">Cantieri organizzati</p>
          <h2>Più ordine significa decisioni più semplici e risultato finale più controllato</h2>
          <p>
            Un cantiere ben seguito riduce incomprensioni, tempi morti e dettagli lasciati a metà.
            Per questo puntiamo su informazioni chiare, fasi leggibili e controllo delle finiture.
          </p>
          <a className="button button-secondary" href="#/chi-siamo">Chi siamo</a>
        </div>
      </section>

      <CTASection
        title="Hai un lavoro da valutare?"
        text="Raccontaci il tipo di intervento, allega eventuali foto e riceverai un primo contatto per capire tempi, necessità e prossimi passaggi."
      />
    </>
  )
}
