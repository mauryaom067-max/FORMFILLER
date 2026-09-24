import { Link } from 'react-router-dom'
import { PublicHeader, PublicFooter } from '../components/layout/PublicChrome'
import { Button, Card, Badge } from '../components/ui'

export default function Landing() {
  return (
    <div className="bg-white">
      <PublicHeader />
      <Hero />
      <TrustSection />
      <HowItWorks />
      <Features />
      <SupportedForms />
      <SecuritySection />
      <FinalCta />
      <PublicFooter />
    </div>
  )
}

function Hero() {
  return (
    <section className="max-w-content mx-auto px-8 pt-20 pb-24 grid lg:grid-cols-[1fr_460px] gap-16 items-center">
      <div>
        <h1 className="font-display text-[44px] leading-[1.1] font-bold text-ink max-w-lg">
          Fill forms. Without the form filling.
        </h1>
        <p className="mt-5 text-lg text-ink-soft max-w-md leading-relaxed">
          Store your documents once, securely reuse them when needed, and get your applications processed with less manual work.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Button as={Link} to="/signup" size="lg">Get Started</Button>
          <a href="#how-it-works" className="text-sm font-medium text-ink-soft hover:text-ink px-2 py-3">
            See how it works
          </a>
        </div>
        <div className="mt-10 flex items-center gap-6 text-xs text-ink-faint">
          <span>Built for JEE Main, with more forms coming</span>
        </div>
      </div>
      <ProcessVisual />
    </section>
  )
}

function ProcessVisual() {
  const stages = [
    { label: 'Document Vault', detail: '4 documents stored' },
    { label: 'Form', detail: 'JEE Main \u2014 Session 2' },
    { label: 'Processing', detail: 'Extracting & validating' },
    { label: 'Completed', detail: 'Ready for submission' },
  ]
  return (
    <Card className="p-7">
      <div className="space-y-0">
        {stages.map((s, i) => (
          <div key={s.label} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                i === 0 ? 'bg-brand-500 text-white' : i < 3 ? 'bg-brand-50 text-brand-600' : 'bg-success-bg text-success'
              }`}>
                {i === 3 ? '\u2713' : i + 1}
              </div>
              {i < stages.length - 1 && <div className="w-px flex-1 bg-line" style={{ minHeight: 36 }} />}
            </div>
            <div className="pb-8">
              <p className="text-sm font-semibold text-ink">{s.label}</p>
              <p className="text-xs text-ink-faint mt-0.5">{s.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-3 border-t border-line flex items-center justify-between">
        <span className="text-xs text-ink-faint">JEE Main Application</span>
        <Badge tone="green">On track</Badge>
      </div>
    </Card>
  )
}

function TrustSection() {
  return (
    <section className="bg-surface border-y border-line">
      <div className="max-w-content mx-auto px-8 py-20 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="font-display text-3xl font-bold text-ink">Your documents stay yours.</h2>
          <p className="mt-4 text-ink-soft leading-relaxed max-w-md">
            Storing a document in your Vault does not automatically make it available for processing.
            Every application requires your explicit permission before any document is used.
          </p>
        </div>
        <Card className="p-0 overflow-hidden">
          <div className="p-6 flex items-center justify-between border-b border-line">
            <div>
              <p className="text-sm font-medium text-ink">Aadhaar Card</p>
              <p className="text-xs text-ink-faint mt-0.5">Stored in your Vault</p>
            </div>
            <Badge tone="gray">Not shared</Badge>
          </div>
          <div className="p-6 bg-brand-50/50">
            <p className="text-sm text-ink-soft mb-4">
              Allow FormFiller to use this document for your JEE Main application?
            </p>
            <div className="flex gap-3">
              <Button size="sm">Allow</Button>
              <Button size="sm" variant="secondary">Cancel</Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { n: '01', title: 'Store documents', desc: 'Add your identity and academic documents to your private Vault, once.' },
    { n: '02', title: 'Choose a form', desc: 'Select the application you need to complete, starting with JEE Main.' },
    { n: '03', title: 'Give permission', desc: 'Explicitly approve which stored documents this application can use.' },
    { n: '04', title: 'Review & pay', desc: 'Check your auto-filled details, then complete a single payment.' },
    { n: '05', title: 'Operator processes, you approve', desc: 'An operator handles the official form; you give the final sign-off.' },
  ]
  return (
    <section id="how-it-works" className="max-w-content mx-auto px-8 py-24">
      <h2 className="font-display text-3xl font-bold text-ink max-w-md">How it works</h2>
      <div className="mt-12 grid md:grid-cols-5 gap-6">
        {steps.map((s) => (
          <div key={s.n} className="border-t-2 border-ink pt-4">
            <span className="text-xs text-ink-faint">{s.n}</span>
            <p className="mt-2 font-medium text-ink">{s.title}</p>
            <p className="mt-2 text-sm text-ink-faint leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Features() {
  const features = [
    { title: 'Secure document vault', desc: 'A single, private place to store identity and academic documents.' },
    { title: 'Permission-based access', desc: 'Documents are only used for an application after you approve it.' },
    { title: 'Document data extraction', desc: 'Key details are pulled from your documents to save you retyping them.' },
    { title: 'Automatic image processing', desc: 'Photos and signatures are checked and prepared to each form\u2019s spec.' },
    { title: 'Form auto-fill', desc: 'Application fields are pre-filled from your verified documents.' },
    { title: 'Operator assistance', desc: 'A trained operator handles the official form submission on your behalf.' },
    { title: 'Live application tracking', desc: 'Follow every stage of your application from payment to submission.' },
    { title: 'Final applicant approval', desc: 'Nothing is submitted until you\u2019ve reviewed and approved it.' },
  ]
  return (
    <section id="features" className="bg-surface border-y border-line">
      <div className="max-w-content mx-auto px-8 py-24">
        <h2 className="font-display text-3xl font-bold text-ink max-w-md">Everything the process needs, in one place</h2>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-line rounded-card overflow-hidden border border-line">
          {features.map((f) => (
            <div key={f.title} className="bg-white p-6">
              <p className="font-medium text-ink">{f.title}</p>
              <p className="mt-2 text-sm text-ink-faint leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SupportedForms() {
  return (
    <section id="forms" className="max-w-content mx-auto px-8 py-24">
      <div className="flex items-end justify-between mb-10">
        <h2 className="font-display text-3xl font-bold text-ink">Supported forms</h2>
        <span className="text-sm text-ink-faint hidden sm:block">More forms are added regularly</span>
      </div>
      <Card className="p-8 grid md:grid-cols-[1fr_auto] gap-8 items-center">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="font-display text-xl font-semibold text-ink">JEE Main</h3>
            <Badge tone="blue">Live</Badge>
          </div>
          <p className="text-sm text-ink-soft max-w-lg leading-relaxed">
            Joint Entrance Examination \u2014 Main. FormFiller handles document collection, auto-fill,
            and operator-assisted submission for the JEE Main application.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {['Documents required', 'Processing', 'Operator assistance'].map((t) => (
              <Badge key={t} tone="gray">{t}</Badge>
            ))}
          </div>
        </div>
        <Button as={Link} to="/signup" variant="dark">Start JEE Main</Button>
      </Card>
    </section>
  )
}

function SecuritySection() {
  const items = [
    { title: 'Encrypted storage', desc: 'Documents are encrypted at rest in your private Vault.' },
    { title: 'Permission-based access', desc: 'Nothing is used without your explicit approval per application.' },
    { title: 'Private documents', desc: 'Your documents are visible only to you unless you grant access.' },
    { title: 'Role-based access', desc: 'Operators only see the application they\u2019re assigned to.' },
    { title: 'Activity logs', desc: 'Key actions on your account and applications are recorded.' },
    { title: 'Secure processing', desc: 'Document processing happens within controlled, audited systems.' },
  ]
  return (
    <section id="security" className="bg-ink">
      <div className="max-w-content mx-auto px-8 py-24">
        <h2 className="font-display text-3xl font-bold text-white max-w-md">Designed with privacy and security in mind</h2>
        <div className="mt-12 grid md:grid-cols-3 gap-x-8 gap-y-10">
          {items.map((it) => (
            <div key={it.title} className="border-l-2 border-white/20 pl-5">
              <p className="font-medium text-white">{it.title}</p>
              <p className="mt-2 text-sm text-white/60 leading-relaxed">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="max-w-content mx-auto px-8 py-24 text-center">
      <h2 className="font-display text-3xl font-bold text-ink">Ready to stop filling forms manually?</h2>
      <div className="mt-8">
        <Button as={Link} to="/signup" size="lg">Get Started</Button>
      </div>
    </section>
  )
}
