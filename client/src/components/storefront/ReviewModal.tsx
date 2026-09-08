'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Star, Loader2, CheckCircle2, UploadCloud, Plus, Trash2 } from 'lucide-react';
import { useSubmitReviewMutation, useUploadReviewImageMutation } from '@/store/services/reviewsApi';
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

  // Image Upload state (Up to 5 images)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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
      // Clean up object URLs
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setSelectedFiles([]);
      setImagePreviews([]);
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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (selectedFiles.length >= 5) {
      toast.error('You can upload a maximum of 5 images.');
      return;
    }

    const validFiles: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" is not a valid image (PNG, JPG, WEBP).`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds max 5MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    if (selectedFiles.length + validFiles.length > 5) {
      toast.error('Maximum 5 images allowed per review.');
    }

    const allowedCount = 5 - selectedFiles.length;
    const filesToAdd = validFiles.slice(0, allowedCount);
    const previewsToAdd = filesToAdd.map((file) => URL.createObjectURL(file));

    setSelectedFiles((prev) => [...prev, ...filesToAdd]);
    setImagePreviews((prev) => [...prev, ...previewsToAdd]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating.');
      return;
    }

    try {
      const uploadedUrls: string[] = [];

      // Upload selected images to Cloudinary via backend
      if (selectedFiles.length > 0) {
        setIsUploadingImage(true);
        for (let i = 0; i < selectedFiles.length; i++) {
          const formData = new FormData();
          formData.append('file', selectedFiles[i]);
          const uploadRes = await uploadReviewImage(formData).unwrap();
          if (uploadRes?.url) {
            uploadedUrls.push(uploadRes.url);
          }
        }
        setIsUploadingImage(false);
      }

      await submitReview({
        name,
        comment,
        rating,
        productId,
        productName,
        images: uploadedUrls,
        image: uploadedUrls[0] || undefined,
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

            {/* Product / Review Image Upload (Cloudinary - Up to 5 Images) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Upload Photos (1 to 5 Optional)
                </label>
                <span className="text-[10px] font-bold text-gray-500">
                  {selectedFiles.length} / 5 Selected
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="review-image-upload"
              />

              {imagePreviews.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  <div className="grid grid-cols-5 gap-2">
                    {imagePreviews.map((previewUrl, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group"
                      >
                        <img
                          src={previewUrl}
                          alt={`Review photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-600/90 text-white rounded-full opacity-90 hover:opacity-100 hover:scale-110 transition-all shadow-sm"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px] font-bold rounded">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}

                    {/* Add More Tile if less than 5 */}
                    {selectedFiles.length < 5 && (
                      <label
                        htmlFor="review-image-upload"
                        className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-black bg-gray-50 hover:bg-gray-100 cursor-pointer flex flex-col items-center justify-center transition-all text-gray-500 hover:text-black"
                        title="Add another image"
                      >
                        <Plus className="w-5 h-5 mb-0.5" />
                        <span className="text-[9px] font-bold">Add</span>
                      </label>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400">
                    You can select up to 5 photos (PNG, JPG, WEBP).
                  </p>
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
                    <p className="text-xs font-semibold text-gray-700">
                      Click to upload photos (1 to 5)
                    </p>
                    <p className="text-[11px] text-gray-400">PNG, JPG or WEBP (Max 5MB each)</p>
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
                  {isUploadingImage
                    ? `Uploading Photos (${selectedFiles.length})…`
                    : 'Submitting Review…'}
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
