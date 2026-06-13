export default function Home() {
  return (
    <div className="bg-slate-950 text-white">
      <section className="relative h-screen overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/70" />

        <div className="relative z-10 max-w-7xl mx-auto px-10 pt-56">
          <div className="max-w-4xl">
            <p className="uppercase tracking-[0.3em] text-emerald-400 font-semibold">
              Blockchain Climate Infrastructure
            </p>

            <h1 className="mt-8 text-7xl font-bold leading-tight">
              Tokenizing Climate Impact For A Transparent Carbon Economy
            </h1>

            <p className="mt-8 text-xl text-slate-300 max-w-2xl">
              Create, verify, trade and retire carbon credits on-chain.
              Bringing transparency, liquidity and trust to climate finance.
            </p>

            <div className="mt-12 flex gap-5">
              <button className="bg-emerald-500 hover:bg-emerald-600 px-8 py-4 rounded-xl font-semibold">
                Explore Registry
              </button>

              <button className="border border-white/20 px-8 py-4 rounded-xl">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-24">
        <div className="max-w-7xl mx-auto px-10">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-slate-900 p-8 rounded-2xl">
              <p className="text-slate-400">Total Credits</p>
              <h2 className="text-5xl font-bold mt-4">15,283</h2>
            </div>

            <div className="bg-slate-900 p-8 rounded-2xl">
              <p className="text-slate-400">Retired Credits</p>
              <h2 className="text-5xl font-bold mt-4">5,293</h2>
            </div>

            <div className="bg-slate-900 p-8 rounded-2xl">
              <p className="text-slate-400">Projects</p>
              <h2 className="text-5xl font-bold mt-4">112</h2>
            </div>

            <div className="bg-slate-900 p-8 rounded-2xl">
              <p className="text-slate-400">CO₂ Offset</p>
              <h2 className="text-5xl font-bold mt-4">1.8M</h2>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-24">
        <div className="max-w-7xl mx-auto px-10">
          <h2 className="text-5xl font-bold mb-12">
            Featured Carbon Projects
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800 rounded-2xl p-8">
              <h3 className="text-2xl font-bold">
                Wind Farm Gujarat
              </h3>

              <p className="text-slate-400 mt-3">
                India
              </p>

              <div className="mt-6">
                <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">
                  Verified
                </span>
              </div>

              <button className="mt-8 text-emerald-400">
                View Project →
              </button>
            </div>

            <div className="bg-slate-800 rounded-2xl p-8">
              <h3 className="text-2xl font-bold">
                Solar Rajasthan
              </h3>

              <p className="text-slate-400 mt-3">
                India
              </p>

              <div className="mt-6">
                <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">
                  Verified
                </span>
              </div>

              <button className="mt-8 text-emerald-400">
                View Project →
              </button>
            </div>

            <div className="bg-slate-800 rounded-2xl p-8">
              <h3 className="text-2xl font-bold">
                Forest Conservation
              </h3>

              <p className="text-slate-400 mt-3">
                Brazil
              </p>

              <div className="mt-6">
                <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">
                  Active
                </span>
              </div>

              <button className="mt-8 text-emerald-400">
                View Project →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}