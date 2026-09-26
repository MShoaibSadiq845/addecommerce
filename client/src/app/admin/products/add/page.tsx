'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useCreateProductMutation } from '@/store/services/productsApi';
import { ArrowLeft, Save, UploadCloud, Image as ImageIcon, Loader2, X, Armchair, Sparkles, Calculator, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { SOFA_SEAT_OPTIONS, calculateSeatPricesString, isSofaProduct } from '@/lib/sofaConfig';

type ProductFormInputs = {
  name: string;
  description: string;
  price: string;
  rating: string;
  category: string;
  brand: string;
  stock: string;
  sku: string;
  imagesInput: string[];
  colorsInput: string;
  sizesInput: string;
};

const parseTags = (raw: string): string[] =>
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const generateSKU = () => `SKU-${Math.floor(100000 + Math.random() * 900000)}`;

function AdminAddProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  const pageParam = searchParams.get('page');

  const getReturnUrl = () => {
    const params = new URLSearchParams();
    if (categoryParam) params.set('category', categoryParam);
    if (searchParam) params.set('search', searchParam);
    if (pageParam && Number(pageParam) > 1) params.set('page', pageParam);
    const qs = params.toString();
    return qs ? `/admin/products?${qs}` : '/admin/products';
  };

  const [createProduct, { isLoading }] = useCreateProductMutation();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [seatPrices, setSeatPrices] = useState<Record<string, string>>({
    '1 seats': '',
    '2 seats': '',
    '3 seats': '',
    '2(1+1)': '',
    '5(3+1+1)': '',
    '5(3+2)': '',
    '6(3+2+1)': '',
    '7(3+2+1+1)': '',
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormInputs>({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      rating: '4.5',
      category: categoryParam || '',
      brand: 'Fab Decor',
      stock: '50',
      sku: generateSKU(),
      imagesInput: [],
      colorsInput: '',
      sizesInput: '',
    },
  });


  const watchName = watch('name') || '';
  const watchCategory = watch('category') || '';
  const watchPrice = watch('price') || '';
  const watchImagesInput = watch('imagesInput') || [];

  const isSofa = isSofaProduct(watchName, watchCategory);

  // Auto-sync all seat prices whenever the base price changes
  useEffect(() => {
    if (isSofa && watchPrice) {
      const base = Number(watchPrice);
      if (base > 0) {
        setSeatPrices(calculateSeatPricesString(base));
      }
    }
  }, [watchPrice, isSofa]);

  const handleSeatPriceChange = (key: string, val: string) => {
    setSeatPrices((prev) => ({
      ...prev,
      [key]: val,
    }));

    if (key === '1 seats') {
      setValue('price', val, { shouldValidate: true });
      const base = Number(val);
      if (base > 0) {
        setSeatPrices(calculateSeatPricesString(base));
      }
    }
  };

  // Quick auto-fill: seat price = base price × seat count
  const handleAutoEstimatePrices = () => {
    const base = Number(watchPrice || seatPrices['1 seats']);
    if (!base || base <= 0) {
      toast.error('Please enter a base price first to auto-calculate seat prices');
      return;
    }
    const newPrices = calculateSeatPricesString(base);
    setValue('price', String(base), { shouldValidate: true });
    setSeatPrices(newPrices);
    toast.success(`Prices auto-set: 1 seat=₨${base}, 2=₨${base*2}, 3=₨${base*3}, 5=₨${base*5}, 6=₨${base*6}, 7=₨${base*7}`);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/upload`,
          { method: 'POST', body: formData },
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.message || `Upload failed (${res.status})`);
        }
        const data = await res.json();
        uploadedUrls.push(data.url);
      }
      const currentImages = watch('imagesInput') || [];
      setValue('imagesInput', [...currentImages, ...uploadedUrls], { shouldValidate: true });
      toast.success('Images uploaded successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const onSubmit = async (data: ProductFormInputs) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      // Build clean seatPricing object if sofa
      let cleanSeatPricing: Record<string, number> = {};
      const basePriceNum = Number(data.price) || Number(seatPrices['1 seats']) || 0;

      if (isSofa) {
        SOFA_SEAT_OPTIONS.forEach((opt) => {
          const val = Number(seatPrices[opt.key]);
          if (!isNaN(val) && val > 0) {
            cleanSeatPricing[opt.key] = val;
          } else if (basePriceNum > 0) {
            cleanSeatPricing[opt.key] = basePriceNum * opt.seats;
          }
        });
        if (basePriceNum > 0) {
          cleanSeatPricing['1 seats'] = Number(seatPrices['1 seats']) || basePriceNum;
        }
      }

      await createProduct({
        name: data.name,
        description: data.description,
        price: Number(data.price),
        rating: data.rating ? Math.min(5, Math.max(0, Number(data.rating))) : 4.5,
        category: data.category,
        brand: data.brand || 'Fab Decor',
        colors: parseTags(data.colorsInput),
        sizes: isSofa
          ? SOFA_SEAT_OPTIONS.map((o) => o.key)
          : parseTags(data.sizesInput),
        stock: Number(data.stock),
        sku: data.sku,
        images: data.imagesInput.length > 0 ? data.imagesInput : ['/images/7.png'],
        seatPricing: cleanSeatPricing,
        tags: [
          ...parseTags(data.colorsInput),
          ...(isSofa ? SOFA_SEAT_OPTIONS.map((o) => o.key) : parseTags(data.sizesInput)),
          data.category.toLowerCase(),
          ...(isSofa ? ['sofa', 'sofa cover', 'seating'] : []),
        ],
      }).unwrap();

      const createdProductName = data.name;

      // Reset form fields with fresh SKU and default values
      reset({
        name: '',
        description: '',
        price: '',
        rating: '4.5',
        category: categoryParam || '',
        brand: 'Fab Decor',
        stock: '50',
        sku: generateSKU(),
        imagesInput: [],
        colorsInput: '',
        sizesInput: '',
      });

      // Reset sofa seating state
      setSeatPrices({
        '1 seats': '',
        '2 seats': '',
        '3 seats': '',
        '2(1+1)': '',
        '5(3+1+1)': '',
        '5(3+2)': '',
        '6(3+2+1)': '',
        '7(3+2+1+1)': '',
      });

      setSuccessMsg(`"${createdProductName}" has been created successfully! You can now add another product.`);

      toast.success('Product created successfully! You can add more products.', {
        duration: 4500,
        position: 'top-right',
        style: {
          background: '#0f172a',
          color: '#fff',
          fontWeight: 600,
          borderRadius: '12px',
          padding: '12px 18px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        },
        iconTheme: {
          primary: '#10b981',
          secondary: '#fff',
        },
      });

      // Smooth scroll to top to see confirmation & fresh empty form
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      const msg = err?.data?.message || 'Failed to create product';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-['Rubik'] max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={getReturnUrl()} className="p-2 bg-white rounded-xl border hover:bg-gray-50">
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-xs text-gray-400">Fill in product details below</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl font-semibold flex items-center justify-between gap-2 shadow-xs animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <Link
            href={getReturnUrl()}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline whitespace-nowrap ml-2"
          >
            View Products →
          </Link>
        </div>
      )}

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
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Product Name</label>
              {isSofa && (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Armchair className="w-3 h-3" /> Sofa Product Detected
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="e.g. Copper Stripe Jacquard Sofa Cover"
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
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              {isSofa ? 'Base Price (1 Seat) (PKR)' : 'Price (PKR)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">₨</span>
              <input
                type="number"
                min="0"
                placeholder="2399"
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

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Category</label>
            <input
              type="text"
              placeholder="e.g. Sofa Covers, Stripe Jacquard Sofa Covers..."
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
              placeholder="Copper, Grey, Beige, Navy"
              {...register('colorsInput')}
              className="border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black"
            />
            <p className="text-[10px] text-gray-400">e.g. Copper, Beige, Grey, Dark Blue</p>
          </div>

          {/* Regular Sizes (Hidden if Sofa) */}
          {!isSofa && (
            <div className="flex flex-col gap-1.5 md:col-span-2">
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
          )}

          {/* 🛋️ DYNAMIC SOFA SEAT PRICING CONFIGURATION */}
          {isSofa && (
            <div className="md:col-span-2 bg-gradient-to-br from-amber-50/70 to-orange-50/50 border-2 border-amber-200/80 rounded-2xl p-6 flex flex-col gap-4 shadow-sm animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500 text-white rounded-xl">
                    <Armchair className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                      Seat Pricing Configuration
                      <span className="text-[10px] font-semibold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                        Dynamic Sofa Mode
                      </span>
                    </h3>
                    <p className="text-[11px] text-amber-800">
                      Set individual pricing for each standard sofa size and seating option.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAutoEstimatePrices}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm self-start sm:self-auto"
                >
                  <Calculator className="w-3.5 h-3.5" /> Auto-Calculate Tiers
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 pt-1">
                {SOFA_SEAT_OPTIONS.map((opt) => (
                  <div
                    key={opt.key}
                    className="bg-white border border-amber-200 rounded-xl p-3 flex flex-col gap-1.5 focus-within:ring-2 focus-within:ring-amber-500 transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">{opt.label}</span>
                      <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        {opt.badge}
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₨</span>
                      <input
                        type="number"
                        min="0"
                        placeholder={opt.key === '1 seats' ? (watchPrice || '2399') : 'e.g. 4500'}
                        value={seatPrices[opt.key] || ''}
                        onChange={(e) => handleSeatPriceChange(opt.key, e.target.value)}
                        className="w-full pl-6 pr-2 py-2 text-xs font-bold text-gray-900 bg-amber-50/30 border border-gray-200 rounded-lg outline-none focus:bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-amber-900/70 font-medium">
                * Note: <strong className="text-amber-950">1 seats</strong> is the default base variant shown on the product page. Customers clicking any seat option will instantly see that seat&apos;s price.
              </p>
            </div>
          )}

          {/* Product Images */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Product Images</label>
            <input type="hidden" {...register('imagesInput', { required: 'At least one product image is required' })} />
            <div className="flex flex-col md:flex-row gap-4 items-center flex-wrap">
              {watchImagesInput.length > 0 ? (
                watchImagesInput.map((url, idx) => (
                  <div key={idx} className="w-24 h-28 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center shrink-0 relative group">
                    <Image src={url} alt="Preview" fill className="object-cover" />
                    <button type="button" onClick={() => setValue('imagesInput', watchImagesInput.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="w-24 h-28 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <label className={`flex-1 min-w-[200px] flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all text-center gap-2 ${errors.imagesInput ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-black bg-gray-50 hover:bg-gray-100'}`}>
                {isUploading ? (
                  <><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /><span className="text-xs font-bold text-gray-600">Uploading…</span></>
                ) : (
                  <><UploadCloud className="w-6 h-6 text-gray-400" /><span className="text-xs font-bold text-gray-700">Click to upload images</span><span className="text-[10px] text-gray-400">Select multiple PNG, JPG, WEBP</span></>
                )}
                <input type="file" multiple accept="image/*" onChange={handleFileChange} disabled={isUploading} className="hidden" />
              </label>
            </div>
            {errors.imagesInput && <span className="text-[10px] text-red-500 font-semibold">{errors.imagesInput.message}</span>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || isUploading}
          className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Create Product</>}
        </button>
      </form>
    </div>
  );
}

export default function AdminAddProductPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>}>
      <AdminAddProductContent />
    </Suspense>
  );
}