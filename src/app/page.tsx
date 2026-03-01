import Link from "next/link";
import { Search, Sparkles, Mail, BarChart3, ArrowRight, Heart, Shield, Zap } from "lucide-react";

const steps = [
 {
 icon: Search,
 title: "Prospect",
 description: "Search for local businesses near you using Google Maps. Find hardware stores, restaurants, and more.",
 color: "from-red-500 ",
 },
 {
 icon: Sparkles,
 title: "Enrich",
 description: "We scrape each business's website to understand what they do and what they care about.",
 color: "from-violet-500 ",
 },
 {
 icon: Mail,
 title: "Generate",
 description: "AI writes a personalized outreach email tailored to both your campaign and the business.",
 color: "from-pink-500 ",
 },
 {
 icon: BarChart3,
 title: "Outreach",
 description: "Review, edit, and send emails from your dashboard. Track opens, replies, and sponsorships.",
 color: "from-amber-500 ",
 },
];

const stats = [
 { value: "4x", label: "Higher response rate" },
 { value: "10min", label: "Average setup time" },
 { value: "500+", label: "Organizations served" },
];

export default function HomePage() {
 return (
 <div className="min-h-screen bg-surface-950">
 {/* ── Navigation ─────────────────────────────────── */}
 <nav className="fixed top-0 left-0 right-0 z-50 border-b border-surface-800/50 bg-surface-950/80 backdrop-blur-xl">
 <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
 <Link href="/" className="flex items-center gap-2">
 <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-va-dark ">
 <Heart className="h-5 w-5 text-white" />
 </div>
 <span className="text-lg font-bold text-surface-100">
 Sponsor<span className="gradient-text">MyThing</span>
 </span>
 </Link>
 <div className="flex items-center gap-3">
 <Link href="/login" className="btn-secondary text-sm">
 Log in
 </Link>
 <Link href="/signup" className="btn-primary text-sm">
 Get Started <ArrowRight className="h-4 w-4" />
 </Link>
 </div>
 </div>
 </nav>

 {/* ── Hero ───────────────────────────────────────── */}
 <section className="relative overflow-hidden pt-32 pb-20">
 {/* Background effects */}
 <div className="absolute inset-0 -z-10">
 <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-sm bg-brand-600/20 hidden" />
 <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-sm bg-purple-600/15 hidden" />
 </div>

 <div className="mx-auto max-w-7xl px-6 text-center">
 <div className="animate-fade-in">
 <div className="mb-6 inline-flex items-center gap-2 rounded-sm border border-brand-500/20 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-300">
 <Zap className="h-3.5 w-3.5" />
 AI-Powered Sponsorship Outreach
 </div>

 <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
 Find local sponsors for{" "}
 <span className="gradient-text">your cause</span>
 </h1>

 <p className="mx-auto mt-6 max-w-2xl text-lg text-surface-400 leading-relaxed">
 SponsorMyThing helps non-profits, PTAs, and youth sports leagues discover nearby
 businesses and send AI-personalized sponsorship emails — in minutes, not weeks.
 </p>

 <div className="mt-10 flex items-center justify-center gap-4">
 <Link href="/signup" className="btn-primary px-8 py-3 text-base">
 Start for Free <ArrowRight className="h-5 w-5" />
 </Link>
 <Link href="#how-it-works" className="btn-secondary px-8 py-3 text-base">
 See How It Works
 </Link>
 </div>
 </div>

 {/* Stats row */}
 <div className="mt-20 flex items-center justify-center gap-12 sm:gap-20">
 {stats.map((stat) => (
 <div key={stat.label} className="text-center">
 <div className="text-3xl font-extrabold gradient-text">{stat.value}</div>
 <div className="mt-1 text-sm text-surface-500">{stat.label}</div>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* ── How It Works ───────────────────────────────── */}
 <section id="how-it-works" className="py-24">
 <div className="mx-auto max-w-7xl px-6">
 <div className="text-center">
 <h2 className="text-3xl font-bold sm:text-4xl">
 Four steps to <span className="gradient-text">sponsorship success</span>
 </h2>
 <p className="mx-auto mt-4 max-w-xl text-surface-400">
 From finding businesses to sending personalized outreach — we automate the hard parts.
 </p>
 </div>

 <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
 {steps.map((step, i) => (
 <div
 key={step.title}
 className="glass-card glass-card-hover p-6"
 style={{ animationDelay: `${i * 100}ms` }}
 >
 <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-sm bg-va-dark ${step.color}`}>
 <step.icon className="h-6 w-6 text-white" />
 </div>
 <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-surface-500">
 Step {i + 1}
 </div>
 <h3 className="mb-2 text-lg font-bold text-surface-100">{step.title}</h3>
 <p className="text-sm leading-relaxed text-surface-400">{step.description}</p>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* ── Trust Section ──────────────────────────────── */}
 <section className="border-t border-surface-800/50 py-24">
 <div className="mx-auto max-w-7xl px-6">
 <div className="glass-card mx-auto max-w-3xl p-12 text-center ">
 <Shield className="mx-auto mb-4 h-10 w-10 text-brand-400" />
 <h2 className="text-2xl font-bold sm:text-3xl">
 Built for trust & <span className="gradient-text">privacy</span>
 </h2>
 <p className="mx-auto mt-4 max-w-lg text-surface-400 leading-relaxed">
 Your data stays yours. We never share your contacts, emails, or campaign data.
 Every email is reviewed by you before sending — always human-in-the-loop.
 </p>
 <Link href="/signup" className="btn-primary mt-8 inline-flex px-8 py-3 text-base">
 Get Started Free <ArrowRight className="h-5 w-5" />
 </Link>
 </div>
 </div>
 </section>

 {/* ── Footer ─────────────────────────────────────── */}
 <footer className="border-t border-surface-800/50 py-10">
 <div className="mx-auto max-w-7xl px-6 text-center text-sm text-surface-500">
 <p>© {new Date().getFullYear()} SponsorMyThing.com — All rights reserved.</p>
 </div>
 </footer>
 </div>
 );
}
