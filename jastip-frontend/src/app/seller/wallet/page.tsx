export default function SellerWalletPage() {
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold text-brand-navy mb-8">Wallet & Payouts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-brand-navy text-white rounded-xl p-8 shadow-sm">
          <p className="text-sm font-bold tracking-widest text-indigo-200 uppercase mb-2">Available Balance</p>
          <h2 className="text-5xl font-bold mb-8">$0.00</h2>
          <button className="bg-white text-brand-navy font-bold text-sm w-full py-3 rounded-md hover:bg-gray-100 transition-colors">
            Withdraw Funds
          </button>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col justify-center">
          <h3 className="font-bold text-gray-700 mb-2">Transaction History</h3>
          <p className="text-gray-500 text-sm">No recent transactions.</p>
        </div>
      </div>
    </main>
  );
}
