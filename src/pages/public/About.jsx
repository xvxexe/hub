import {
  PremiumCTA,
  PremiumHero,
  PremiumImageSplit,
  PremiumProcess,
  PremiumSection,
  PremiumTextCard,
  PremiumTimeline,
} from '../../components/PublicComponents'
import { SEO } from '../../components/SEO'
import {
  operationalMethod,
  premiumValues,
  teamImage,
  workMethod,
} from '../../data/publicPremiumData'
import { driveHeroImages, driveServiceImages } from '../../data/driveProjectPhotos'
import { publicFeaturedVideos } from '../../data/driveProjectVideos'

export function About() {
  return (
    <>
      <SEO
        title="Chi siamo - EuropaService"
        description="EuropaService lavora con metodo, organizzazione e qualità nei cantieri interni."
      />

      <PremiumHero
        eyebrow="Chi siamo"
        title="Una squadra solida dietro ogni risultato"
        text="EuropaService nasce dall’esperienza diretta nei cantieri. Il nostro lavoro unisce presenza operativa, responsabilità, pianificazione e cura dei dettagli."
        image={teamImage}
        imageAlt="Foto reale di cantiere per pagina azienda"
        heroVideo={publicFeaturedVideos.about}
        primaryLabel="Parla con noi"
        primaryHref="#/contatti"
        secondaryLabel="Scopri i servizi"
        variant="about"
        meta={['Squadre coordinate', 'Referenti chiari', 'Qualità controllata', 'Cantiere ordinato']}
      />

      <PremiumSection eyebrow="Identità" title="Non siamo solo esecutori. Siamo un partner operativo." text="Trasformiamo richieste, vincoli e urgenze in un percorso ordinato: sopralluogo, analisi, pianificazione, lavorazione, controllo e consegna." />

      <PremiumImageSplit
        eyebrow="Metodo"
        title="Da squadra di cantiere a struttura organizzata per interni complessi."
        text="Molti problemi nascono dalla mancanza di ordine: decisioni non tracciate, fornitori non coordinati, tempi poco chiari. Per questo lavoriamo con un metodo che aumenta controllo e qualità."
        image={driveHeroImages.method}
        imageAlt="Foto reale di metodo operativo in cantiere"
      >
        <div className="premium-tags">
          <small>Metodo</small>
          <small>Responsabilità</small>
          <small>Presenza</small>
          <small>Consegna</small>
        </div>
      </PremiumImageSplit>

      <PremiumSection eyebrow="Valori" title="I principi che guidano ogni intervento" tone="soft">
        <div className="premium-value-grid">
          {premiumValues.map((value) => (
            <PremiumTextCard key={value.title} title={value.title} text={value.text} />
          ))}
        </div>
      </PremiumSection>

      <section className="premium-case-split">
        <article>
          <p className="premium-eyebrow">Missione</p>
          <h2>Portare metodo e qualità in cantieri spesso complessi.</h2>
          <p>La nostra missione è rendere le lavorazioni interne più controllabili: più documentazione, meno passaggi confusi e una consegna coerente con il livello richiesto.</p>
        </article>
        <article>
          <p className="premium-eyebrow">Visione</p>
          <h2>Diventare un partner affidabile per cantieri interni ordinati.</h2>
          <p>Vogliamo essere un riferimento per clienti, tecnici e imprese che cercano una squadra seria, presente e capace di lavorare con standard elevati.</p>
        </article>
      </section>

      <PremiumImageSplit
        eyebrow="Come lavoriamo"
        title="In cantiere servono ordine, sicurezza e comunicazione."
        text="Proteggiamo gli spazi, pianifichiamo accessi e materiali, documentiamo le fasi e manteniamo una comunicazione leggibile con cliente, direzione lavori e fornitori coinvolti."
        image={driveServiceImages.gestioneCantiere}
        imageAlt="Foto reale di gestione operativa in cantiere"
        reverse
      >
        <PremiumTimeline items={operationalMethod} />
      </PremiumImageSplit>

      <PremiumSection eyebrow="Metodo" title="Il nostro processo operativo" tone="soft">
        <PremiumProcess steps={workMethod} />
      </PremiumSection>

      <PremiumSection eyebrow="Standard interno" title="Cosa controlliamo prima della consegna">
        <div className="premium-feature-grid">
          <PremiumTextCard title="Allineamenti e quote" text="Verifichiamo pareti, velette, aperture e chiusure in relazione al progetto e agli impianti." />
          <PremiumTextCard title="Superfici e dettagli" text="Controlliamo rasature, giunti, riprese, spigoli e punti critici prima di considerare finito un ambiente." />
          <PremiumTextCard title="Pulizia e ordine finale" text="La consegna deve essere leggibile: spazi liberi, residui gestiti e lavorazioni concluse." />
        </div>
      </PremiumSection>

      <PremiumCTA title="Cerchi una squadra affidabile?" text="Mettiamo ordine nelle lavorazioni interne e trasformiamo il cantiere in un percorso controllabile." />
    </>
  )
}
