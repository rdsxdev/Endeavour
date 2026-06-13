import { Routes, Route, useLocation } from "react-router-dom"
import { useEffect } from "react"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

import Home from "./pages/Home"
import Registry from "./pages/Registry"
import Analytics from "./pages/Analytics"
import CreateCredit from "./pages/CreateCredit"
import ManageCredit from "./pages/ManageCredit"
import ProjectDetails from "./pages/ProjectDetails"
import About from "./pages/About"
import NotFound from "./pages/NotFound"

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/registry" element={<Registry />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/create" element={<CreateCredit />} />
          <Route path="/manage" element={<ManageCredit />} />
          <Route path="/credit/:id" element={<ProjectDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
