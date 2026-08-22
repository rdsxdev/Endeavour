import { Link } from "react-router-dom"
import { Hop as Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <div className="relative">
        <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-emerald/20 to-teal-500/20 blur-2xl opacity-40" />
        <div className="relative">
          <h1 className="text-[8rem] font-extrabold leading-none tracking-tight text-paper/10">
            404
          </h1>
        </div>
      </div>
      <h2 className="mt-6 text-2xl font-bold text-paper sm:text-3xl">
        Page not found
      </h2>
      <p className="mt-4 max-w-md text-mute">
        The page you're looking for doesn't exist or has been moved. Check the
        URL or navigate back to the registry.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald px-6 py-3 font-semibold text-ink transition-colors hover:bg-emerald-bright"
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
        <Link
          to="/registry"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-line-2 bg-ink-2 px-6 py-3 font-semibold text-paper transition-colors hover:bg-ink-3"
        >
          <Search className="h-4 w-4" />
          Explore Registry
        </Link>
      </div>
    </div>
  )
}
