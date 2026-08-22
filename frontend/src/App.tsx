import { Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer.tsx";
import ErrorBoundary from "./components/ErrorBoundary";
import LS from "./lib/LS.tsx";

const Home = lazy(() => import("./pages/Home"));
const Registry = lazy(() => import("./pages/Registry"));
const Analytics = lazy(() => import("./pages/Analytics"));
const CreateCredit = lazy(() => import("./pages/CreateCredit"));
const ManageCredit = lazy(() => import("./pages/ManageCredit"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-ink text-paper">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <LS></LS>
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="flex min-h-[50vh] items-center justify-center text-mute">
                Loading…
              </div>
            }
          >
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
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
