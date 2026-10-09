'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Trash2,
  HelpCircle,
  Eye,
  Layers,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useBulkUploadProductsMutation } from '@/store/services/productsApi';

interface ParsedPreviewRow {
  rowNum: number;
  name: string;
  category: string;
  price: number | string;
  stock: number | string;
  sku: string;
  description: string;
  colors: string;
  sizes: string;
  images: string;
  brand: string;
  isValid: boolean;
  errors: string[];
}

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewRows, setPreviewRows] = useState<ParsedPreviewRow[]>([]);
  const [totalParsed, setTotalParsed] = useState(0);
  const [, setIsParsing] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    inserted: number;
    skipped: number;
    errors: { row: number; reason: string }[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bulkUpload, { isLoading: isUploading }] = useBulkUploadProductsMutation();

  // ── Download Sample Template ─────────────────────────────────────────────
  const downloadSampleTemplate = (format: 'xlsx' | 'csv' = 'xlsx') => {
    const sampleData = [
      {
        productName: 'Luxury Velvet Sofa Cover 3-Seater',
        description: 'Ultra-soft stretchable velvet sofa slipcover with elastic bottom band.',
        price: 4999,
        category: 'Sofa Covers',
        stockQuantity: 45,
        skuCode: 'SC-VEL-3S-01',
        colors: 'Navy Blue, Emerald Green, Charcoal Grey',
        sizes: '3 Seater, 2 Seater, 1 Seater',
        imageUrls: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc, https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
        brand: 'Fab Decor',
      },
      {
        productName: 'Egyptian Cotton Fitted Bed Sheet King',
        description: '400 thread count breathable satin weave pure Egyptian cotton bedsheet with 2 pillowcases.',
        price: 3499,
        category: 'Bedsheets',
        stockQuantity: 60,
        skuCode: 'BS-EGY-KNG-02',
        colors: 'Snow White, Pastel Pink, Sage Green',
        sizes: 'King (72x78 in), Queen (60x78 in)',
        imageUrls: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af',
        brand: 'Fab Decor',
      },
      {
        productName: 'Jacquard Blackout Window Curtains (Pair)',
        description: 'Thermal insulated noise reducing curtain set with bronze eyelet rings.',
        price: 2799,
        category: 'Curtains',
        stockQuantity: 30,
        skuCode: 'CRT-JAC-84-03',
        colors: 'Beige, Ash Grey, Chocolate Brown',
        sizes: '7 Feet, 9 Feet',
        imageUrls: 'https://images.unsplash.com/photo-1513694203232-719a280e022f',
        brand: 'Fab Decor',
      },
      {
        productName: 'Microfiber Down Alternative Pillow Set',
        description: 'Hotel collection pack of 2 hypoallergenic extra soft sleeping pillows.',
        price: 1899,
        category: 'Pillows & Cushions',
        stockQuantity: 100,
        skuCode: 'PLW-MIC-STD-04',
        colors: 'Pure White',
        sizes: 'Standard (18x28 in)',
        imageUrls: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2',
        brand: 'Fab Decor',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    worksheet['!cols'] = [
      { wch: 38 },
      { wch: 50 },
      { wch: 10 },
      { wch: 18 },
      { wch: 14 },
      { wch: 16 },
      { wch: 30 },
      { wch: 25 },
      { wch: 45 },
      { wch: 14 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

    if (format === 'csv') {
      XLSX.writeFile(workbook, 'products_bulk_template.csv');
    } else {
      XLSX.writeFile(workbook, 'products_bulk_template.xlsx');
    }
    toast.success(`Downloaded sample ${format.toUpperCase()} template!`);
  };

  // ── Parse Selected File for Instant Frontend Preview ─────────────────────
  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setUploadResult(null);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

        setTotalParsed(rows.length);

        const validated: ParsedPreviewRow[] = rows.map((r, idx) => {
          const rowNum = idx + 2;
          const name = String(r['productName'] ?? r['name'] ?? '').trim();
          const category = String(r['category'] ?? '').trim();
          const priceRaw = r['price'];
          const price = Number(priceRaw);
          const stockRaw = r['stockQuantity'] ?? r['stock'];
          const stock = Number(stockRaw) || 0;
          const sku = String(r['skuCode'] ?? r['sku'] ?? '').trim();
          const description = String(r['description'] ?? '').trim();
          const colors = String(r['colors'] ?? '').trim();
          const sizes = String(r['sizes'] ?? '').trim();
          const images = String(r['imageUrls'] ?? r['images'] ?? '').trim();
          const brand = String(r['brand'] ?? 'Fab Decor').trim();

          const errors: string[] = [];
          if (!name) errors.push('Missing productName');
          if (!category) errors.push('Missing category');
          if (isNaN(price) || price <= 0) errors.push('Invalid price');

          return {
            rowNum,
            name,
            category,
            price: isNaN(price) ? String(priceRaw) : price,
            stock,
            sku,
            description,
            colors,
            sizes,
            images,
            brand,
            isValid: errors.length === 0,
            errors,
          };
        });

        setPreviewRows(validated);
        toast.success(`Loaded ${rows.length} product rows from file`);
      } catch (err: any) {
        toast.error(`Failed to read file: ${err.message || 'Invalid format'}`);
        setPreviewRows([]);
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validTypes = ['.xlsx', '.xls', '.csv'];
      const ext = droppedFile.name.substring(droppedFile.name.lastIndexOf('.')).toLowerCase();
      if (!validTypes.includes(ext)) {
        toast.error('Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.');
        return;
      }
      processFile(droppedFile);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewRows([]);
    setTotalParsed(0);
    setUploadResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Submit File to Backend Bulk Upload Endpoint ──────────────────────────
  const handleUploadSubmit = async () => {
    if (!file) {
      toast.error('Please select an Excel or CSV file to upload.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await bulkUpload(formData).unwrap();
      setUploadResult(res);

      if (res.inserted > 0) {
        toast.success(`🎉 Successfully imported ${res.inserted} products!`);
      } else {
        toast.error('No products were imported. Check the errors list below.');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Bulk upload failed. Please verify your file format.');
    }
  };

  const validRowCount = previewRows.filter((r) => r.isValid).length;
  const invalidRowCount = previewRows.filter((r) => !r.isValid).length;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16 font-['Open_Sans']">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all"
            title="Back to products list"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-indigo-600" />
              Bulk Product Upload
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Import hundreds of home textile products simultaneously via Excel (.xlsx) or CSV.
            </p>
          </div>
        </div>

        {/* Action Buttons: Template Download */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => downloadSampleTemplate('xlsx')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Excel Template (.xlsx)</span>
          </button>
          <button
            type="button"
            onClick={() => downloadSampleTemplate('csv')}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span>CSV Template</span>
          </button>
        </div>
      </div>

      {/* ─── Instructions & Column Specification Card ─── */}
      <div className="bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-slate-50 border border-indigo-100/80 rounded-2xl p-5 text-xs text-gray-700">
        <div className="flex items-center gap-2 font-bold text-indigo-950 text-sm mb-2">
          <HelpCircle className="w-4 h-4 text-indigo-600" />
          Spreadsheet Format & Column Guidelines
        </div>
        <p className="text-gray-600 leading-relaxed mb-3">
          Your file must contain the following column headers in the first row. You can download our ready-to-use sample template above:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-[11px]">
          <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-100 shadow-2xs">
            <span className="font-bold text-gray-900 font-mono">productName</span>
            <span className="text-rose-500 ml-1 font-bold">*Required</span>
            <p className="text-gray-500 text-[10px] mt-0.5">Product title / name (e.g. Velvet Sofa Cover)</p>
          </div>
          <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-100 shadow-2xs">
            <span className="font-bold text-gray-900 font-mono">category</span>
            <span className="text-rose-500 ml-1 font-bold">*Required</span>
            <p className="text-gray-500 text-[10px] mt-0.5">Sofa Covers, Bedsheets, Curtains, etc.</p>
          </div>
          <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-100 shadow-2xs">
            <span className="font-bold text-gray-900 font-mono">price</span>
            <span className="text-rose-500 ml-1 font-bold">*Required</span>
            <p className="text-gray-500 text-[10px] mt-0.5">Numeric positive price (e.g. 4999)</p>
          </div>
          <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-100 shadow-2xs">
            <span className="font-bold text-gray-900 font-mono">stockQuantity</span>
            <span className="text-gray-400 ml-1 font-medium">(Optional)</span>
            <p className="text-gray-500 text-[10px] mt-0.5">Available stock count (defaults to 0)</p>
          </div>
          <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-100 shadow-2xs">
            <span className="font-bold text-gray-900 font-mono">skuCode</span>
            <span className="text-gray-400 ml-1 font-medium">(Optional)</span>
            <p className="text-gray-500 text-[10px] mt-0.5">Unique SKU. Auto-generated if left blank</p>
          </div>
          <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-100 shadow-2xs">
            <span className="font-bold text-gray-900 font-mono">description</span>
            <span className="text-gray-400 ml-1 font-medium">(Optional)</span>
            <p className="text-gray-500 text-[10px] mt-0.5">Detailed text describing the product</p>
          </div>
          <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-100 shadow-2xs">
            <span className="font-bold text-gray-900 font-mono">colors</span>
            <span className="text-gray-400 ml-1 font-medium">(Optional)</span>
            <p className="text-gray-500 text-[10px] mt-0.5">Comma-separated: <code className="bg-gray-100 px-1 rounded">Red, Blue, Grey</code></p>
          </div>
          <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-100 shadow-2xs">
            <span className="font-bold text-gray-900 font-mono">sizes</span>
            <span className="text-gray-400 ml-1 font-medium">(Optional)</span>
            <p className="text-gray-500 text-[10px] mt-0.5">Comma-separated: <code className="bg-gray-100 px-1 rounded">King, Queen, Single</code></p>
          </div>
          <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-100 shadow-2xs">
            <span className="font-bold text-gray-900 font-mono">imageUrls</span>
            <span className="text-gray-400 ml-1 font-medium">(Optional)</span>
            <p className="text-gray-500 text-[10px] mt-0.5">Comma-separated image links</p>
          </div>
        </div>
      </div>

      {/* ─── File Upload Area ─── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-5">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-gray-500" />
          Upload Spreadsheet File
        </h2>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-600 bg-indigo-50/50 scale-[0.99]'
              : file
              ? 'border-emerald-400 bg-emerald-50/30'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
            onChange={handleFileChange}
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <p className="font-bold text-gray-900 text-sm mt-1">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB &bull; {totalParsed} row{totalParsed !== 1 ? 's' : ''} parsed
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[11px] font-bold text-indigo-600 hover:underline">
                  Click or drop to replace file
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  className="p-1 text-gray-400 hover:text-rose-600 rounded-md transition-all"
                  title="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center mb-1">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="font-bold text-gray-800 text-sm">
                Drag &amp; drop your Excel or CSV file here
              </p>
              <p className="text-xs text-gray-400">
                Supports <span className="font-mono text-gray-600 font-semibold">.xlsx</span>,{' '}
                <span className="font-mono text-gray-600 font-semibold">.xls</span>, and{' '}
                <span className="font-mono text-gray-600 font-semibold">.csv</span> up to 10MB
              </p>
              <button
                type="button"
                className="mt-3 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-xs pointer-events-none"
              >
                Browse Files
              </button>
            </div>
          )}
        </div>

        {/* ─── File Validation Summary Pills ─── */}
        {previewRows.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-700">
                <FileSpreadsheet className="w-3.5 h-3.5 text-gray-500" />
                Total: {previewRows.length} rows
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Ready to Import: {validRowCount}
              </span>
              {invalidRowCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Has Warnings: {invalidRowCount}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleUploadSubmit}
              disabled={isUploading || validRowCount === 0}
              className="flex items-center gap-2 bg-black hover:bg-gray-800 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ml-auto"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Importing {validRowCount} Products...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Start Bulk Import ({validRowCount} Valid Products)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ─── Upload Execution Result Banner ─── */}
      {uploadResult && (
        <div
          className={`rounded-2xl p-5 border text-xs flex flex-col gap-3 ${
            uploadResult.inserted > 0
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-rose-50/70 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              {uploadResult.inserted > 0 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600" />
              )}
              <span>
                Import Completed: {uploadResult.inserted} product{uploadResult.inserted !== 1 ? 's' : ''} added
                successfully!
              </span>
            </div>
            <Link
              href="/admin/products"
              className="px-4 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              View in Products List &rarr;
            </Link>
          </div>

          {uploadResult.skipped > 0 && (
            <div className="bg-white/80 border border-amber-200 rounded-xl p-3 text-amber-900">
              <span className="font-bold block mb-1">
                ⚠️ {uploadResult.skipped} row{uploadResult.skipped !== 1 ? 's' : ''} could not be imported:
              </span>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-gray-700">
                {uploadResult.errors.map((err, idx) => (
                  <li key={idx}>
                    Row {err.row}: <span className="font-medium text-rose-600">{err.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ─── Interactive Data Preview Table ─── */}
      {previewRows.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-600" />
                Spreadsheet Data Preview
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Showing all parsed rows from your file before importing to MongoDB database.
              </p>
            </div>
            <span className="text-xs font-bold text-gray-500 font-mono">
              {previewRows.length} Rows
            </span>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Row</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Stock</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Colors</th>
                  <th className="py-2.5 px-3">Sizes</th>
                  <th className="py-2.5 px-3">Brand</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {previewRows.map((row) => (
                  <tr
                    key={row.rowNum}
                    className={`hover:bg-gray-50 transition-colors ${
                      !row.isValid ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {row.isValid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> OK
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600"
                          title={row.errors.join(', ')}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" /> Invalid
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-gray-400 text-[11px]">
                      #{row.rowNum}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-gray-900 max-w-[220px] truncate">
                      {row.name || <span className="text-rose-500 italic">Required</span>}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                        {row.category || <span className="text-rose-500 italic">Required</span>}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-gray-900 whitespace-nowrap">
                      Rs. {typeof row.price === 'number' ? row.price.toLocaleString() : row.price}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">{row.stock}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-500 text-[11px] whitespace-nowrap">
                      {row.sku || <span className="text-gray-400 italic">Auto-generate</span>}
                    </td>
                    <td className="py-2.5 px-3 text-gray-500 text-[11px] max-w-[140px] truncate">
                      {row.colors || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-gray-500 text-[11px] max-w-[140px] truncate">
                      {row.sizes || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 text-[11px] whitespace-nowrap">
                      {row.brand || 'Fab Decor'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}