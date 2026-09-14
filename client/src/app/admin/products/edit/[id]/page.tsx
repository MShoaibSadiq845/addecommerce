'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useGetProductByIdQuery, useUpdateProductMutation } from '@/store/services/productsApi';
import { ArrowLeft, Save, UploadCloud, Image as ImageIcon, Loader2, X, Armchair, Calculator } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { SOFA_SEAT_OPTIONS, isSofaProduct } from '@/lib/sofaConfig';

type ProductEditFormInputs = {
  name: string;
  description: string;
  price: string;
  category: string;
  brand: string;
  stock: string;
  imagesInput: string[];
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
    register, handleSubmit, reset, watch, setValue,
    formState: { errors },
  } = useForm<ProductEditFormInputs>({
    defaultValues: { name: '', description: '', price: '', category: '', brand: '', stock: '', imagesInput: [], colorsInput: '', sizesInput: '' },
  });

  const watchName = watch('name') || '';
  const watchCategory = watch('category') || '';
  const watchPrice = watch('price') || '';
  const watchImagesInput = watch('imagesInput') || [];

  const isSofa = isSofaProduct(watchName, watchCategory, product?.tags, product?.seatPricing);

  useEffect(() => {
    if (product) {
      reset({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        category: product.category || '',
        brand: product.brand || '',
        stock: product.stock?.toString() || '',
        imagesInput: product.images || [],
        colorsInput: (product.colors || []).join(', '),
        sizesInput: (product.sizes || []).join(', '),
      });

      if (product.seatPricing && Object.keys(product.seatPricing).length > 0) {
        const loadedPrices: Record<string, string> = {
          '1 seats': '',
          '2 seats': '',
          '3 seats': '',
          '2(1+1)': '',
          '5(3+1+1)': '',
          '5(3+2)': '',
          '6(3+2+1)': '',
          '7(3+2+1+1)': '',
        };
        Object.entries(product.seatPricing).forEach(([k, v]) => {
          loadedPrices[k] = String(v);
        });
        if (!loadedPrices['1 seats'] && product.price) {
          loadedPrices['1 seats'] = String(product.price);
        }
        setSeatPrices(loadedPrices);
      } else if (product.price) {
        setSeatPrices((prev) => ({
          ...prev,
          '1 seats': String(product.price),
        }));
      }
    }
  }, [product, reset]);

  const handleSeatPriceChange = (key: string, val: string) => {
    setSeatPrices((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleAutoEstimatePrices = () => {
    const base = Number(watchPrice || seatPrices['1 seats']);
    if (!base || base <= 0) {
      toast.error('Please enter a base price first');
      return;
    }
    setSeatPrices({
      '1 seats': String(base * 1),
      '2 seats': String(base * 2),
      '3 seats': String(base * 3),
      '2(1+1)': String(base * 2),
      '5(3+1+1)': String(base * 5),
      '5(3+2)': String(base * 5),
      '6(3+2+1)': String(base * 6),
      '7(3+2+1+1)': String(base * 7),
    });
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
        if (!res.ok) throw new Error(`Upload failed (${res.status})`);
        const data = await res.json();
        uploadedUrls.push(data.url);
      }
      const currentImages = watch('imagesInput') || [];
      setValue('imagesInput', [...currentImages, ...uploadedUrls], { shouldValidate: true });
      toast.success('Images uploaded!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: ProductEditFormInputs) => {
    setErrorMsg('');
    try {
      let cleanSeatPricing: Record<string, number> = {};
      if (isSofa) {
        SOFA_SEAT_OPTIONS.forEach((opt) => {
          const val = Number(seatPrices[opt.key]);
          if (!isNaN(val) && val > 0) {
            cleanSeatPricing[opt.key] = val;
          } else if (opt.key === '1 seats') {
            cleanSeatPricing['1 seats'] = Number(data.price) || 0;
          }
        });
      }

      await updateProduct({
        id: id as string,
        name: data.name,
        description: data.description,
        price: Number(data.price),
        category: data.category,
        brand: data.brand || 'SHOP.CO',
        colors: parseTags(data.colorsInput),
        sizes: isSofa
          ? SOFA_SEAT_OPTIONS.map((o) => o.key)
          : parseTags(data.sizesInput),
        stock: Number(data.stock),
        images: data.imagesInput.length > 0 ? data.imagesInput : [],
        seatPricing: cleanSeatPricing,
        tags: [
          ...parseTags(data.colorsInput),
          ...(isSofa ? SOFA_SEAT_OPTIONS.map((o) => o.key) : parseTags(data.sizesInput)),
          data.category.toLowerCase(),
          ...(isSofa ? ['sofa', 'sofa cover', 'seating'] : []),
        ],
      }).unwrap();
      toast.success('Product updated successfully!');
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
    <div className="flex flex-col gap-6 font-['Rubik'] max-w-3xl mx-auto pb-12">
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Product Name</label>
              {isSofa && (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Armchair className="w-3 h-3" /> Sofa Product Detected
                </span>
              )}
            </div>
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
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              {isSofa ? 'Base Price (1 Seat) (PKR)' : 'Price (PKR)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">₨</span>
              <input type="number" min="0" {...register('price', { required: 'Price is required' })}
                className={`w-full border rounded-xl p-3 pl-8 text-sm outline-none focus:ring-2 focus:ring-black font-bold ${errors.price ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} />
            </div>
            {errors.price && <span className="text-[10px] text-red-500 font-semibold">{errors.price.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Category</label>
            <input type="text" placeholder="e.g. Sofa Covers, Casual, Formal..." {...register('category', { required: 'Category is required' })}
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
            <input type="text" placeholder="Copper, Beige, Grey" {...register('colorsInput')}
              className="border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black" />
          </div>

          {!isSofa && (
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Sizes <span className="font-normal text-gray-400 normal-case">(comma-separated)</span>
              </label>
              <input type="text" placeholder="S, M, L, XL, XXL" {...register('sizesInput')}
                className="border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black" />
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

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Product Images</label>
            <input type="hidden" {...register('imagesInput')} />
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

        <button type="submit" disabled={updating || isUploading}
          className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
          {updating ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </form>
    </div>
  );
}
