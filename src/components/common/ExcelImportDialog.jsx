import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  ArrowRight,
  RefreshCw,
  Info,
  Check,
} from 'lucide-react';
import { Button } from './Button';
import { formatCurrency } from '../../utils/formatters';

// Module Schema Definitions
const MODULE_SCHEMAS = {
  inventory: {
    title: 'Import Kitchen Ingredients',
    sampleFileName: 'stockmate_ingredients_template.xlsx',
    columns: [
      { key: 'name', label: 'Ingredient Name', required: true, aliases: ['ingredient name', 'name', 'item', 'ingredient', 'product'] },
      { key: 'category', label: 'Category', required: true, aliases: ['category', 'type', 'item group'] },
      { key: 'quantity', label: 'Current Stock', required: true, type: 'number', aliases: ['current stock', 'quantity', 'qty', 'stock', 'volume', 'amount'] },
      { key: 'unit', label: 'Unit of Measure', required: true, aliases: ['unit', 'unit of measure', 'uom', 'measure'] },
      { key: 'costPerUnit', label: 'Cost Per Unit (INR)', required: true, type: 'number', aliases: ['cost per unit (inr)', 'cost per unit', 'unit cost', 'price', 'rate', 'cost'] },
      { key: 'minThreshold', label: 'Min Safety Threshold', required: false, type: 'number', aliases: ['min safety threshold', 'min threshold', 'safety stock', 'reorder level'] },
      { key: 'storageLocation', label: 'Storage Location', required: false, aliases: ['storage location', 'storage', 'location'] },
      { key: 'batchNumber', label: 'Batch Number', required: false, aliases: ['batch number', 'batch', 'lot', 'lot number'] },
      { key: 'expiryDate', label: 'Expiry Date (YYYY-MM-DD)', required: false, aliases: ['expiry date', 'expiry', 'exp date', 'best before'] },
    ],
    sampleRows: [
      {
        'Ingredient Name': 'Basmati Rice Premium (Daawat)',
        Category: 'Dry Goods',
        'Current Stock': 50,
        'Unit of Measure': 'kg',
        'Cost Per Unit (INR)': 110,
        'Min Safety Threshold': 15,
        'Storage Location': 'Dry Pantry 2',
        'Batch Number': 'BCH-RICE-2026',
        'Expiry Date (YYYY-MM-DD)': '2027-04-15',
      },
      {
        'Ingredient Name': 'Fresh Cow Milk (Amul)',
        Category: 'Dairy',
        'Current Stock': 20,
        'Unit of Measure': 'L',
        'Cost Per Unit (INR)': 62,
        'Min Safety Threshold': 8,
        'Storage Location': 'Walk-in Chiller',
        'Batch Number': 'BCH-MILK-108',
        'Expiry Date (YYYY-MM-DD)': '2026-11-05',
      },
    ],
  },
  suppliers: {
    title: 'Import Supplier Directory',
    sampleFileName: 'stockmate_suppliers_template.xlsx',
    columns: [
      { key: 'name', label: 'Supplier Company Name', required: true, aliases: ['supplier company name', 'supplier name', 'company', 'vendor', 'name'] },
      { key: 'contactPerson', label: 'Contact Person', required: true, aliases: ['contact person', 'contact', 'representative', 'spoc'] },
      { key: 'email', label: 'Work Email Address', required: true, type: 'email', aliases: ['work email address', 'email', 'email address', 'mail'] },
      { key: 'phone', label: 'Contact Phone Number', required: true, aliases: ['contact phone number', 'phone', 'mobile', 'contact number'] },
      { key: 'address', label: 'Business Address', required: false, aliases: ['business address', 'address', 'location', 'city'] },
      { key: 'leadTimeDays', label: 'Delivery Lead Time (Days)', required: false, type: 'number', aliases: ['delivery lead time (days)', 'lead time (days)', 'lead time', 'delivery days'] },
      { key: 'paymentTerms', label: 'Payment Terms', required: false, aliases: ['payment terms', 'terms', 'credit terms'] },
      { key: 'categories', label: 'Supplied Categories', required: false, aliases: ['supplied categories', 'categories', 'category'] },
    ],
    sampleRows: [
      {
        'Supplier Company Name': 'Kisan Fresh Organics Pvt Ltd',
        'Contact Person': 'Ramesh Patil',
        'Work Email Address': 'ramesh@kisanfresh.in',
        'Contact Phone Number': '+91 98221 44556',
        'Business Address': 'Market Yard Gate 4, Gultekdi, Pune, MH 411037',
        'Delivery Lead Time (Days)': 1,
        'Payment Terms': 'Net 15',
        'Supplied Categories': 'Produce, Dairy',
      },
      {
        'Supplier Company Name': 'Royal Spice Importers',
        'Contact Person': 'Sunil Mehta',
        'Work Email Address': 'sunil@royalspices.com',
        'Contact Phone Number': '+91 98220 33221',
        'Business Address': 'APMC Market Phase 2, Vashi, Navi Mumbai, MH 400703',
        'Delivery Lead Time (Days)': 3,
        'Payment Terms': 'Net 30',
        'Supplied Categories': 'Spices, Dry Goods',
      },
    ],
  },
  staff: {
    title: 'Import Restaurant Staff Roster',
    sampleFileName: 'stockmate_staff_template.xlsx',
    columns: [
      { key: 'name', label: 'Employee Full Name', required: true, aliases: ['employee full name', 'full name', 'name', 'staff name'] },
      { key: 'email', label: 'Email Address', required: true, type: 'email', aliases: ['email address', 'email', 'work email'] },
      { key: 'phone', label: 'Phone Number', required: true, aliases: ['phone number', 'phone', 'mobile'] },
      { key: 'roleLabel', label: 'Role / Designation', required: true, aliases: ['role / designation', 'role', 'designation', 'position', 'job title'] },
      { key: 'department', label: 'Department', required: false, aliases: ['department', 'dept', 'team'] },
      { key: 'baseSalary', label: 'Monthly Base Salary (INR)', required: false, type: 'number', aliases: ['monthly base salary (inr)', 'base salary', 'salary', 'monthly pay'] },
      { key: 'bankAccount', label: 'Bank Details', required: false, aliases: ['bank details', 'bank account', 'account number'] },
    ],
    sampleRows: [
      {
        'Employee Full Name': 'Sunil Gavaskar',
        'Email Address': 'sunil.g@spicegarden.com',
        'Phone Number': '+91 98220 88990',
        'Role / Designation': 'Sous Chef',
        Department: 'Kitchen',
        'Monthly Base Salary (INR)': 32000,
        'Bank Details': 'HDFC Bank •••• 4410',
      },
      {
        'Employee Full Name': 'Meera Joshi',
        'Email Address': 'meera.j@spicegarden.com',
        'Phone Number': '+91 98220 11442',
        'Role / Designation': 'Inventory Assistant',
        Department: 'Store',
        'Monthly Base Salary (INR)': 24000,
        'Bank Details': 'ICICI Bank •••• 9921',
      },
    ],
  },
};

export const ExcelImportDialog = ({
  isOpen,
  onClose,
  moduleType = 'inventory', // 'inventory' | 'suppliers' | 'staff'
  existingRecords = [],
  onImportConfirm,
  targetBranchName = 'Current Branch',
}) => {
  const schema = MODULE_SCHEMAS[moduleType] || MODULE_SCHEMAS.inventory;
  const fileInputRef = useRef(null);

  const [step, setStep] = useState('upload'); // 'upload' | 'preview' | 'success'
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [previewFilter, setPreviewFilter] = useState('all'); // 'all' | 'valid' | 'invalid'
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  if (!isOpen) return null;

  // Generate and download a sample template
  const handleDownloadSample = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(schema.sampleRows);

    // Auto-fit column widths
    const cols = Object.keys(schema.sampleRows[0] || {}).map((header) => ({
      wch: Math.max(header.length + 4, 16),
    }));
    ws['!cols'] = cols;

    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, schema.sampleFileName);
  };

  // Find schema field matching file header
  const mapHeaderToField = (rawHeader) => {
    const clean = String(rawHeader || '').trim().toLowerCase();
    for (const col of schema.columns) {
      if (col.key.toLowerCase() === clean) return col.key;
      if (col.label.toLowerCase() === clean) return col.key;
      if (col.aliases && col.aliases.some((a) => a.toLowerCase() === clean)) {
        return col.key;
      }
    }
    return null;
  };

  // Validate single row against schema and existing records
  const validateRow = (rowData, rowIndex, allParsed) => {
    const errors = [];
    const warnings = [];

    // Check required fields
    schema.columns.forEach((col) => {
      const val = rowData[col.key];
      const isMissing = val === undefined || val === null || String(val).trim() === '';

      if (col.required && isMissing) {
        errors.push(`Missing required field: "${col.label}"`);
      } else if (!isMissing) {
        // Type validations
        if (col.type === 'number') {
          const num = Number(val);
          if (isNaN(num)) {
            errors.push(`"${col.label}" must be a valid number`);
          } else if (num < 0) {
            errors.push(`"${col.label}" cannot be negative`);
          } else if (col.key === 'costPerUnit' && num <= 0) {
            errors.push(`Unit cost must be greater than ₹0`);
          }
        } else if (col.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(val).trim())) {
            errors.push(`Invalid email address format`);
          }
        }
      }
    });

    // Check duplicate against existing DB records
    if (moduleType === 'inventory' && rowData.name) {
      const exists = existingRecords.some(
        (r) => (r.name || '').trim().toLowerCase() === rowData.name.trim().toLowerCase()
      );
      if (exists) {
        warnings.push(`Item with name "${rowData.name}" already exists in inventory.`);
      }
    } else if (moduleType === 'suppliers') {
      if (rowData.email) {
        const emailExists = existingRecords.some(
          (r) => (r.email || '').trim().toLowerCase() === rowData.email.trim().toLowerCase()
        );
        if (emailExists) {
          warnings.push(`Supplier with email "${rowData.email}" is already registered.`);
        }
      }
      if (rowData.name) {
        const nameExists = existingRecords.some(
          (r) => (r.name || '').trim().toLowerCase() === rowData.name.trim().toLowerCase()
        );
        if (nameExists) {
          warnings.push(`Supplier "${rowData.name}" already exists.`);
        }
      }
    } else if (moduleType === 'staff') {
      if (rowData.email) {
        const emailExists = existingRecords.some(
          (r) => (r.email || '').trim().toLowerCase() === rowData.email.trim().toLowerCase()
        );
        if (emailExists) {
          warnings.push(`Staff member with email "${rowData.email}" is already registered.`);
        }
      }
    }

    // Check duplicate within the uploaded file itself
    const duplicateInFile = allParsed.slice(0, rowIndex).some((prev) => {
      if (moduleType === 'inventory') {
        return (prev.name || '').trim().toLowerCase() === (rowData.name || '').trim().toLowerCase();
      }
      if (moduleType === 'suppliers' || moduleType === 'staff') {
        return (prev.email || '').trim().toLowerCase() === (rowData.email || '').trim().toLowerCase();
      }
      return false;
    });

    if (duplicateInFile) {
      warnings.push(`Duplicate row within uploaded file.`);
    }

    return {
      isValid: errors.length === 0,
      isDuplicate: warnings.length > 0,
      errors,
      warnings,
    };
  };

  // Parse uploaded file
  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const buffer = evt.target.result;
        const wb = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];

        // Parse raw JSON rows
        const rawJson = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          alert('Uploaded file is empty. Please upload an Excel or CSV file containing records.');
          return;
        }

        // Map column headers
        const normalized = rawJson.map((row) => {
          const item = {};
          Object.entries(row).forEach(([rawKey, val]) => {
            const fieldKey = mapHeaderToField(rawKey);
            if (fieldKey) {
              item[fieldKey] = typeof val === 'string' ? val.trim() : val;
            }
          });
          return item;
        });

        // Validate each row
        const validated = normalized.map((item, idx) => {
          const valRes = validateRow(item, idx, normalized);
          return {
            rowNumber: idx + 2, // Excel row index
            data: item,
            ...valRes,
          };
        });

        setParsedRows(validated);
        setStep('preview');
      } catch (err) {
        console.error('File parse error:', err);
        alert('Failed to parse spreadsheet. Please ensure the file is a valid .xlsx or .csv document.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Filtered rows for preview
  const displayRows = parsedRows.filter((r) => {
    if (previewFilter === 'valid') return r.isValid && (!skipDuplicates || !r.isDuplicate);
    if (previewFilter === 'invalid') return !r.isValid || (skipDuplicates && r.isDuplicate);
    return true;
  });

  const validRowCount = parsedRows.filter(
    (r) => r.isValid && (!skipDuplicates || !r.isDuplicate)
  ).length;
  const errorRowCount = parsedRows.filter((r) => !r.isValid).length;
  const duplicateCount = parsedRows.filter((r) => r.isDuplicate).length;

  // Confirm import
  const handleConfirmImport = async () => {
    const rowsToImport = parsedRows
      .filter((r) => r.isValid && (!skipDuplicates || !r.isDuplicate))
      .map((r) => r.data);

    if (rowsToImport.length === 0) return;

    setIsProcessing(true);
    try {
      if (onImportConfirm) {
        await onImportConfirm(rowsToImport);
      }
      setImportedCount(rowsToImport.length);
      setStep('success');
    } catch (err) {
      console.error('Import error:', err);
      alert('An error occurred while importing records. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setStep('upload');
    setFileName('');
    setParsedRows([]);
    setPreviewFilter('all');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-400 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {schema.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bulk import from Excel (.xlsx) or CSV into {targetBranchName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Template Download Prompt */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                      Need the standard format?
                    </h4>
                    <p className="text-xs text-emerald-800/80 dark:text-emerald-400">
                      Download our pre-configured template with sample data and column headers.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  icon={Download}
                  onClick={handleDownloadSample}
                  className="bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 shrink-0"
                >
                  Download Template
                </Button>
              </div>

              {/* Upload Drag & Drop Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-600 dark:hover:border-emerald-500 rounded-3xl p-10 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-850/50 hover:bg-emerald-50/20"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto mb-4">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Click to select or drag and drop spreadsheet here
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Supports Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv)
                </p>
                <span className="inline-block px-3 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Files are validated automatically before saving
                </span>
              </div>

              {/* Expected Schema Guidelines */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/30 dark:bg-slate-900/30">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Recognized Spreadsheet Columns
                </span>
                <div className="flex flex-wrap gap-2">
                  {schema.columns.map((c) => (
                    <span
                      key={c.key}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                        c.required
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {c.label} {c.required && <span className="text-rose-500 font-bold">*</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              {/* File & Validation Summary Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-center">
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    {parsedRows.length}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">Total Rows</div>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                  <div className="text-lg font-black text-emerald-800 dark:text-emerald-300">
                    {validRowCount}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    Ready to Import
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
                  <div className="text-lg font-black text-amber-800 dark:text-amber-300">
                    {duplicateCount}
                  </div>
                  <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                    Duplicates
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center">
                  <div className="text-lg font-black text-rose-800 dark:text-rose-300">
                    {errorRowCount}
                  </div>
                  <div className="text-[11px] font-semibold text-rose-700 dark:text-rose-400">
                    Invalid Rows
                  </div>
                </div>
              </div>

              {/* Controls: Skip Duplicates & Preview Filter */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700 border-slate-300 dark:border-slate-700"
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Skip duplicate records ({duplicateCount}) to avoid unintended overwrites
                  </span>
                </label>

                {/* Filter buttons */}
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      previewFilter === 'all'
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    All ({parsedRows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('valid')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      previewFilter === 'valid'
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Valid Only ({validRowCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFilter('invalid')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      previewFilter === 'invalid'
                        ? 'bg-rose-700 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Issues ({errorRowCount + (skipDuplicates ? duplicateCount : 0)})
                  </button>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl max-h-72">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold sticky top-0 z-10">
                    <tr>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700 w-14">Row</th>
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700 w-24">Status</th>
                      {schema.columns.slice(0, 4).map((c) => (
                        <th key={c.key} className="p-3 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                          {c.label}
                        </th>
                      ))}
                      <th className="p-3 border-b border-slate-200 dark:border-slate-700">Validation Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {displayRows.map((r) => {
                      const willBeImported = r.isValid && (!skipDuplicates || !r.isDuplicate);
                      return (
                        <tr
                          key={r.rowNumber}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-850/60 ${
                            !willBeImported ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                          }`}
                        >
                          <td className="p-3 font-mono text-slate-400">{r.rowNumber}</td>
                          <td className="p-3 whitespace-nowrap">
                            {!r.isValid ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                                <AlertCircle className="w-3 h-3" /> Error
                              </span>
                            ) : r.isDuplicate ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                                <AlertTriangle className="w-3 h-3" /> Duplicate
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                                <CheckCircle2 className="w-3 h-3" /> Valid
                              </span>
                            )}
                          </td>
                          {schema.columns.slice(0, 4).map((c) => (
                            <td key={c.key} className="p-3 whitespace-nowrap font-medium">
                              {c.type === 'number' && c.key === 'costPerUnit'
                                ? formatCurrency(r.data[c.key])
                                : String(r.data[c.key] || '—')}
                            </td>
                          ))}
                          <td className="p-3 text-xs">
                            {r.errors.length > 0 && (
                              <span className="text-rose-600 dark:text-rose-400 font-medium">
                                {r.errors.join(' • ')}
                              </span>
                            )}
                            {r.warnings.length > 0 && (
                              <span className="text-amber-700 dark:text-amber-400 font-medium">
                                {r.warnings.join(' • ')}
                              </span>
                            )}
                            {r.errors.length === 0 && r.warnings.length === 0 && (
                              <span className="text-emerald-700 dark:text-emerald-400">All checks passed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Import Completed Successfully!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Successfully imported <strong className="text-emerald-700 dark:text-emerald-400">{importedCount}</strong> new records into{' '}
                <strong>{targetBranchName}</strong>. All tables and reports have been refreshed.
              </p>
              <div className="pt-4">
                <Button variant="brand" size="sm" onClick={onClose}>
                  Done &amp; View Records
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'success' && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
            {step === 'upload' ? (
              <>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <div className="text-xs text-slate-400">
                  Select a spreadsheet above to proceed
                </div>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" icon={RefreshCw} onClick={resetAll}>
                  Upload Different File
                </Button>

                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    variant="brand"
                    size="sm"
                    icon={Check}
                    onClick={handleConfirmImport}
                    disabled={validRowCount === 0 || isProcessing}
                  >
                    {isProcessing
                      ? 'Importing...'
                      : `Import ${validRowCount} Record${validRowCount !== 1 ? 's' : ''}`}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

