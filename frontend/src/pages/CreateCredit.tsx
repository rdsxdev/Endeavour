import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { createCredit } from "../api";
import { usePageTitle } from "../hooks";
import Reveal from "../components/Reveal";

type Status = "idle" | "submitting" | "success" | "error";

const STEPS = [
  {
    num: "01",
    title: "Project registration",
    body: "Capture project name, jurisdiction, and vintage metadata.",
  },
  {
    num: "02",
    title: "Pool assignment",
    body: "Route to CarbonPool, BioPool, or Green Bond Vault based on asset class.",
  },
  {
    num: "03",
    title: "On-chain issuance",
    body: "Write the credit record through Endeavour's registry API.",
  },
];

export default function CreateCredit() {
  usePageTitle("Create Credit");
  const [status, setStatus] = useState<Status>("idle");
  const [txHash, setTxHash] = useState("");
  const [formData, setFormData] = useState({
    project: "",
    country: "",
    vintage_year: new Date().getFullYear().toString(),
    methodology: "Forest Conservation",
    pool: "carbon",
    evidence: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const vintage = Number(formData.vintage_year);
      if (!formData.project.trim() || !formData.country.trim() || !vintage) {
        throw new Error("Invalid form");
      }
      const res = await createCredit({
        project: formData.project.trim(),
        country: formData.country.trim(),
        vintage_year: vintage,
      });
      setTxHash(res.tx_hash);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (status === "error") setStatus("idle");
  }

  if (status === "success") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-5 text-center">
        <Reveal>
          <p className="font-mono text-4xl text-emerald-deep">✓</p>
          <h1 className="font-serif mt-6 text-4xl text-paper">
            Issuance complete
          </h1>
          <p className="mt-3 max-w-xl text-mute">
            The credit was written to the registry and is now available for
            settlement.
          </p>
          <p className="mt-5 max-w-xl truncate border border-line bg-ink-2 px-4 py-3 font-mono text-xs text-mute">
            {txHash}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="border border-line px-6 py-3 text-sm font-medium text-paper hover:bg-ink-2"
            >
              Issue another
            </button>
            <Link
              to="/registry"
              className="inline-flex items-center justify-center gap-2 bg-emerald px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-deep"
            >
              View registry <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <section className="relative min-h-[380px] overflow-hidden border-b border-line">
        <img
          src={
            "https://images.unsplash.com/photo-1506260408121-e353d10b87c7?q=80&w=1228&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          }
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-paper/90 via-paper/70 to-paper/30" />
        <div className="relative mx-auto flex min-h-[380px] max-w-7xl items-end px-5 pb-12 pt-28 lg:px-8">
          <Reveal>
            <p className="eyebrow text-emerald-bright">Token issuance</p>
            <h1 className="font-serif mt-3 text-4xl text-ink sm:text-5xl">
              Create credit
            </h1>
            <p className="mt-4 max-w-xl text-ink/70">
              Register a verified environmental asset and assign it to the
              appropriate token pool.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto mt-10 grid max-w-7xl gap-8 px-5 lg:grid-cols-[0.65fr_1fr] lg:px-8">
        <Reveal>
          <aside className="surface p-7">
            <p className="label">Workflow</p>
            <ol className="mt-6 space-y-8">
              {STEPS.map((step) => (
                <li key={step.num} className="flex gap-4">
                  <span className="font-mono text-sm text-emerald-deep">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="font-medium text-paper">{step.title}</h3>
                    <p className="mt-1 text-sm text-mute">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </Reveal>

        <Reveal delay={100}>
          <form onSubmit={handleSubmit} className="surface p-6 sm:p-8">
            {status === "error" && (
              <p className="mb-6 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
                Please provide a project, country, and valid vintage year.
              </p>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Project name" className="sm:col-span-2">
                <input
                  name="project"
                  required
                  value={formData.project}
                  onChange={handleChange}
                  placeholder="Katingan Peatland Restoration"
                  className="input"
                />
              </Field>
              <Field label="Country">
                <input
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Indonesia"
                  className="input"
                />
              </Field>
              <Field label="Vintage year">
                <input
                  name="vintage_year"
                  type="number"
                  min="1990"
                  max="2100"
                  required
                  value={formData.vintage_year}
                  onChange={handleChange}
                  className="input font-mono"
                />
              </Field>
              <Field label="Token pool">
                <select
                  name="pool"
                  value={formData.pool}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="carbon">CarbonPool (eCO₂)</option>
                  <option value="bio">BioPool (eBIO)</option>
                  <option value="bond">Green Bond Vault (eGBND)</option>
                </select>
              </Field>
              <Field label="Methodology">
                <select
                  name="methodology"
                  value={formData.methodology}
                  onChange={handleChange}
                  className="input"
                >
                  <option>Forest Conservation</option>
                  <option>Reforestation</option>
                  <option>Renewable Energy</option>
                  <option>Blue Carbon</option>
                  <option>Peatland</option>
                </select>
              </Field>
              <Field label="Verification evidence" className="sm:col-span-2">
                <input
                  name="evidence"
                  value={formData.evidence}
                  onChange={handleChange}
                  placeholder="Audit package URI or reference"
                  className="input"
                />
              </Field>
            </div>

            <div className="mt-8 border-t border-line pt-6">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="bg-emerald px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-deep disabled:opacity-60"
              >
                {status === "submitting"
                  ? "Writing to registry…"
                  : "Issue credit"}
              </button>
              <p className="mt-4 text-xs text-mute">
                Issuance preserves the backend contract: project, country, and
                vintage year.
              </p>
            </div>
          </form>
        </Reveal>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
