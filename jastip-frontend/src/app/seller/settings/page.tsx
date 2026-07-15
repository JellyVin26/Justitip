export default function SellerSettingsPage() {
  return (
    <div className="w-full max-w-6xl mx-auto px-8 py-10">
      <h1 className="text-3xl font-bold text-brand-navy mb-8">Settings</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm max-w-2xl">
        <h2 className="font-bold text-lg text-brand-navy mb-6">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio (for your public profile)</label>
            <textarea className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent h-24" placeholder="Tell buyers a bit about yourself..."></textarea>
          </div>
          <button className="bg-brand-navy text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 smooth-hover">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
