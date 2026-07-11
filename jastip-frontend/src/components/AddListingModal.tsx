"use client";
import { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Link as LinkIcon, Upload } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preSelectedTripId?: string;
}

export default function AddListingModal({ isOpen, onClose, onSuccess, preSelectedTripId }: AddListingModalProps) {
  const { user } = useAuth();
  
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  
  const [tripId, setTripId] = useState('');
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [localCurrency, setLocalCurrency] = useState('USD');
  const [maxQuantity, setMaxQuantity] = useState('0');
  
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchTrips();
      if (preSelectedTripId) {
        setTripId(preSelectedTripId);
      }
    }
  }, [isOpen, user?.id, preSelectedTripId]);

  const fetchTrips = async () => {
    try {
      setIsLoadingTrips(true);
      const res = await api.get(`/trips?sellerId=${user?.id}`);
      setTrips(res.data);
    } catch (err) {
      console.error("Failed to fetch trips", err);
    } finally {
      setIsLoadingTrips(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId || !productName || !price || !localCurrency) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    let finalImageUrl = imageUrl;
    if (imageMode === 'upload' && imagePreview) {
      // In a real app, you would upload imageFile to S3/Cloudinary here.
      // For MVP, we save the base64 string to DB.
      finalImageUrl = imagePreview; 
    }

    try {
      await api.post('/listings', {
        tripId,
        sellerId: user?.id,
        productName,
        description,
        price: parseFloat(price),
        localCurrency,
        imageUrl: finalImageUrl,
        maxQuantity: parseInt(maxQuantity) || 0
      });
      onSuccess();
      onClose();
      // Reset form
      setTripId('');
      setProductName('');
      setDescription('');
      setPrice('');
      setLocalCurrency('USD');
      setMaxQuantity('0');
      setImageUrl('');
      setImageFile(null);
      setImagePreview('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-brand-navy">Add New Listing</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
              {error}
            </div>
          )}
          
          <form id="add-listing-form" onSubmit={handleSubmit} className="space-y-6">
            
            {!preSelectedTripId && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Select Trip <span className="text-red-500">*</span></label>
                <select 
                  value={tripId}
                  onChange={e => setTripId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all text-sm"
                  disabled={isLoadingTrips}
                >
                  <option value="">-- Select an upcoming trip --</option>
                  {trips.map(trip => (
                    <option key={trip.id} value={trip.id}>
                      {trip.destinationCountry} ({new Date(trip.startDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                {trips.length === 0 && !isLoadingTrips && (
                  <p className="text-xs text-orange-500 mt-1">You don't have any trips yet. Please post a trip first!</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={productName}
                onChange={e => setProductName(e.target.value)}
                placeholder="e.g., Tokyo Banana 8pcs, Rare Matcha KitKat"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Price <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  step="0.01"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Local Currency <span className="text-red-500">*</span></label>
                <select 
                  value={localCurrency}
                  onChange={e => setLocalCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all text-sm"
                >
                  <option value="USD">USD ($)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="KRW">KRW (₩)</option>
                  <option value="SGD">SGD (S$)</option>
                  <option value="AUD">AUD (A$)</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Product Image</label>
              <div className="flex bg-gray-100 p-1 rounded-lg mb-3">
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${imageMode === 'url' ? 'bg-white shadow-sm text-brand-navy' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <LinkIcon className="w-4 h-4" /> Paste URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${imageMode === 'upload' ? 'bg-white shadow-sm text-brand-navy' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Upload className="w-4 h-4" /> Upload File
                </button>
              </div>

              {imageMode === 'url' ? (
                <input 
                  type="url" 
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all text-sm"
                />
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="h-32 object-contain rounded-md" />
                      <button type="button" onClick={() => {setImageFile(null); setImagePreview('');}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-2">Click to browse or drag and drop</p>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-navy file:text-white hover:file:bg-gray-800"
                      />
                    </>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Max Quantity (Optional)</label>
              <p className="text-xs text-gray-500 mb-2">Maximum number of this item you can carry. Leave as 0 if unlimited.</p>
              <input 
                type="number" 
                value={maxQuantity}
                onChange={e => setMaxQuantity(e.target.value)}
                min="0"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Description (Optional)</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Product details, variants, flavors..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all text-sm h-20 resize-none"
              ></textarea>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="add-listing-form"
            disabled={isSubmitting || (trips.length === 0 && !preSelectedTripId)}
            className="px-6 py-2.5 text-sm font-bold bg-brand-navy text-white hover:bg-gray-800 rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? 'Saving...' : 'Add Listing'}
          </button>
        </div>

      </div>
    </div>
  );
}
