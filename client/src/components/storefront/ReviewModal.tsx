'use client';

import React, { useState, useEffect } from 'react';
import { X, Star, Loader2, CheckCircle2 } from 'lucide-react';
import { useSubmitReviewMutation } from '@/store/services/reviewsApi';
import { toast } from 'react-hot-toast';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  productName?: string;
}

export default function ReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
}: ReviewModalProps) {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [submitReview, { isLoading }] = useSubmitReviewMutation();

  // Reset form whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setComment('');
      setRating(0);
      setHovered(0);
      setSubmitted(false);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating.');
      return;
    }
    try {
      await submitReview({ name, comment, rating, productId, productName }).unwrap();
      setSubmitted(true);
      toast.success('Review submitted!');
      setTimeout(() => onClose(), 1800);
    } catch {
      toast.error('Failed to submit review. Please try again.');
    }
  };

  const displayRating = hovered || rating;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-extrabold text-black" style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
              Write a Review
            </h2>
            {productName && (
              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[260px]">{productName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {submitted ? (
          /* Success state */
          <div className="flex flex-col items-center gap-3 py-14 px-7 text-center">
            <CheckCircle2 className="w-14 h-14 text-green-500" />
            <p className="font-bold text-lg text-black">Thank you!</p>
            <p className="text-sm text-gray-500">Your review has been published.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-7 py-6">
            {/* Star picker */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Your Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= displayRating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-200 fill-gray-200'
                      }`}
                    />
                  </button>
                ))}
                {displayRating > 0 && (
                  <span className="ml-2 text-sm font-bold text-gray-700">
                    {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][displayRating]}
                  </span>
                )}
              </div>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ahmed K."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
              />
            </div>

            {/* Comment */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Your Review <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Share your experience with this product..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
