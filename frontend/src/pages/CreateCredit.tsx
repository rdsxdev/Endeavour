import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  MapPin,
  Calendar,
  Layers,
  FileText,
  Leaf,
  ArrowRight,
  Info,
} from "lucide-react"
import { createCredit, type TxResponse } from "../api"
import PageHeader from "../components/PageHeader"

const COUNTRIES = [
  "Indonesia",
  "Brazil",
  "India",
  "Kenya",
  "Peru",
  "DR Congo",
  "Malaysia",
  "Pakistan",
  "United States",
  "Canada",
  "United Kingdom",
  "China",
  "Colombia",
  "Mexico",
  "Vietnam",
  "Thailand",
  "Philippines",
  "Tanzania",
  "Ethiopia",
  "Nigeria",
].sort()

const CATEGORIES = [
  { value: "Forest Conservation", label: "Forest Conservation (REDD+)" },
  { value: "Reforestation", label: "Reforestation / Afforestation" },
  { value: "Renewable Energy", label: "Renewable Energy" },
  { value: "Blue Carbon", label: "Blue Carbon (Mangrove/Coastal)" },
  { value: "Peatland", label: "Peatland Restoration" },
  { value: "Soil Carbon", label: "Soil Carbon Sequestration" },
  { value: "Improved Forest Management", label: "Improved Forest Management" },
]

const VINTAGE_YEARS = Array.from({ length: 10 }, (_, i) => 2025 - i)

type FormData = {
  projectName: string
  country: string
  category: string
  vintageYear: number
  carbonVolume: string
  description: string
}

type FormErrors = Partial<Record<keyof FormData, string>>

const initialState: FormData = {
  projectName: "",
  country: "",
  category: "",
  vintageYear: 0,
  carbonVolume: "",
  description: "",
}

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {}

  if (!data.projectName.trim()) {
    errors.projectName = "Project name is required"
  } else if (data.projectName.trim().length < 5) {
    errors.projectName = "Project name must be at least 5 characters"
  } else if (data.projectName.trim().length > 120) {
    errors.projectName = "Project name must be 120 characters or less"
  }

  if (!data.country) {
    errors.country = "Please select a country"
  }

  if (!data.category) {
    errors.category = "Please select a project category"
  }

  if (!data.vintageYear) {
    errors.vintageYear = "Please select a vintage year"
  }

  const volume = parseFloat(data.carbonVolume)
  if (!data.carbonVolume.trim()) {
    errors.carbonVolume = "Carbon volume is required"
  } else if (isNaN(volume) || volume <= 0) {
    errors.carbonVolume = "Enter a valid positive number"
  } else if (volume > 10_000_000) {
    errors.carbonVolume = "Volume cannot exceed 10,000,000 tCO₂e"
  }

  if (data.description.trim() && data.description.trim().length < 20) {
    errors.description = "Description must be at least 20 characters if provided"
  } else if (data.description.trim().length > 1000) {
    errors.description = "Description must be 1000 characters or less"
  }

  return errors
}

export default function CreateCredit() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>(initialState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<TxResponse | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (showSuccess) setShowSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationErrors = validateForm(formData)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) return

    setSubmitting(true)
    try {
      const response = await createCredit({
        project: formData.projectName.trim(),
        country: formData.country,
        vintage_year: formData.vintageYear,
      })
      setResult(response)
      setShowSuccess(true)
      setTimeout(() => {
        navigate("/registry")
      }, 2500)
    } catch (err) {
      setErrors({ projectName: "Failed to submit. Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Credit Issuance"
        title="Create Carbon Credit"
        intro="Issue a new carbon credit to the on-chain registry. All fields are recorded permanently on the blockchain and cannot be modified after submission."
      />

      <div className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
        {/* Success toast */}
        {showSuccess && (
          <div className="animate-fade-in mb-8 flex items-start gap-4 rounded-xl border border-emerald/30 bg-emerald/10 p-5 text-emerald-bright">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Credit issued successfully</p>
              <p className="mt-1 text-sm opacity-80">
                Transaction hash:{" "}
                <span className="font-mono text-xs">
                  {result?.tx_hash ?? "—"}
                </span>
              </p>
              <p className="mt-2 text-sm opacity-80">
                Redirecting to registry…
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <label
              htmlFor="projectName"
              className="flex items-center gap-2 text-sm font-medium text-paper"
            >
              <FileText className="h-4 w-4 text-mute" />
              Project Name
            </label>
            <input
              id="projectName"
              type="text"
              value={formData.projectName}
              onChange={(e) => updateField("projectName", e.target.value)}
              placeholder="e.g. Rimba Raya Biodiversity Reserve"
              className={`w-full rounded-xl border bg-ink-2 px-4 py-3.5 text-paper outline-none transition-all placeholder:text-mute/60 focus:ring-2 ${
                errors.projectName
                  ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                  : "border-line focus:border-emerald focus:ring-emerald/20"
              }`}
              disabled={submitting}
            />
            {errors.projectName && (
              <p className="flex items-center gap-1.5 text-sm text-red-400">
                <AlertCircle className="h-4 w-4" />
                {errors.projectName}
              </p>
            )}
          </div>

          {/* Country + Category row */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Country */}
            <div className="space-y-2">
              <label
                htmlFor="country"
                className="flex items-center gap-2 text-sm font-medium text-paper"
              >
                <MapPin className="h-4 w-4 text-mute" />
                Country
              </label>
              <div className="relative">
                <select
                  id="country"
                  value={formData.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  className={`w-full appearance-none rounded-xl border bg-ink-2 px-4 py-3.5 pr-10 text-paper outline-none transition-all focus:ring-2 ${
                    errors.country
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                      : formData.country
                        ? "border-emerald focus:border-emerald focus:ring-ring!-emerald focus:ring-emerald/20"
                        : "border-line focus:border-emerald focus:ring-emerald/20"
                  }`}
                  disabled={submitting}
                >
                  <option value="" className="bg-ink-2 text-mute">
                    Select country
                  </option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c} className="bg-ink-2">
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-mute" />
              </div>
              {errors.country && (
                <p className="flex items-center gap-1.5 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {errors.country}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label
                htmlFor="category"
                className="flex items-center gap-2 text-sm font-medium text-paper"
              >
                <Leaf className="h-4 w-4 text-mute" />
                Project Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className={`w-full appearance-none rounded-xl border bg-ink-2 px-4 py-3.5 pr-10 text-paper outline-none transition-all focus:ring-2 ${
                    errors.category
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                      : formData.category
                        ? "border-emerald focus:border-emerald focus:ring-emerald/20"
                        : "border-line focus:border-emerald focus:ring-emerald/20"
                  }`}
                  disabled={submitting}
                >
                  <option value="" className="bg-ink-2 text-mute">
                    Select category
                  </option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value} className="bg-ink-2">
                      {c.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-mute" />
              </div>
              {errors.category && (
                <p className="flex items-center gap-1.5 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {errors.category}
                </p>
              )}
            </div>
          </div>

          {/* Vintage + Volume row */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Vintage Year */}
            <div className="space-y-2">
              <label
                htmlFor="vintageYear"
                className="flex items-center gap-2 text-sm font-medium text-paper"
              >
                <Calendar className="h-4 w-4 text-mute" />
                Vintage Year
              </label>
              <div className="relative">
                <select
                  id="vintageYear"
                  value={formData.vintageYear || ""}
                  onChange={(e) =>
                    updateField("vintageYear", parseInt(e.target.value) || 0)
                  }
                  className={`w-full appearance-none rounded-xl border bg-ink-2 px-4 py-3.5 pr-10 text-paper outline-none transition-all focus:ring-2 ${
                    errors.vintageYear
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                      : formData.vintageYear
                        ? "border-emerald focus:border-emerald focus:ring-emerald/20"
                        : "border-line focus:border-emerald focus:ring-emerald/20"
                  }`}
                  disabled={submitting}
                >
                  <option value="" className="bg-ink-2 text-mute">
                    Select year
                  </option>
                  {VINTAGE_YEARS.map((y) => (
                    <option key={y} value={y} className="bg-ink-2">
                      {y}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-mute" />
              </div>
              {errors.vintageYear && (
                <p className="flex items-center gap-1.5 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {errors.vintageYear}
                </p>
              )}
            </div>

            {/* Carbon Volume */}
            <div className="space-y-2">
              <label
                htmlFor="carbonVolume"
                className="flex items-center gap-2 text-sm font-medium text-paper"
              >
                <Layers className="h-4 w-4 text-mute" />
                Carbon Volume (tCO₂e)
              </label>
              <input
                id="carbonVolume"
                type="text"
                inputMode="numeric"
                value={formData.carbonVolume}
                onChange={(e) => updateField("carbonVolume", e.target.value)}
                placeholder="e.g. 50000"
                className={`w-full rounded-xl border bg-ink-2 px-4 py-3.5 font-mono text-paper outline-none transition-all placeholder:text-mute/60 focus:ring-2 ${
                  errors.carbonVolume
                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                    : formData.carbonVolume
                      ? "border-emerald focus:border-emerald focus:ring-emerald/20"
                      : "border-line focus:border-emerald focus:ring-emerald/20"
                }`}
                disabled={submitting}
              />
              {errors.carbonVolume && (
                <p className="flex items-center gap-1.5 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {errors.carbonVolume}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="flex items-center gap-2 text-sm font-medium text-paper"
            >
              <Info className="h-4 w-4 text-mute" />
              Description{" "}
              <span className="text-mute">(optional)</span>
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Briefly describe the project, its methodology, and verification status."
              className={`w-full resize-none rounded-xl border bg-ink-2 px-4 py-3.5 text-paper outline-none transition-all placeholder:text-mute/60 focus:ring-2 ${
                errors.description
                  ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                  : "border-line focus:border-emerald focus:ring-emerald/20"
              }`}
              disabled={submitting}
            />
            <div className="flex items-center justify-between">
              {errors.description ? (
                <p className="flex items-center gap-1.5 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {errors.description}
                </p>
              ) : (
                <span />
              )}
              <span className="text-xs text-mute">
                {formData.description.length}/1000
              </span>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between gap-4 border-t border-line pt-8">
            <p className="text-sm text-mute">
              All fields are recorded on-chain permanently.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald px-8 py-3.5 font-semibold text-ink transition-all hover:bg-emerald-bright disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Issuing credit…
                </>
              ) : (
                <>
                  Issue Credit
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
