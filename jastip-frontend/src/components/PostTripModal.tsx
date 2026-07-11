"use client";
import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

interface PostTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PostTripModal({ isOpen, onClose, onSuccess }: PostTripModalProps) {
  const { user } = useAuth();
  
  const [destinationCountry, setDestinationCountry] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [markupRules, setMarkupRules] = useState('');
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinationCountry || !startDate || !endDate || !markupRules) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/trips', {
        sellerId: user?.id,
        destinationCountry,
        startDate,
        endDate,
        markupRules: JSON.stringify({ description: markupRules }),
        notes
      });
      onSuccess();
      onClose();
      // Reset form
      setDestinationCountry('');
      setStartDate('');
      setEndDate('');
      setMarkupRules('');
      setNotes('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to post trip.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-brand-navy">Post a New Trip</h2>
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
          
          <form id="post-trip-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Destination Country <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={destinationCountry}
                onChange={e => setDestinationCountry(e.target.value)}
                placeholder="e.g., Japan, France, USA"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">End Date <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Markup & Fees <span className="text-red-500">*</span></label>
              <p className="text-xs text-gray-500 mb-2">Let buyers know how you calculate your fee.</p>
              <input 
                type="text" 
                value={markupRules}
                onChange={e => setMarkupRules(e.target.value)}
                placeholder="e.g., 10% on item price + $10 base fee"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Trip Notes & Restrictions</label>
              <p className="text-xs text-gray-500 mb-2">Specify what items you are willing to buy (e.g. cosmetics only, no liquids).</p>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g., I'm focusing on buying cosmetics and small electronics. Please no bulky items or fragile glass!"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all text-sm h-24 resize-none"
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
            form="post-trip-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-bold bg-brand-navy text-white hover:bg-gray-800 rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? 'Posting...' : 'Post Trip'}
          </button>
        </div>

      </div>
    </div>
  );
}
