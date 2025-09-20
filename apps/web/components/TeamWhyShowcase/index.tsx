import { useRef } from 'react'
import BackgroundFx from './BackgroundFx'
import TitlePair from './TitlePair'
import Card from './Card'
import { useScrollStage } from './useScrollStage'

export default function TeamWhyShowcase() {
  const ref = useRef<HTMLElement>(null)
  const { play } = useScrollStage(ref)

  return (
    <section
      ref={ref}
      className="relative rounded-[28px] overflow-hidden ring-1 ring-white/10 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(255,122,26,.25),transparent),linear-gradient(135deg,rgba(255,122,26,.25),rgba(198,86,26,.2),rgba(14,12,10,.8))] p-8 md:p-12 my-16 md:my-24"
    >
      <BackgroundFx play={play} />

      <div className="relative z-10 max-w-7xl mx-auto">
        <TitlePair play={play} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-7">
          {/* Left column */}
          <div className="space-y-6 md:space-y-7">
            <Card
              metric="2"
              title="Founders & Engineers"
              subtitle="Frontend + UI/UX — Backend + Smart Contract"
              delay={0}
            />

            <Card
              metric="MVP → Prod"
              title="Hackathon → Global"
              subtitle="Born in hackathons, now scaling worldwide"
              delay={0.06}
            />

            <Card
              metric="24/7"
              title="Built for Trust"
              subtitle="Deep analysis, risk scoring, instant & secure execution"
              delay={0.12}
            />
          </div>

          {/* Right column */}
          <div className="space-y-6 md:space-y-7">
            <Card
              title="Curated, not exhaustive"
              delay={0.18}
            >
              We handpick the best yield opportunities, focusing on quality over quantity to ensure optimal returns and minimal risk.
            </Card>

            <Card
              title="Transparent metrics"
              delay={0.24}
            >
              Real-time APR/APY calculations with comprehensive risk analysis, audited protocols, and clear performance tracking.
            </Card>

            <div className="space-y-6 md:space-y-7">
              <Card
                title="Non-custodial by design"
                delay={0.30}
              >
                Your funds remain in your control at all times. We never hold your assets—just facilitate secure, optimized deposits.
              </Card>

              <Card
                title="Solution-oriented development"
                delay={0.36}
              >
                Built by DeFi natives solving real yield farming challenges. Every feature addresses actual user needs and market gaps.
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
