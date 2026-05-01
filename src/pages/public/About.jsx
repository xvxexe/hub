import {
  PremiumCTA,
  PremiumHero,
  PremiumProcess,
  PremiumSection,
  PremiumStats,
} from '../../components/PublicComponents'
import { SEO } from '../../components/SEO'
import { SafeImage } from '../../components/SafeImage'
import {
  leadership,
  premiumStats,
  premiumValues,
  teamImage,
  workMethod,
} from '../../data/publicPremiumData'

export function About() {
  return (
    <>
      <SEO
        title="Chi siamo - EuropaService"
        description="EuropaService costruisce valore ogni giorno con precisione, organizzazione, qualità, affidabilità e sicurezza nei cantieri interni."
      />

      <PremiumHero
        eyebrow="Chi siamo"
        title="Costruiamo valore. Ogni giorno."
        text="Siamo una realtà operativa specializzata in edilizia tecnica, cartongesso, ristrutturazioni e finiture interne. Il nostro lavoro unisce presenza in cantiere, metodo e cura del risultato."
        image={teamImage}
        imageAlt="Squadra EuropaService in cantiere"
        primaryLabel="Parla con noi"
        primaryHref="#/contatti"
        secondaryLabel="Scopri i servizi"
        variant="about"
      />

      <PremiumSection eyebrow="Valori" title="I principi che guidano ogni intervento">
        <div className="premium-value-grid">
          {premiumValues.map((value) => (
            <article className="premium-card" key={value}>
              <h3>{value}</h3>
              <p>Un criterio operativo concreto, visibile nel modo in cui prepariamo, eseguiamo e consegniamo ogni lavorazione.</p>
            </article>
          ))}
        </div>
      </PremiumSection>

      <section className="premium-case-split">
        <article>
          <p className="premium-eyebrow">Storia</p>
          <h2>Da squadra di cantiere a partner tecnico per interni complessi.</h2>
          <p>
            EuropaService nasce dall’esperienza diretta nei cantieri e cresce intorno a un’idea semplice:
            un lavoro ben fatto richiede organizzazione, responsabilità e attenzione costante ai dettagli.
          </p>
        </article>
        <article>
          <p className="premium-eyebrow">Missione e visione</p>
          <h2>Portare metodo e qualità in un settore spesso frammentato.</h2>
          <p>
            Vogliamo essere il riferimento per clienti, tecnici e imprese che cercano una squadra seria,
            ordinata e capace di gestire lavorazioni interne con standard elevati.
          </p>
        </article>
      </section>

      <PremiumSection eyebrow="Leadership" title="Referenti chiari, responsabilità chiare" tone="soft">
        <div className="premium-feature-grid">
          {leadership.map((person) => (
            <article className="premium-card" key={person.name}>
              <h3>{person.name}</h3>
              <strong>{person.role}</strong>
              <p>{person.text}</p>
            </article>
          ))}
        </div>
      </PremiumSection>

      <PremiumSection eyebrow="Numeri" title="Una struttura operativa concreta">
        <PremiumStats stats={premiumStats} />
      </PremiumSection>

      <section className="premium-split-section">
        <SafeImage
          alt="Cantiere interno ordinato"
          className="premium-split-image"
          fallbackSrc="/assets/images/placeholders/placeholder-cantiere.jpg"
          src="/assets/images/hero/controsoffitto-cantiere-interno.jpg"
          title="Metodo di lavoro EuropaService"
        />
        <div>
          <p className="premium-eyebrow">Come lavoriamo</p>
          <h2>In cantiere servono ordine, sicurezza e comunicazione.</h2>
          <p>
            Proteggiamo gli spazi, pianifichiamo accessi e materiali, documentiamo le fasi e manteniamo
            una comunicazione leggibile con cliente, direzione lavori e fornitori coinvolti.
          </p>
        </div>
      </section>

      <PremiumSection eyebrow="Metodo" title="Il nostro processo operativo">
        <PremiumProcess steps={workMethod} />
      </PremiumSection>

      <PremiumCTA title="Cerchi una squadra affidabile?" text="Mettiamo ordine nelle lavorazioni interne e trasformiamo il cantiere in un percorso controllabile." />
    </>
  )
}
