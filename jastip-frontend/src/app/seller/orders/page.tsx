export default function SellerOrdersPage() {
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold text-brand-navy mb-8">Active Orders</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col items-center text-center">
        <h2 className="text-xl font-bold text-gray-700 mb-2">No Active Orders Yet</h2>
        <p className="text-gray-500 max-w-md">Once buyers start placing orders on your listings, they will appear here for you to manage.</p>
      </div>
    </main>
  );
}
