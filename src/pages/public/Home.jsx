import {
  CTASection,
  HeroSection,
  ProcessSteps,
  ProjectCard,
  SectorCard,
  StatsBand,
  TestimonialMock,
} from '../../components/PublicComponents'
import { Section } from '../../components/Section'
import { companyStats, publicServices, workProcess } from '../../data/mockPublicServices'
import { publicProjects } from '../../data/mockPublicProjects'
import { mockTestimonials, sectors, whyChooseUs } from '../../data/mockSectors'

export function Home() {
  return (
    <>
      <HeroSection
        eyebrow="Edilizia e cartongesso"
        title="Edilizia, cartongesso e finiture interne gestite con metodo."
        text="EuropaService si occupa di edilizia, cartongesso, controsoffitti, finiture interne e gestione cantieri con metodo, precisione e affidabilità."
      >
        <div className="hero-panel" aria-label="Sintesi EuropaService">
          <span>cantieri ordinati</span>
          <strong>Hotel, negozi, aziende e abitazioni</strong>
          <p>Un interlocutore operativo per lavorazioni interne, ripristini, finiture e coordinamento.</p>
        </div>
      </HeroSection>

      <Section title="Servizi principali" intro="Soluzioni per interni tecnici, residenziali e commerciali.">
        <div className="public-grid">
          {publicServices.slice(0, 6).map((service) => (
            <article className="public-card" key={service.id}>
              <span className="service-icon">{service.icon}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Cantieri in evidenza" tone="muted">
        <div className="public-project-grid">
          {publicProjects.slice(0, 3).map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      </Section>

      <Section title="Perché scegliere EuropaService">
        <div className="public-grid">
          {whyChooseUs.map((item) => (
            <article className="public-card" key={item}>
              <h3>{item}</h3>
              <p>Metodo operativo, comunicazione chiara e attenzione alla qualità del risultato finale.</p>
            </article>
          ))}
        </div>
      </Section>

      <StatsBand stats={companyStats} />

      <Section title="Processo di lavoro in 4 step">
        <ProcessSteps steps={workProcess} />
      </Section>

      <Section title="Clienti e settori serviti" tone="muted">
        <div className="public-grid">
          {sectors.slice(0, 4).map((sector) => <SectorCard key={sector.id} sector={sector} />)}
        </div>
      </Section>

      <Section title="Feedback mock">
        <div className="public-grid two-cols">
          {mockTestimonials.map((testimonial) => (
            <TestimonialMock key={testimonial.author} testimonial={testimonial} />
          ))}
        </div>
      </Section>

      <CTASection text="Descrivi il lavoro, indica città e urgenza: la richiesta resta mock, ma il flusso è pronto per una demo professionale." />
    </>
  )
}
