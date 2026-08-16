'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { updateUser } from '@/store/slices/authSlice';
import { useUpdateProfileMutation } from '@/store/services/authApi';
import { X, User, Phone, MapPin, Image as ImageIcon, Loader2, Save, Sparkles, Upload, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [updateProfileApi, { isLoading }] = useUpdateProfileMutation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState('');
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setAvatar(user.avatar || '');
      setPreviewError(false);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be under 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
        setPreviewError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Full name is required');
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        avatar: avatar.trim(),
      };

      const updatedUser = await updateProfileApi(payload).unwrap();

      dispatch(
        updateUser({
          name: updatedUser.name || payload.name,
          phone: updatedUser.phone || payload.phone,
          address: updatedUser.address || payload.address,
          avatar: updatedUser.avatar || payload.avatar,
        })
      );

      toast.success('Profile updated successfully!');
      onClose();
    } catch (err: any) {
      const msg = err?.data?.message || 'Failed to update profile';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden font-['Satoshi'] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-black text-white px-7 py-5 flex items-center justify-between border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold" style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
                EDIT PROFILE
              </h2>
              <p className="text-xs text-gray-400">Update your personal account details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-5">
          {/* Avatar Preview & Input Section */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-gray-50 rounded-2xl border border-gray-200/80">
            <div className="relative w-20 h-20 rounded-full bg-gray-200 border-2 border-black overflow-hidden shrink-0 flex items-center justify-center shadow-md">
              {avatar && !previewError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                  onError={() => setPreviewError(true)}
                />
              ) : (
                <User className="w-9 h-9 text-gray-400" />
              )}
            </div>

            <div className="flex-1 flex flex-col gap-2 w-full">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> Profile Picture (Avatar)
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste Image URL (e.g. https://...)"
                  value={avatar}
                  onChange={(e) => {
                    setAvatar(e.target.value);
                    setPreviewError(false);
                  }}
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-black"
                />
                <label className="px-3 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-1 cursor-pointer shrink-0">
                  <Upload className="w-3 h-3" />
                  <span className="hidden sm:inline">Upload</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
              <p className="text-[10px] text-gray-500">Live preview updates above. Paste image URL or upload image.</p>
            </div>
          </div>

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Muhammad Ali"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Phone Number
            </label>
            <input
              type="tel"
              placeholder="e.g. +92 300 1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Delivery Address
            </label>
            <textarea
              rows={3}
              placeholder="e.g. House 12, Street 5, Block B, Gulshan-e-Iqbal, Karachi"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black resize-none"
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-7 py-3 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-60 shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
