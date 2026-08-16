'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useCreateProductMutation } from '@/store/services/productsApi';
import { ArrowLeft, Save, UploadCloud, Image as ImageIcon, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { useLoading } from '@/context/LoadingContext'; // 👈 Global loading hook import kiya

type ProductFormInputs = {
  name: string;
  description: string;
  price: string;
  rating: string;
  category: string;
  brand: string;
  stock: string;
  sku: string;
  imageInput: string;
  colorsInput: string;
  sizesInput: string;
};

const parseTags = (raw: string): string[] =>
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export default function AdminAddProductPage() {
  const router = useRouter();
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { setLoading } = useLoading(); // 👈 Global loading state control

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormInputs>({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      rating: '4.5',
      category: '',
      brand: 'SHOP.CO',
      stock: '50',
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      imageInput: '',
      colorsInput: '',
      sizesInput: '',
    },
  });

  const watchImageInput = watch('imageInput');

  // 👈 Yeh useEffect product save ya image upload hone par global loading handle karega
  useEffect(() => {
    if (isLoading || isUploading) {
      setLoading(true);
    } else {
      setLoading(false);
    }

    // Cleanup function taake component unmount ho toh loading band ho jaye
    return () => {
      setLoading(false);
    };
  }, [isLoading, isUploading, setLoading]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/upload`,
        { method: 'POST', body: formData },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || `Upload failed (${res.status})`);
      }
      const data = await res.json();
      setValue('imageInput', data.url, { shouldValidate: true });
      toast.success('Image uploaded!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: ProductFormInputs) => {
    setErrorMsg('');
    try {
      await createProduct({
        name: data.name,
        description: data.description,
        price: Number(data.price),
        rating: data.rating ? Math.min(5, Math.max(0, Number(data.rating))) : 4.5,
        category: data.category,
        brand: data.brand || 'SHOP.CO',
        colors: parseTags(data.colorsInput),
        sizes: parseTags(data.sizesInput),
        stock: Number(data.stock),
        sku: data.sku,
        images: [data.imageInput || '/images/7.png'],
        tags: [
          ...parseTags(data.colorsInput),
          ...parseTags(data.sizesInput),
          data.category.toLowerCase(),
        ],
      }).unwrap();
      toast.success('Product created successfully!');
      router.push('/admin/products');
    } catch (err: any) {
      const msg = err?.data?.message || 'Failed to create product';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-['Rubik'] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="p-2 bg-white rounded-xl border hover:bg-gray-50">
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-xs text-gray-400">Fill in product details below</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded-2xl font-bold flex items-center gap-2">
          <X className="w-4 h-4 shrink-0" /> {errorMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col gap-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Product Name */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Product Name</label>
            <input
              type="text"
              placeholder="e.g. Classic Oversized Hoodie"
              {...register('name', { required: 'Product name is required' })}
              className={`border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black font-semibold ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
            />
            {errors.name && <span className="text-[10px] text-red-500 font-semibold">{errors.name.message}</span>}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Description</label>
            <textarea
              rows={3}
              placeholder="Describe the product..."
              {...register('description', { required: 'Description is required' })}
              className={`border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black ${errors.description ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
            />
            {errors.description && <span className="text-[10px] text-red-500 font-semibold">{errors.description.message}</span>}
          </div>

          {/* Price (PKR) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Price (PKR)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">₨</span>
              <input
                type="number"
                min="0"
                placeholder="2500"
                {...register('price', { required: 'Price is required', min: { value: 0, message: 'Price must be positive' } })}
                className={`w-full border rounded-xl p-3 pl-8 text-sm outline-none focus:ring-2 focus:ring-black font-bold ${errors.price ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
              />
            </div>
            {errors.price && <span className="text-[10px] text-red-500 font-semibold">{errors.price.message}</span>}
          </div>

          {/* Rating */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Rating <span className="font-normal text-gray-400 normal-case">(0 – 5)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                placeholder="4.5"
                {...register('rating', {
                  min: { value: 0, message: 'Min 0' },
                  max: { value: 5, message: 'Max 5' },
                })}
                className={`w-full border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black font-bold ${errors.rating ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
              />
              {/* Live star preview */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-0.5 pointer-events-none">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className={`w-3 h-3 ${i < Math.floor(Number(watch('rating')) || 4.5) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            {errors.rating && <span className="text-[10px] text-red-500 font-semibold">{errors.rating.message}</span>}
          </div>

          {/* Category (free text) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Category</label>
            <input
              type="text"
              placeholder="e.g. Casual, Formal, Gym..."
              {...register('category', { required: 'Category is required' })}
              className={`border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black ${errors.category ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
            />
            {errors.category && <span className="text-[10px] text-red-500 font-semibold">{errors.category.message}</span>}
          </div>

          {/* Stock */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Stock Quantity</label>
            <input
              type="number"
              min="0"
              {...register('stock', { required: 'Stock is required', min: { value: 0, message: 'Must be ≥ 0' } })}
              className={`border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black font-bold ${errors.stock ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
            />
            {errors.stock && <span className="text-[10px] text-red-500 font-semibold">{errors.stock.message}</span>}
          </div>

          {/* SKU */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">SKU Code</label>
            <input
              type="text"
              {...register('sku', { required: 'SKU is required' })}
              className={`border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black font-mono font-bold ${errors.sku ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
            />
            {errors.sku && <span className="text-[10px] text-red-500 font-semibold">{errors.sku.message}</span>}
          </div>

          {/* Colors */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Colors <span className="font-normal text-gray-400 normal-case">(comma-separated)</span>
            </label>
            <input
              type="text"
              placeholder="Red, Blue, Black"
              {...register('colorsInput')}
              className="border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black"
            />
            <p className="text-[10px] text-gray-400">e.g. Red, Navy Blue, White</p>
          </div>

          {/* Sizes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Sizes <span className="font-normal text-gray-400 normal-case">(comma-separated)</span>
            </label>
            <input
              type="text"
              placeholder="S, M, L, XL, XXL"
              {...register('sizesInput')}
              className="border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black"
            />
            <p className="text-[10px] text-gray-400">e.g. XS, S, M, L, XL, XXL</p>
          </div>

          {/* Product Image */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Product Image</label>
            <input type="hidden" {...register('imageInput', { required: 'Product image is required' })} />
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="w-24 h-28 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center shrink-0 relative">
                {watchImageInput ? (
                  <Image src={watchImageInput} alt="Preview" fill className="object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <label className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all text-center gap-2 ${errors.imageInput ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-black bg-gray-50 hover:bg-gray-100'}`}>
                {isUploading ? (
                  <><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /><span className="text-xs font-bold text-gray-600">Uploading…</span></>
                ) : (
                  <><UploadCloud className="w-6 h-6 text-gray-400" /><span className="text-xs font-bold text-gray-700">Click to upload product image</span><span className="text-[10px] text-gray-400">PNG, JPG, WEBP up to 5MB</span></>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading} className="hidden" />
              </label>
            </div>
            {errors.imageInput && <span className="text-[10px] text-red-500 font-semibold">{errors.imageInput.message}</span>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || isUploading}
          className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Create Product</>}
        </button>
      </form>
    </div>
  );
}