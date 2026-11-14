import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Size & Drape Guide - Linen Saree",
  description: "Comprehensive measurement and drape guide for Linen Saree handwoven sarees, blouse pieces, and custom fittings.",
};

export default function SizeGuidePage() {
  const blouseSizes = [
    { size: "XS", bust: "32\"", waist: "26\"", shoulder: "13.5\"", length: "14\"" },
    { size: "S", bust: "34\"", waist: "28\"", shoulder: "14\"", length: "14.5\"" },
    { size: "M", bust: "36\"", waist: "30\"", shoulder: "14.5\"", length: "15\"" },
    { size: "L", bust: "38\"", waist: "32\"", shoulder: "15\"", length: "15.5\"" },
    { size: "XL", bust: "40\"", waist: "34\"", shoulder: "15.5\"", length: "16\"" },
    { size: "XXL", bust: "42\"", waist: "36\"", shoulder: "16\"", length: "16.5\"" },
    { size: "3XL", bust: "44\"", waist: "38\"", shoulder: "16.5\"", length: "17\"" },
  ];

  const measurementTips = [
    {
      title: "Bust Measurement",
      description: "Measure around the fullest part of your bust, keeping the measuring tape parallel to the floor.",
    },
    {
      title: "Waist Measurement",
      description: "Measure around your natural waistline, typically about 1 inch above your belly button.",
    },
    {
      title: "Shoulder Width",
      description: "Measure across your upper back from the tip of one shoulder bone to the other.",
    },
    {
      title: "Blouse Length",
      description: "Measure from the highest point of your shoulder down to your desired blouse hem.",
    },
  ];

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        {/* Hero */}
        <div className="border-b border-pine-950/10 bg-linen py-16 sm:py-20">
          <div className="mx-auto max-w-[1240px] px-6 text-center lg:px-10">
            <span className="font-inter text-xs font-semibold uppercase tracking-[0.2em] text-pine-800">
              Fitting & Drapes
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide text-pine-950 sm:text-5xl">
              Size &amp; Drape Guide
            </h1>
            <p className="mx-auto mt-4 max-w-xl font-inter text-sm leading-relaxed text-muted sm:text-base">
              Handloom sarees are celebrated for their universal grace. Find complete specifications on saree lengths, blouse pieces, and tailoring measurements.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-[1000px] px-6 py-16 lg:px-10 lg:py-20">
          {/* Saree Standard Dimensions */}
          <section>
            <h2 className="font-display text-2xl font-semibold text-pine-950 sm:text-3xl">
              Saree Dimensions &amp; Specifications
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-pine-950/10 bg-linen/40 p-6">
                <span className="font-inter text-xs font-bold uppercase tracking-wider text-pine-800">
                  Saree Body
                </span>
                <p className="mt-2 text-2xl font-bold text-pine-950">5.5 Metres</p>
                <p className="mt-1 text-xs text-muted">
                  Standard length offering ample drape volume, graceful pleats, and generous pallu fall.
                </p>
              </div>

              <div className="rounded-xl border border-pine-950/10 bg-linen/40 p-6">
                <span className="font-inter text-xs font-bold uppercase tracking-wider text-pine-800">
                  Blouse Piece
                </span>
                <p className="mt-2 text-2xl font-bold text-pine-950">0.8 Metres (80 cm)</p>
                <p className="mt-1 text-xs text-muted">
                  Unstitched running fabric attached to the inner end, tailor-ready for standard sleeve designs.
                </p>
              </div>

              <div className="rounded-xl border border-pine-950/10 bg-linen/40 p-6">
                <span className="font-inter text-xs font-bold uppercase tracking-wider text-pine-800">
                  Saree Width (Panna)
                </span>
                <p className="mt-2 text-2xl font-bold text-pine-950">44 to 45 Inches</p>
                <p className="mt-1 text-xs text-muted">
                  Ideal vertical width designed to comfortably suit heights from 4&apos;11&quot; to 5&apos;10&quot;.
                </p>
              </div>
            </div>
          </section>

          {/* Blouse Sizing Chart */}
          <section className="mt-16 border-t border-pine-950/10 pt-14">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h2 className="font-display text-2xl font-semibold text-pine-950 sm:text-3xl">
                  Blouse Stitching Size Chart
                </h2>
                <p className="mt-1 text-xs text-muted sm:text-sm">
                  Recommended body measurements for tailoring your unstitched blouse piece (in inches).
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border border-pine-950/10 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-inter text-xs sm:text-sm">
                  <thead className="border-b border-pine-950/10 bg-linen font-semibold text-pine-900">
                    <tr>
                      <th className="px-4 py-3">Size</th>
                      <th className="px-4 py-3">Bust</th>
                      <th className="px-4 py-3">Waist</th>
                      <th className="px-4 py-3">Shoulder</th>
                      <th className="px-4 py-3">Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pine-950/5 bg-white text-ink">
                    {blouseSizes.map((row) => (
                      <tr key={row.size} className="hover:bg-linen/20">
                        <td className="px-4 py-3 font-semibold text-pine-950">{row.size}</td>
                        <td className="px-4 py-3">{row.bust}</td>
                        <td className="px-4 py-3">{row.waist}</td>
                        <td className="px-4 py-3">{row.shoulder}</td>
                        <td className="px-4 py-3">{row.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Measuring Tips */}
          <section className="mt-16 border-t border-pine-950/10 pt-14">
            <h2 className="font-display text-2xl font-semibold text-pine-950 sm:text-3xl">
              How to Measure Accurately
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {measurementTips.map((tip) => (
                <div key={tip.title} className="rounded-xl border border-pine-950/10 bg-white p-5">
                  <h3 className="font-display text-base font-semibold text-pine-950">
                    {tip.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">
                    {tip.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

