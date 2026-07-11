"use client";

export default function TripsPage() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <section className="mb-14">
        <h1 className="text-4xl font-bold text-brand-navy mb-4">
          Available <span className="italic text-gray-500 font-serif">Trips.</span>
        </h1>
        <p className="text-gray-600 max-w-xl mb-8">
          See all scheduled trips by our verified global couriers.
        </p>
      </section>

      <section className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-2xl font-bold text-brand-navy mb-2">Coming Soon</h2>
        <p className="text-gray-500 text-sm">We are currently building out the full trips directory.</p>
      </section>
    </div>
  );
}
