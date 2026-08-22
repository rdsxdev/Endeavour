import { useState } from "react"
import { Link } from "react-router-dom"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
  UploadCloud,
} from "lucide-react"
import { createCredit } from "../api"
import { usePageTitle } from "../hooks"
import heroRenewable from "../assets/hero-renewable.jpg"

type Status = "idle" | "submitting" | "success" | "error"

export default function CreateCredit() {
  usePageTitle("Create Credit")
  const [status, setStatus] = useState<Status>("idle")
  const [txHash, setTxHash] = useState("")
  const [formData, setFormData] = useState({
    project: "",
    country: "",
    vintage_year: new Date().getFullYear().toString(),
    methodology: "Forest Conservation",
    evidence: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("submitting")
    try {
      const vintage = Number(formData.vintage_year)
      if (!formData.project.trim() || !formData.country.trim() || !vintage) {
        throw new Error("Invalid form")
      }
      const res = await createCredit({
        project: formData.project.trim(),
        country: formData.country.trim(),
        vintage_year: vintage,
      })
      setTxHash(res.tx_hash)
      setStatus("success")
    } catch {
      setStatus("error")
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (status === "error") setStatus("idle")
  }

  if (status === "success") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center bg-ink px-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald/10 text-emerald-deep">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="mt-6 text-4xl font-bold text-paper">Issuance complete</h1>
        <p className="mt-3 max-w-xl text-mute">
          The credit was written through the Endeavour API and is now available
          in the registry data source.
        </p>
        <p className="mt-5 max-w-xl truncate rounded-lg border border-line bg-ink-2 px-4 py-3 font-mono text-xs text-mute">
          {txHash}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => setStatus("idle")}
            className="rounded-lg border border-line bg-ink px-6 py-3 font-semibold text-paper hover:bg-ink-2"
          >
            Issue Another
          </button>
          <Link
            to="/registry"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald px-6 py-3 font-semibold text-white hover:bg-emerald-deep"
          >
            View Registry <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-ink pb-24">
      <section className="relative min-h-[430px] overflow-hidden">
        <img src={heroRenewable} alt="Renewable energy infrastructure" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
        <div className="relative mx-auto flex min-h-[430px] max-w-7xl items-end px-5 pb-14 pt-28 lg:px-8">
          <div className="max-w-3xl text-white">
            <p className="eyebrow text-emerald-bright">Enterprise Issuance</p>
            <h1 className="mt-4 text-5xl font-bold leading-tight sm:text-6xl">
              Create Carbon Credit
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-white/82">
              Register a project, lock its vintage metadata and submit the
              issuance request to Endeavour's blockchain-backed registry.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-[-44px] grid max-w-7xl gap-8 px-5 lg:grid-cols-[0.72fr_1fr] lg:px-8">
        <aside className="relative z-10 rounded-3xl border border-line bg-ink p-7 shadow-2xl shadow-emerald-950/10">
          <p className="eyebrow text-emerald-deep">Workflow</p>
          {[
            ["Project registration", "Capture project, country and vintage metadata."],
            ["Verification package", "Associate evidence and methodology context."],
            ["Blockchain issuance", "Write the credit record through the API."],
          ].map(([title, body], i) => (
            <div key={title} className="mt-7 flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald/10 font-mono text-sm text-emerald-deep">
                0{i + 1}
              </span>
              <div>
                <h3 className="font-semibold text-paper">{title}</h3>
                <p className="mt-1 text-sm text-mute">{body}</p>
              </div>
            </div>
          ))}
        </aside>

        <form onSubmit={handleSubmit} className="relative z-10 rounded-3xl border border-line bg-ink p-6 shadow-2xl shadow-emerald-950/10 sm:p-9">
          {status === "error" && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">Please provide a project, country and valid vintage year.</p>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Project Name" className="sm:col-span-2">
              <input name="project" required value={formData.project} onChange={handleChange} placeholder="e.g. Katingan Peatland Restoration" className="input" />
            </Field>
            <Field label="Country of Origin">
              <input name="country" required value={formData.country} onChange={handleChange} placeholder="e.g. Indonesia" className="input" />
            </Field>
            <Field label="Vintage Year">
              <input name="vintage_year" type="number" min="1990" max="2100" required value={formData.vintage_year} onChange={handleChange} className="input font-mono" />
            </Field>
            <Field label="Methodology">
              <select name="methodology" value={formData.methodology} onChange={handleChange} className="input">
                <option>Forest Conservation</option>
                <option>Reforestation</option>
                <option>Renewable Energy</option>
                <option>Blue Carbon</option>
                <option>Peatland</option>
              </select>
            </Field>
            <Field label="Verification Evidence">
              <input name="evidence" value={formData.evidence} onChange={handleChange} placeholder="Audit package URI or reference" className="input" />
            </Field>
            <Field label="Project Notes" className="sm:col-span-2">
              <textarea name="notes" rows={4} placeholder="Summarize monitoring boundaries, verifier notes and issuance assumptions." className="input resize-none" />
            </Field>
          </div>

          <div className="mt-8 border-t border-line pt-6">
            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald px-8 py-3.5 font-semibold text-white transition hover:bg-emerald-deep disabled:opacity-60 sm:w-auto"
            >
              {status === "submitting" ? (
                "Writing to registry..."
              ) : (
                <>
                  <UploadCloud className="h-5 w-5" /> Issue Credit
                </>
              )}
            </button>
            <p className="mt-4 flex items-center gap-2 text-xs text-mute">
              <ShieldCheck className="h-4 w-4 text-emerald-deep" />
              Issuance preserves the existing backend contract: project, country and vintage year.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={`space-y-2 ${className}`}>
      <span className="flex items-center gap-2 text-sm font-semibold text-paper">
        <FileCheck2 className="h-4 w-4 text-emerald-deep" />
        {label}
      </span>
      {children}
    </label>
  )
}
