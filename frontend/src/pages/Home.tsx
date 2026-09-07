import { Link } from "react-router-dom";
import {
  Zap,
  Search,
  Users,
  BarChart3,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { Button } from "../components/ui/Button.js";

const FEATURES = [
  {
    icon: Search,
    title: "Smart Job Search",
    description: "Filter and discover roles that match your skills and goals.",
  },
  {
    icon: Users,
    title: "Candidate Pipelines",
    description: "Move applicants through screening, interviews, and offers in one place.",
  },
  {
    icon: MessageSquare,
    title: "Built-in Messaging",
    description: "Keep candidate and recruiter conversations organized and in context.",
  },
  {
    icon: BarChart3,
    title: "Hiring Analytics",
    description: "Track pipeline health and time-to-hire with clear reporting.",
  },
];

const STEPS = [
  { step: "1", title: "Create your profile", description: "Set up a candidate or company profile in minutes." },
  { step: "2", title: "Post or apply", description: "Recruiters list roles; candidates find and apply to them." },
  { step: "3", title: "Hire with confidence", description: "Interview, message, and offer — all tracked end-to-end." },
];

export function Home(): JSX.Element {
  return (
    <div className="min-h-screen bg-surface">
      {/* Top nav */}
      <header className="border-b border-surface-border bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-navy-900">
              <Zap className="h-4 w-4 text-white" />
            </span>
            <span className="text-base font-semibold text-navy-900">HireLynk</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <h1 className="mx-auto max-w-2xl text-3xl font-semibold text-navy-900 sm:text-4xl">
          Find your next opportunity. Hire great talent.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-navy-500">
          HireLynk is a modern recruitment platform that brings candidates and recruiters
          together with a clean, focused workflow — from application to offer.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/register">
            <Button size="lg">
              Find jobs
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="outline" size="lg">
              Hire talent
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-surface-border bg-surface-card p-5 shadow-card"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-50 text-accent-600">
                <feature.icon className="h-4.5 w-4.5" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-navy-900">{feature.title}</h3>
              <p className="mt-1 text-sm text-navy-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-surface-border bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-semibold text-navy-900">How it works</h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map((item) => (
              <div key={item.step} className="text-center">
                <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-sm font-semibold text-white">
                  {item.step}
                </span>
                <h3 className="mt-3 text-sm font-semibold text-navy-900">{item.title}</h3>
                <p className="mt-1 text-sm text-navy-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-success-50 text-success-600">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <h2 className="mt-4 text-2xl font-semibold text-navy-900">
          Built for a focused, transparent hiring process
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-navy-500">
          Every application, interview, and offer is tracked in one place — no spreadsheets,
          no lost email threads.
        </p>
        <div className="mt-6">
          <Link to="/register">
            <Button size="lg">Create your free account</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-navy-400 sm:flex-row sm:px-6">
          <span>© {new Date().getFullYear()} HireLynk. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-navy-600">
              Sign in
            </Link>
            <Link to="/register" className="hover:text-navy-600">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
