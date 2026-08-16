'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useGetProductByIdQuery, useUpdateProductMutation } from '@/store/services/productsApi';
import { ArrowLeft, Save, UploadCloud, Image as ImageIcon, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

type ProductEditFormInputs = {
  name: string;
  description: string;
  price: string;
  category: string;
  brand: string;
  stock: string;
  imageInput: string;
  colorsInput: string;
  sizesInput: string;
};

const parseTags = (raw: string): string[] =>
  raw.split(',').map((s) => s.trim()).filter(Boolean);

export default function AdminEditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: product, isLoading: loadingProduct } = useGetProductByIdQuery(id as string);
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register, handleSubmit, reset, watch, setValue,
    formState: { errors },
  } = useForm<ProductEditFormInputs>({
    defaultValues: { name: '', description: '', price: '', category: '', brand: '', stock: '', imageInput: '', colorsInput: '', sizesInput: '' },
  });

  const watchImageInput = watch('imageInput');

  useEffect(() => {
    if (product) {
      reset({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        category: product.category || '',
        brand: product.brand || '',
        stock: product.stock?.toString() || '',
        imageInput: product.images?.[0] || '',
        colorsInput: (product.colors || []).join(', '),
        sizesInput: (product.sizes || []).join(', '),
      });
    }
  }, [product, reset]);

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
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      const data = await res.json();
      setValue('imageInput', data.url, { shouldValidate: true });
      toast.success('Image uploaded!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: ProductEditFormInputs) => {
    setErrorMsg('');
    try {
      await updateProduct({
        id: id as string,
        name: data.name,
        description: data.description,
        price: Number(data.price),
        category: data.category,
        brand: data.brand || 'SHOP.CO',
        colors: parseTags(data.colorsInput),
        sizes: parseTags(data.sizesInput),
        stock: Number(data.stock),
        images: data.imageInput ? [data.imageInput] : [],
      }).unwrap();
      toast.success('Product updated!');
      router.push('/admin/products');
    } catch (err: any) {
      const msg = err?.data?.message || 'Failed to update product';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  if (loadingProduct) return (
    <div className="flex items-center justify-center p-20">
      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
    </div>
  );

  return (
    <div className="flex flex-col gap-6 font-['Rubik'] max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="p-2 bg-white rounded-xl border hover:bg-gray-50">
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-xs text-gray-400">Update details for #{(id as string).slice(-6)}</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded-2xl font-bold flex items-center gap-2">
          <X className="w-4 h-4 shrink-0" /> {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Product Name</label>
            <input type="text" {...register('name', { required: 'Product name is required' })}
              className={`border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black font-semibold ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} />
            {errors.name && <span className="text-[10px] text-red-500 font-semibold">{errors.name.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Description</label>
            <textarea rows={3} {...register('description', { required: 'Description is required' })}
              className={`border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black ${errors.description ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} />
            {errors.description && <span className="text-[10px] text-red-500 font-semibold">{errors.description.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Price (PKR)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">₨</span>
              <input type="number" min="0" {...register('price', { required: 'Price is required' })}
                className={`w-full border rounded-xl p-3 pl-8 text-sm outline-none focus:ring-2 focus:ring-black font-bold ${errors.price ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} />
            </div>
            {errors.price && <span className="text-[10px] text-red-500 font-semibold">{errors.price.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Category</label>
            <input type="text" placeholder="e.g. Casual, Formal, Gym..." {...register('category', { required: 'Category is required' })}
              className={`border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black ${errors.category ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} />
            {errors.category && <span className="text-[10px] text-red-500 font-semibold">{errors.category.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Stock Quantity</label>
            <input type="number" min="0" {...register('stock', { required: 'Stock is required' })}
              className={`border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black font-bold ${errors.stock ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} />
            {errors.stock && <span className="text-[10px] text-red-500 font-semibold">{errors.stock.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Brand</label>
            <input type="text" {...register('brand')}
              className="border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Colors <span className="font-normal text-gray-400 normal-case">(comma-separated)</span>
            </label>
            <input type="text" placeholder="Red, Blue, Black" {...register('colorsInput')}
              className="border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Sizes <span className="font-normal text-gray-400 normal-case">(comma-separated)</span>
            </label>
            <input type="text" placeholder="S, M, L, XL, XXL" {...register('sizesInput')}
              className="border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black" />
          </div>

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
                  <><UploadCloud className="w-6 h-6 text-gray-400" /><span className="text-xs font-bold text-gray-700">Click to upload new image</span><span className="text-[10px] text-gray-400">PNG, JPG, WEBP up to 5MB</span></>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading} className="hidden" />
              </label>
            </div>
            {errors.imageInput && <span className="text-[10px] text-red-500 font-semibold">{errors.imageInput.message}</span>}
          </div>
        </div>

        <button type="submit" disabled={updating || isUploading}
          className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {updating ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </form>
    </div>
  );
}
