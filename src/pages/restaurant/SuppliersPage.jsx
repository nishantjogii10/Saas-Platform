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
    addSupplier,
    updateSupplier,
    deleteSupplier,
    currentUser,
    currentBranch,
    importSuppliersBulk,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
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
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    leadTimeDays: 1,
    paymentTerms: 'Net 30',
    categories: ['Dairy', 'Produce'],
  });

  const filteredSuppliers = restaurantSuppliers.filter((s) => {
    return (
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      leadTimeDays: 1,
      paymentTerms: 'Net 30',
      categories: ['Produce'],
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setSelectedSupplier(sup);
    setFormData({
      name: sup.name,
      contactPerson: sup.contactPerson,
      email: sup.email,
      phone: sup.phone,
      address: sup.address,
      leadTimeDays: sup.leadTimeDays,
      paymentTerms: sup.paymentTerms,
      categories: sup.categories,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    addSupplier(formData);
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
        title="Vendor & Supplier Catalog"
        subtitle="Manage food purveyors, lead times, contact channels, and dispatch agreements"
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

            {currentUser.role !== 'kitchen_staff' && currentUser.role !== 'supplier' && (
              <Button
                variant="outline"
                size="sm"
                icon={UploadCloud}
                onClick={() => setIsImportOpen(true)}
              >
                Import Excel
              </Button>
            )}

            {currentUser.role !== 'kitchen_staff' && (
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

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search suppliers by company name, contact, or email..."
          className="w-full sm:w-80"
        />
        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Showing {filteredSuppliers.length} suppliers
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
            {
              header: 'Supplied Categories',
              accessor: 'categories',
              render: (row) => (
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(row.categories) ? row.categories : [row.categories]).map((cat, idx) => (
                    <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {cat}
                    </span>
                  ))}
                </div>
              ),
            },
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
            {
              header: 'Actions',
              accessor: 'id',
              render: (sup) => (
                <div className="flex items-center gap-1.5">
                  {currentUser?.role !== 'restaurant_owner' && (
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
                  )}
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
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">{sup.name}</h3>
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

                    {currentUser.role !== 'kitchen_staff' && (
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

                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-850/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
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

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {activeOrders.length} active order{activeOrders.length !== 1 ? 's' : ''} in pipeline
                  </span>

                  {currentUser?.role !== 'restaurant_owner' && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={ShoppingBag}
                      onClick={() => navigate(`/purchase-orders?action=create&supplierId=${sup.id}`)}
                    >
                      Create PO
                    </Button>
                  )}
                </div>
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

