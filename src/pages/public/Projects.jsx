import { useMemo, useState } from 'react'
import {
  PremiumCTA,
  PremiumHero,
  PremiumImageSplit,
  PremiumProjectCard,
  PremiumSection,
  PremiumStats,
  PremiumTextCard,
  TestimonialMock,
} from '../../components/PublicComponents'
import { PremiumChipMarquee } from '../../components/PremiumChipMarquee'
import { SEO } from '../../components/SEO'
import {
  partners,
  premiumStats,
  testimonials,
} from '../../data/publicPremiumData'
import { realPublicProjects } from '../../data/publicRealData'
import { serviceImages } from '../../data/publicImages'

const categories = ['Tutti', 'Hospitality']

export function Projects() {
  const [category, setCategory] = useState('Tutti')
  const filteredProjects = useMemo(
    () => realPublicProjects.filter((project) => category === 'Tutti' || project.category === category),
    [category],
  )
  const featured = realPublicProjects[0]

  return (
    <>
      <SEO
        title="Cantieri e portfolio"
        description="Portfolio EuropaService aggiornato con i cantieri reali presenti nell’area privata, mantenendo foto generiche fino ad approvazione pubblica."
      />

      <PremiumHero
        eyebrow="Cantieri reali"
        title="Cantieri collegati ai dati dell’area privata"
        text="La sezione cantieri usa i dati operativi interni: lavorazioni, tab, movimenti e riepiloghi del master. Le immagini restano generiche finché non vengono approvate foto pubblicabili."
        image={featured.image}
        imageAlt={featured.alt}
        primaryLabel="Richiedi un lavoro simile"
        secondaryLabel="Apri case study"
        secondaryHref={`#/cantieri/${featured.id}`}
        variant="compact"
        meta={['Dati area privata', 'Master contabile', 'Foto generiche', 'Cantieri reali']}
      />

      <PremiumSection title="Dati operativi in evidenza" text="I dati pubblici sono ricavati dal sistema interno: Barcelò Roma, sotto-lavorazioni e riepiloghi per tab. Le cifre servono come sintesi pubblica del lavoro tracciato, non come contabilità completa.">
        <PremiumStats stats={[
          { value: '1', label: 'cantiere reale collegato al master interno' },
          { value: '20', label: 'tab/lavorazioni importate dal sistema privato' },
          { value: '68', label: 'movimenti letti dal dettaglio operativo' },
          { value: '26.676,38 €', label: 'totale tracciato nel riepilogo interno' },
        ]} />
      </PremiumSection>

      <PremiumSection title="Filtra i progetti" text="Per ora i cantieri pubblici sono collegati al cantiere reale Barcelò Roma e alle sue sotto-lavorazioni." tone="soft">
        <div className="premium-filter-pills" role="list" aria-label="Categorie portfolio">
          {categories.map((item) => (
            <button
              aria-pressed={category === item}
              key={item}
              type="button"
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Cantiere in evidenza" title={featured.title} text={featured.longText}>
        <div className="premium-featured-project">
          <PremiumProjectCard featured project={featured} />
          <div className="premium-metric-panel">
            {featured.metrics.map((metric) => <strong key={metric}>{metric}</strong>)}
            <p>{featured.summary}</p>
            <a className="premium-button premium-button-primary" href={`#/cantieri/${featured.id}`}>Apri case study</a>
          </div>
        </div>
      </PremiumSection>

      <PremiumImageSplit
        eyebrow="Come leggiamo un progetto"
        title="Il portfolio pubblico parte dal cantiere reale, non da esempi finti."
        text="Ogni scheda pubblica deriva da una lavorazione o da un riepilogo interno: piscina, soffitti, scala/aiuola, scarichi/pergole e altre attività. Le immagini sono ancora generiche per evitare di pubblicare foto non approvate."
        image={serviceImages.finitureInterne.src}
        imageAlt={serviceImages.finitureInterne.alt}
        reverse
      >
        <div className="premium-feature-grid">
          <PremiumTextCard title="Prima" text="I dati nascono dal master, dai tab e dai documenti della parte privata." />
          <PremiumTextCard title="Durante" text="Le lavorazioni vengono raccontate come aree operative del cantiere, non come righe contabili sparse." />
          <PremiumTextCard title="Dopo" text="Quando le foto saranno approvate, potranno sostituire le immagini generiche." />
        </div>
      </PremiumImageSplit>

      <PremiumSection
        eyebrow="Griglia cantieri"
        title="Cantieri e lavorazioni reali"
        text="Le schede sotto usano dati della parte privata. Foto e immagini rimangono generiche finché non vengono validate per uso pubblico."
        tone="soft"
      >
        <div className="premium-project-grid">
          {filteredProjects.map((project) => <PremiumProjectCard key={project.id} project={project} />)}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Cosa trovi nei case study" title="Informazioni operative, non solo immagini">
        <div className="premium-feature-grid">
          <PremiumTextCard title="Dati chiave" text="Movimenti, importi tracciati, anno, città, settore e lavorazioni coinvolte." />
          <PremiumTextCard title="Sfida e soluzione" text="Il problema reale del cantiere e come viene gestito nel sistema operativo interno." />
          <PremiumTextCard title="Risultati" text="Più ordine tra tab, documenti, riepilogo e racconto pubblico del cantiere." />
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Partner" title="Una rete operativa affidabile" tone="soft">
        <PremiumChipMarquee items={partners} className="premium-logo-row" ariaLabel="Partner e filiera" speed="slow" />
      </PremiumSection>

      <PremiumSection eyebrow="Testimonianze" title="Cosa apprezzano i clienti">
        <div className="premium-testimonial-grid">
          {testimonials.map((testimonial) => <TestimonialMock key={testimonial.author} testimonial={testimonial} />)}
        </div>
      </PremiumSection>

      <PremiumCTA title="Hai un cantiere da organizzare?" text="Partiamo da obiettivi, tempi e vincoli. Il resto lo trasformiamo in un piano operativo chiaro." />
    </>
  )
}
