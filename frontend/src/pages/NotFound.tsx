import { Link } from "react-router-dom"
import { ArrowLeft, Map } from "lucide-react"
import { usePageTitle } from "../hooks"

export default function NotFound() {
  usePageTitle("Not Found")
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-5 text-center">
      <div className="h-24 w-24 rounded-full bg-ink-2 border border-line flex items-center justify-center text-mute mb-8 shadow-xl">
        <Map className="h-10 w-10" />
      </div>
      <h1 className="text-7xl font-mono font-bold text-paper mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-paper mb-4">Off the Chain</h2>
      <p className="text-mute max-w-md mx-auto mb-8 text-lg">
        The page or carbon block you are looking for does not exist or has been permanently retired.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald/10 border border-emerald/20 px-6 py-3 font-semibold text-emerald-bright hover:bg-emerald/20 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Return to Genesis
      </Link>
    </div>
  )
}