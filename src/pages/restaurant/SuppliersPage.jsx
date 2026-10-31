import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Truck,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Star,
  Clock,
  ShoppingBag,
  Edit3,
  Trash2,
  ExternalLink,
  Globe,
  Handshake,
  Filter,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Check,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchBar } from '../../components/common/SearchBar';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { FormInput } from '../../components/common/FormInput';
import { DataTable } from '../../components/common/DataTable';
import { ColumnExportDialog } from '../../components/common/ColumnExportDialog';
import { ExcelImportDialog } from '../../components/common/ExcelImportDialog';
import { Download, UploadCloud, Table, LayoutGrid } from 'lucide-react';

export const SuppliersPage = () => {
  const navigate = useNavigate();
  const {
    restaurantSuppliers,
    restaurantOrders,
    supplierAgreements,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    currentUser,
    currentBranch,
    importSuppliersBulk,
  } = useApp();

  const isOwner = currentUser?.role === 'restaurant_owner';

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'third-party' | 'tie-up'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    supplierType: 'Tie-up Supplier',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    leadTimeDays: 1,
    paymentTerms: 'Net 30',
    categories: ['Dairy', 'Produce'],
    acceptsReturns: true,
    returnConditions: {
      unused: true,
      damaged: true,
      spoiled: true,
    },
    returnWindowHours: 36,
    maxReturnPercent: 20,
    settlementMode: 'Credit Note',
    returnPolicyNotes: 'Accepts returns for unused stock, damaged lots, or spoiled goods within 36 hours.',
  });

  const getSupplierType = (sup) => {
    if (sup.supplierType) return sup.supplierType;
    if (
      sup.registeredVia === 'main_system' ||
      sup.id === 'sup-4' ||
      sup.id === 'sup-5' ||
      sup.name?.toLowerCase().includes('golden crust') ||
      sup.name?.toLowerCase().includes('amrit dairy')
    ) {
      return 'Tie-up Supplier';
    }
    if (
      sup.registeredVia === 'supplier_portal' ||
      sup.isFirstTimePortalRegistration ||
      sup.id === 'sup-1' ||
      sup.id === 'sup-2' ||
      sup.id === 'sup-3' ||
      sup.id === 'sup-6' ||
      sup.id === 'sup-diksha' ||
      sup.name?.toLowerCase().includes('metro food') ||
      sup.name?.toLowerCase().includes('freshfarm') ||
      sup.name?.toLowerCase().includes('royal spice') ||
      sup.name?.toLowerCase().includes('ocean crest') ||
      sup.name?.toLowerCase().includes('diksha')
    ) {
      return 'Third-Party Supplier';
    }
    return 'Tie-up Supplier';
  };

  const thirdPartyCount = (restaurantSuppliers || []).filter(
    (s) => getSupplierType(s) === 'Third-Party Supplier'
  ).length;

  const tieUpCount = (restaurantSuppliers || []).filter(
    (s) => getSupplierType(s) === 'Tie-up Supplier'
  ).length;

  const filteredSuppliers = restaurantSuppliers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());

    const actualType = getSupplierType(s);
    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'third-party' && actualType === 'Third-Party Supplier') ||
      (typeFilter === 'tie-up' && actualType === 'Tie-up Supplier');

    return matchesSearch && matchesType;
  });

  const renderSupplierTypeBadge = (sup) => {
    const isTieUp = getSupplierType(sup) === 'Tie-up Supplier';
    if (isTieUp) {
      return (
        <div className="flex flex-col items-start gap-0.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shadow-2xs">
            <Handshake className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Tie-up Supplier</span>
          </span>
          <span className="text-[10px] text-teal-700/80 dark:text-teal-400/80 font-medium">
            Added via Main System
          </span>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-start gap-0.5">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs">
          <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Third-Party Supplier</span>
        </span>
        <span className="text-[10px] text-indigo-700/80 dark:text-indigo-400/80 font-medium">
          Registered via Supplier Portal
        </span>
      </div>
    );
  };

  const renderReturnPolicyBadge = (sup) => {
    const agreement = (supplierAgreements || []).find((a) => a.supplierId === sup.id);
    const accepts =
      sup.acceptsReturns !== undefined
        ? sup.acceptsReturns
        : agreement
        ? Boolean(agreement.acceptsReturns ?? agreement.unsoldReturnAllowed)
        : sup.id !== 'sup-1' && sup.id !== 'sup-3' && sup.id !== 'sup-6';

    const unused = sup.returnConditions?.unused ?? agreement?.coversUnused ?? agreement?.unsoldReturnAllowed ?? true;
    const damaged = sup.returnConditions?.damaged ?? agreement?.coversDamaged ?? true;
    const spoiled = sup.returnConditions?.spoiled ?? agreement?.coversSpoiled ?? true;
    const conditions = [unused && 'Unused', damaged && 'Damaged', spoiled && 'Spoiled'].filter(Boolean).join(', ');
    const windowHours = sup.returnWindowHours || agreement?.returnWindowHours || 36;

    if (accepts) {
      return (
        <div className="flex flex-col items-start gap-0.5">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 shadow-2xs"
            title={`Returns accepted for: ${conditions || 'Unused, damaged, or spoiled products'} within ${windowHours}h`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Returns Accepted</span>
          </span>
          <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 font-medium">
            {conditions ? `Covers: ${conditions} (${windowHours}h)` : `SLA Window: ${windowHours}h`}
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-start gap-0.5">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 shadow-2xs"
          title="Strict No-Returns Policy - All sales final upon dock inspection"
        >
          <XCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
          <span>No Returns</span>
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          Final Sale Only
        </span>
      </div>
    );
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      supplierType: 'Tie-up Supplier',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      leadTimeDays: 1,
      paymentTerms: 'Net 30',
      categories: ['Produce'],
      acceptsReturns: true,
      returnConditions: {
        unused: true,
        damaged: true,
        spoiled: true,
      },
      returnWindowHours: 36,
      maxReturnPercent: 20,
      settlementMode: 'Credit Note',
      returnPolicyNotes: 'Accepts returns for unused stock, damaged lots, or spoiled goods within 36 hours.',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setSelectedSupplier(sup);
    const agr = (supplierAgreements || []).find((a) => a.supplierId === sup.id);
    const accepts = sup.acceptsReturns !== undefined
      ? sup.acceptsReturns
      : agr
      ? Boolean(agr.acceptsReturns ?? agr.unsoldReturnAllowed)
      : true;

    setFormData({
      name: sup.name,
      supplierType: getSupplierType(sup),
      contactPerson: sup.contactPerson,
      email: sup.email,
      phone: sup.phone,
      address: sup.address,
      leadTimeDays: sup.leadTimeDays,
      paymentTerms: sup.paymentTerms,
      categories: sup.categories,
      acceptsReturns: accepts,
      returnConditions: sup.returnConditions || agr?.returnConditions || {
        unused: agr?.coversUnused ?? agr?.unsoldReturnAllowed ?? true,
        damaged: agr?.coversDamaged ?? true,
        spoiled: agr?.coversSpoiled ?? true,
      },
      returnWindowHours: sup.returnWindowHours || agr?.returnWindowHours || 36,
      maxReturnPercent: sup.maxReturnPercent || agr?.maxReturnPercent || 20,
      settlementMode: sup.settlementMode || agr?.settlementMode || 'Credit Note',
      returnPolicyNotes: sup.returnPolicyNotes || agr?.agreementNotes || 'Accepts returns for unused stock, damaged lots, or spoiled goods within 36 hours.',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    addSupplier({
      ...formData,
      supplierType: formData.supplierType || 'Tie-up Supplier',
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (selectedSupplier) {
      updateSupplier(selectedSupplier.id, formData);
      setIsEditModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isOwner ? "Supplier List" : "Vendor & Supplier Catalog"}
        subtitle={
          isOwner
            ? "Directory of verified Third-Party and Tie-up suppliers supplying ingredients"
            : "Manage food purveyors, lead times, contact channels, and dispatch agreements"
        }
        breadcrumbs={[
          { label: 'Restaurant', href: '#/dashboard' },
          { label: 'Suppliers' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                title="Table View"
              >
                <Table className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() => setIsExportOpen(true)}
            >
              Export to Excel
            </Button>

            {currentUser.role !== 'kitchen_staff' && currentUser.role !== 'supplier' && !isOwner && (
              <Button
                variant="outline"
                size="sm"
                icon={UploadCloud}
                onClick={() => setIsImportOpen(true)}
              >
                Import Excel
              </Button>
            )}

            {currentUser.role !== 'kitchen_staff' && !isOwner && (
              <Button
                variant="brand"
                size="sm"
                icon={Plus}
                onClick={handleOpenAdd}
              >
                Add New Supplier
              </Button>
            )}
          </div>
        }
      />

      {/* Quick Supplier Classification Filter Tabs & Explainer Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                typeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <span>All Suppliers</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                typeFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {restaurantSuppliers.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter('third-party')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                typeFilter === 'third-party'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Third-Party Suppliers</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                typeFilter === 'third-party' ? 'bg-indigo-800 text-white' : 'bg-indigo-200 text-indigo-900'
              }`}>
                {thirdPartyCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter('tie-up')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                typeFilter === 'tie-up'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-teal-50 text-teal-700 border border-teal-200/60 hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800'
              }`}
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>Tie-up Suppliers</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                typeFilter === 'tie-up' ? 'bg-teal-800 text-white' : 'bg-teal-200 text-teal-900'
              }`}>
                {tieUpCount}
              </span>
            </button>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredSuppliers.length} of {restaurantSuppliers.length} suppliers
          </span>
        </div>

        {/* Informative Guidance Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-indigo-50/60 border border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/40 text-indigo-950 dark:text-indigo-200">
            <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <strong className="font-bold text-indigo-900 dark:text-indigo-100">Third-Party Suppliers:</strong> Independent vendors who self-register and log in via the external Supplier Portal.
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-teal-50/60 border border-teal-100 dark:bg-teal-950/30 dark:border-teal-900/40 text-teal-950 dark:text-teal-200">
            <Handshake className="w-4 h-4 text-teal-600 shrink-0" />
            <div>
              <strong className="font-bold text-teal-900 dark:text-teal-100">Tie-up Suppliers:</strong> Internal partner vendors added through the main system dashboard or accessed via the main system login.
            </div>
          </div>
        </div>
      </div>

      {/* Search & Secondary Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search suppliers by company, contact, email..."
            className="w-full sm:w-72"
          />
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">All Supplier Types ({restaurantSuppliers.length})</option>
              <option value="third-party">Third-Party Suppliers ({thirdPartyCount})</option>
              <option value="tie-up">Tie-up Suppliers ({tieUpCount})</option>
            </select>
          </div>
        </div>
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Filtered count: {filteredSuppliers.length} records
        </span>
      </div>

      {/* Table vs Grid View */}
      {viewMode === 'table' ? (
        <DataTable
          columns={[
            {
              header: 'Supplier / Vendor',
              accessor: 'name',
              sortable: true,
              render: (row) => (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-100 dark:border-emerald-800">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{row.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                      <span>{row.rating || 4.8}</span>
                      <span>•</span>
                      <span>{row.paymentTerms || 'Net 30'}</span>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              header: 'Supplier Type & Registration Source',
              accessor: 'supplierType',
              sortable: true,
              render: (row) => renderSupplierTypeBadge(row),
            },
            {
              header: 'Return Policy',
              accessor: 'acceptsReturns',
              sortable: true,
              render: (row) => renderReturnPolicyBadge(row),
            },
            {
              header: 'Contact Person',
              accessor: 'contactPerson',
              sortable: true,
              render: (row) => (
                <div className="text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{row.contactPerson}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{row.phone}</div>
                </div>
              ),
            },
            {
              header: 'Work Email',
              accessor: 'email',
              sortable: true,
              render: (row) => (
                <div className="text-xs text-slate-700 dark:text-slate-300 font-mono">
                  {row.email}
                </div>
              ),
            },
            ...(!isOwner
              ? [
                  {
                    header: 'Supplied Categories',
                    accessor: 'categories',
                    render: (row) => (
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(row.categories) ? row.categories : [row.categories]).map((cat, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    ),
                  },
                ]
              : []),
            {
              header: 'Lead Time',
              accessor: 'leadTimeDays',
              sortable: true,
              render: (row) => (
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {row.leadTimeDays || 1} day(s)
                </span>
              ),
            },
            ...(!isOwner
              ? [
                  {
                    header: 'Actions',
                    accessor: 'id',
                    render: (sup) => (
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={ShoppingBag}
                          title="Create Purchase Order"
                          className="text-emerald-700 hover:bg-emerald-50"
                          onClick={() => navigate(`/purchase-orders?action=create&supplierId=${sup.id}`)}
                        >
                          PO
                        </Button>
                        {currentUser.role !== 'kitchen_staff' && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(sup)}
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                              title="Edit Supplier"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setSupplierToDelete(sup);
                                setDeleteConfirmOpen(true);
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Supplier"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    ),
                  },
                ]
              : []),
          ]}
          data={filteredSuppliers}
          keyField="id"
          pageSize={10}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSuppliers.map((sup) => {
            const supplierOrders = restaurantOrders.filter(o => o.supplierId === sup.id);
            const activeOrders = supplierOrders.filter(o => o.status === 'pending' || o.status === 'accepted' || o.status === 'dispatched');

            return (
              <div
                key={sup.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-lg border border-emerald-100 dark:border-emerald-800">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-white text-base">{sup.name}</h3>
                          {renderSupplierTypeBadge(sup)}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{sup.contactPerson}</span>
                          <span>•</span>
                          <span className="inline-flex items-center text-amber-500 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                            {sup.rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    {currentUser.role !== 'kitchen_staff' && !isOwner && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(sup)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Edit Supplier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSupplierToDelete(sup);
                            setDeleteConfirmOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Supplier"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {!isOwner && sup.categories && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {sup.categories.map((cat, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-850/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-500">Return Policy SLA:</span>
                      {renderReturnPolicyBadge(sup)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{sup.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{sup.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{sup.address}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700 font-medium">
                      <span>Lead Time: <strong>{sup.leadTimeDays} day(s)</strong></span>
                      <span>Terms: <strong>{sup.paymentTerms}</strong></span>
                    </div>
                  </div>
                </div>

                {!isOwner && (
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      {activeOrders.length} active order{activeOrders.length !== 1 ? 's' : ''} in pipeline
                    </span>

                    <Button
                      variant="primary"
                      size="sm"
                      icon={ShoppingBag}
                      onClick={() => navigate(`/purchase-orders?action=create&supplierId=${sup.id}`)}
                    >
                      Create PO
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Supplier Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? 'Register New Supplier' : `Edit ${formData.name}`}
        subtitle="Manage supplier credentials and delivery agreements"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="brand"
              onClick={isAddModalOpen ? handleSaveAdd : handleSaveEdit}
            >
              {isAddModalOpen ? 'Add Supplier' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <form onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit} className="space-y-4">
          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                Supplier Classification
              </span>
              <strong className="text-sm font-extrabold text-teal-950">
                {formData.supplierType || 'Tie-up Supplier'}
              </strong>
              <p className="text-[11px] text-teal-800 mt-0.5">
                Suppliers added via the main system are automatically tagged as <strong>Tie-up Suppliers</strong>. Independent vendors registering through the external portal are tagged as <strong>Third-Party Suppliers</strong>.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-200/60 text-teal-900 border border-teal-300 shrink-0">
              Main System
            </span>
          </div>

          <FormInput
            label="Supplier Company Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Apex Meat & Poultry"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Account Rep / Contact Person"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="e.g. Liam Smith"
              required
            />

            <FormInput
              label="Contact Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. orders@apexmeat.com"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Dispatch Phone"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. +1 (800) 555-1234"
              required
            />

            <FormInput
              label="Lead Time (Days)"
              name="leadTimeDays"
              type="number"
              min="1"
              value={formData.leadTimeDays}
              onChange={(e) => setFormData({ ...formData, leadTimeDays: e.target.value })}
              required
            />
          </div>

          <FormInput
            label="Warehouse Dispatch Address"
            name="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g. 500 Industrial Pkwy, New York, NY"
            required
          />

          <FormInput
            label="Payment Terms"
            name="paymentTerms"
            type="select"
            value={formData.paymentTerms}
            onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
            options={['Due on Receipt', 'Net 15', 'Net 30', 'Net 60']}
          />

          {/* Return Policy Option */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-600" /> Return Policy Agreement
                </span>
                <span className="text-[11px] text-slate-500">
                  Allow returns if products remain unused, arrive damaged, or spoil
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, acceptsReturns: !formData.acceptsReturns })}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  formData.acceptsReturns
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {formData.acceptsReturns ? '✓ Returns Accepted' : 'No Returns'}
              </button>
            </div>

            {formData.acceptsReturns && (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                  Eligible Scenarios:
                </span>
                <div className="flex flex-wrap gap-3 text-xs">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.returnConditions?.unused ?? true}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          returnConditions: {
                            ...formData.returnConditions,
                            unused: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Unused Stock</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.returnConditions?.damaged ?? true}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          returnConditions: {
                            ...formData.returnConditions,
                            damaged: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Damaged Products</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.returnConditions?.spoiled ?? true}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          returnConditions: {
                            ...formData.returnConditions,
                            spoiled: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Spoiled Goods</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Return Window
                    </label>
                    <select
                      value={formData.returnWindowHours || 36}
                      onChange={(e) => setFormData({ ...formData, returnWindowHours: Number(e.target.value) })}
                      className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                    >
                      <option value="12">12 Hours</option>
                      <option value="24">24 Hours</option>
                      <option value="36">36 Hours</option>
                      <option value="48">48 Hours</option>
                      <option value="72">72 Hours</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Settlement Mode
                    </label>
                    <select
                      value={formData.settlementMode || 'Credit Note'}
                      onChange={(e) => setFormData({ ...formData, settlementMode: e.target.value })}
                      className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                    >
                      <option value="Credit Note">Credit Note</option>
                      <option value="Replacement Delivery">Replacement Delivery</option>
                      <option value="Direct Refund / Credit Note">Direct Refund / Credit Note</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Delete Supplier Confirm */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={() => {
          if (supplierToDelete) deleteSupplier(supplierToDelete.id);
        }}
        title={`Delete "${supplierToDelete?.name}"?`}
        message="Are you sure you want to remove this vendor record from your directory?"
        confirmText="Remove Supplier"
        type="danger"
      />

      {/* Export to Excel & Import Modals */}
      <ColumnExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        data={filteredSuppliers}
        availableColumns={[
          { key: 'name', header: 'Supplier Company Name' },
          { key: 'contactPerson', header: 'Contact Person' },
          { key: 'email', header: 'Work Email' },
          { key: 'phone', header: 'Contact Phone' },
          { key: 'address', header: 'Business Address' },
          { key: 'leadTimeDays', header: 'Lead Time (Days)' },
          { key: 'paymentTerms', header: 'Payment Terms' },
          { key: 'categories', header: 'Categories', format: (val) => Array.isArray(val) ? val.join(', ') : val },
          { key: 'rating', header: 'Rating Score' },
        ]}
        reportTitle="Supplier Directory"
        fileNamePrefix="stockmate_suppliers"
        filtersSummary={{
          Search: searchTerm || 'All Vendors',
        }}
      />

      <ExcelImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        moduleType="suppliers"
        targetBranchName={currentBranch?.name || 'Active Restaurant'}
        existingRecords={restaurantSuppliers}
        onImportConfirm={importSuppliersBulk}
      />
    </div>
  );
};

