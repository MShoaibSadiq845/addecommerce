'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Star, Loader2, CheckCircle2, UploadCloud, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useSubmitReviewMutation, useUploadReviewImageMutation } from '@/store/services/reviewsApi';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

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

  // Image Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitReview, { isLoading: isSubmitting }] = useSubmitReviewMutation();
  const [uploadReviewImage] = useUploadReviewImageMutation();

  // Reset form whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setComment('');
      setRating(0);
      setHovered(0);
      setSubmitted(false);
      setSelectedFile(null);
      setImagePreview(null);
      setIsUploadingImage(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file (PNG, JPG, WEBP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB.');
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating.');
      return;
    }

    try {
      let imageUrl: string | undefined = undefined;

      // Upload image to Cloudinary via NestJS backend if a file is selected
      if (selectedFile) {
        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await uploadReviewImage(formData).unwrap();
        imageUrl = uploadRes.url;
        setIsUploadingImage(false);
      }

      await submitReview({
        name,
        comment,
        rating,
        productId,
        productName,
        image: imageUrl,
      }).unwrap();

      setSubmitted(true);
      toast.success('Review submitted successfully!');
      setTimeout(() => onClose(), 1800);
    } catch (err: any) {
      setIsUploadingImage(false);
      console.error('Failed to submit review:', err);
      toast.error(err?.data?.message || 'Failed to submit review. Please try again.');
    }
  };

  const displayRating = hovered || rating;
  const isLoading = isSubmitting || isUploadingImage;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2
              className="text-xl font-extrabold text-black"
              style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}
            >
              Write a Review
            </h2>
            {productName && (
              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[260px]">{productName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {submitted ? (
          /* Success state */
          <div className="flex flex-col items-center gap-3 py-14 px-7 text-center">
            <CheckCircle2 className="w-14 h-14 text-green-500 animate-bounce" />
            <p className="font-bold text-lg text-black">Thank you!</p>
            <p className="text-sm text-gray-500">Your review has been published.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-7 py-6 overflow-y-auto">
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
                rows={3}
                placeholder="Share your experience with this product..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
              />
            </div>

            {/* Product / Review Image Upload (Cloudinary) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center justify-between">
                <span>Upload Product Image (Optional)</span>
                <span className="text-[10px] text-gray-400 font-normal">Max 5MB</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="review-image-upload"
              />

              {imagePreview ? (
                <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-gray-200 group bg-gray-50">
                  <img
                    src={imagePreview}
                    alt="Review upload preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white text-black rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="review-image-upload"
                  className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-black hover:bg-gray-50 transition-all text-gray-500"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-700">Click to upload photo</p>
                    <p className="text-[11px] text-gray-400">PNG, JPG or WEBP</p>
                  </div>
                </label>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isUploadingImage ? 'Uploading Image…' : 'Submitting…'}
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
