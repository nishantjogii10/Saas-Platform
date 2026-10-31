import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Clock,
  IndianRupee,
  Save,
  CheckCircle2,
  Store,
  ShieldCheck,
  CreditCard,
  Sparkles,
  Receipt,
  Printer,
  Eye,
  Globe,
  Handshake,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { FormInput } from '../../components/common/FormInput';
import { Modal } from '../../components/common/Modal';
import { formatINR } from '../../data/inventoryBillingData';
import { SUPPLIER_SUBSCRIPTION_PLANS } from '../../data/supplierMarketplaceData';

export const SupplierProfilePage = () => {
  const { suppliers, currentUser, restaurants, supplierPlanPayments, addToast } = useApp();
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const currentSup =
    suppliers.find((s) => s.id === currentUser?.supplierId || s.name === currentUser?.supplierName || (currentUser?.email && s.email?.toLowerCase() === currentUser.email.toLowerCase())) ||
    {
      id: currentUser?.supplierId || 'sup-active',
      name: currentUser?.supplierName || currentUser?.name || 'Vendor Partner',
      supplierType: currentUser?.supplierType || (currentUser?.registeredVia === 'main_system' ? 'Tie-up Supplier' : 'Third-Party Supplier'),
      registeredVia: currentUser?.registeredVia || 'main_system',
      contactPerson: currentUser?.name || 'Partner',
      email: currentUser?.email || 'vendor@supplier.com',
      phone: '+91 98000 00000',
      address: 'Central Logistics Hub, Sector 4, Pune',
      leadTimeDays: 1,
      paymentTerms: 'Net 14',
    };

  const actualSupplierType =
    currentSup?.supplierType ||
    currentUser?.supplierType ||
    (currentSup?.registeredVia === 'main_system' || currentUser?.registeredVia === 'main_system' || currentSup?.id === 'sup-4' || currentSup?.id === 'sup-5'
      ? 'Tie-up Supplier'
      : 'Third-Party Supplier');
  const isTieUp = actualSupplierType === 'Tie-up Supplier';

  const [formData, setFormData] = useState({
    name: currentSup?.name || '',
    contactPerson: currentSup?.contactPerson || currentUser.name,
    email: currentSup?.email || currentUser.email,
    phone: currentSup?.phone || '+1 (800) 555-0199',
    address: currentSup?.address || '880 Logistics Parkway, Secaucus, NJ',
    leadTimeDays: currentSup?.leadTimeDays || 1,
    paymentTerms: currentSup?.paymentTerms || 'Net 30',
  });

  const handleSave = (e) => {
    e.preventDefault();
    addToast('Supplier vendor profile updated successfully.', 'success');
  };

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Supplier Vendor Profile"
        subtitle="Manage dispatch contact details, catalog categories, and payment agreements"
        breadcrumbs={[
          { label: 'Supplier', href: '#/supplier' },
          { label: 'Supplier Profile' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8">
          <Card>
            <CardHeader
              title="Company & Contact Information"
              subtitle="Details shared with restaurant clients on purchase orders"
              icon={Building}
            />
            <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Supplier Classification:</span>
                <span className="font-semibold text-slate-800">
                  {isTieUp
                    ? 'Onboarded via Main System (Corporate Tie-up Partner)'
                    : 'Registered via External B2B Supplier Portal'}
                </span>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs ${
                isTieUp
                  ? 'bg-teal-100 text-teal-800 border border-teal-300'
                  : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
              }`}>
                {isTieUp ? <Handshake className="w-3.5 h-3.5 text-teal-600" /> : <Globe className="w-3.5 h-3.5 text-indigo-600" />}
                <span>{actualSupplierType}</span>
              </span>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <FormInput
                label="Company Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Dispatch Rep Name"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  required
                />

                <FormInput
                  label="Order Intake Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Direct Phone Line"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />

                <FormInput
                  label="Standard Lead Time (Days)"
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
                required
              />

              <Button type="submit" variant="brand" size="sm" icon={Save}>
                Save Profile Changes
              </Button>
            </form>
          </Card>
        </div>

        {/* Right: Partner Restaurants & Active Plan */}
        <div className="md:col-span-4 space-y-5">
          {/* Active Subscription Tier Details */}
          <Card>
            <CardHeader
              title="Supplier Service Plan"
              subtitle="Wholesale tier and platform commission"
              icon={CreditCard}
            />
            {(() => {
              const activePlan =
                SUPPLIER_SUBSCRIPTION_PLANS.find((p) => p.name === currentSup?.planName) ||
                SUPPLIER_SUBSCRIPTION_PLANS[1];
              return (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-slate-900 text-white">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">{activePlan.name}</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                        {activePlan.badge}
                      </span>
                    </div>
                    <div className="text-lg font-black mt-1">
                      {activePlan.price === 0 ? 'Free Starter' : `₹${activePlan.price} / mo`}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">{activePlan.description}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Platform Commission:</span>
                      <strong className="text-emerald-700">{activePlan.commissionRate}% per PO</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bank Payout SLA:</span>
                      <strong className="text-slate-800">{activePlan.payoutDays}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Product SKU Capacity:</span>
                      <strong className="text-slate-800">{activePlan.maxProducts} SKUs</strong>
                    </div>
                  </div>
                </div>
              );
            })()}
          </Card>

          {/* Subscription Payment History Card */}
          <Card>
            <CardHeader
              title="Plan Payment History"
              subtitle="Receipts and transactions for platform service plans"
              icon={Receipt}
            />
            {(() => {
              const myPayments = (supplierPlanPayments || []).filter(
                (p) =>
                  (currentSup?.id && p.supplierId === currentSup.id) ||
                  (currentSup?.name && p.supplierName?.toLowerCase() === currentSup.name?.toLowerCase()) ||
                  (currentUser?.supplierName && p.supplierName?.toLowerCase() === currentUser.supplierName?.toLowerCase())
              );

              return (
                <div className="space-y-3">
                  {myPayments.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between hover:bg-slate-100/70 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span>{p.invoiceNumber}</span>
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                            {p.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {p.paymentDate} • {p.planName}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                          {p.referenceNumber}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="font-bold text-emerald-800 text-sm">
                          {p.amount === 0 ? '₹0' : formatINR(p.amount)}
                        </span>
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Eye}
                          className="text-slate-600 hover:text-emerald-700"
                          onClick={() => setSelectedReceipt(p)}
                        >
                          Receipt
                        </Button>
                      </div>
                    </div>
                  ))}

                  {myPayments.length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-400 italic">
                      No subscription payments found for this supplier account.
                    </div>
                  )}
                </div>
              );
            })()}
          </Card>

          <Card>
            <CardHeader
              title="Active Restaurant Partners"
              subtitle="Clients with active vendor contracts"
              icon={Store}
            />
            <div className="space-y-3">
              {restaurants.filter(r => r.status === 'active').map((r) => (
                <div key={r.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span>{r.logo || '🍽️'}</span>
                    <span>{r.name}</span>
                  </div>
                  <p className="text-slate-500 mt-1">{r.cuisine}</p>
                  <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                    Terms: {formData.paymentTerms}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Individual Plan Invoice Receipt Modal */}
      <Modal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        title={`Tax Invoice: ${selectedReceipt?.invoiceNumber || ''}`}
        subtitle="Platform Subscription Tax Receipt"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print Receipt
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setSelectedReceipt(null)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedReceipt && (
          <div className="space-y-4 p-1">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  Official B2B Subscription Invoice
                </span>
                <h4 className="text-lg font-black">{selectedReceipt.planName}</h4>
                <div className="text-xs text-slate-300 mt-0.5">
                  Invoice Ref: {selectedReceipt.invoiceNumber}
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {selectedReceipt.status}
                </span>
                <div className="text-xl font-black mt-2">
                  {selectedReceipt.amount === 0 ? '₹0' : formatINR(selectedReceipt.amount)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[11px]">Billed To:</span>
                <strong className="text-slate-800 text-sm">{selectedReceipt.supplierName}</strong>
                <div className="text-slate-500 mt-0.5">Supplier ID: {selectedReceipt.supplierId}</div>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Issued By:</span>
                <strong className="text-slate-800 text-sm">StockMate SaaS Procurement</strong>
                <div className="text-slate-500 mt-0.5">GSTIN: 27AABCU9603R1ZM</div>
              </div>
            </div>

            <div className="space-y-2 text-xs border border-slate-200 rounded-xl p-3">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Date:</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.paymentDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono text-slate-800">{selectedReceipt.transactionId || 'TXN-98214'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">UTR / Reference:</span>
                <span className="font-mono text-emerald-700 font-bold">{selectedReceipt.referenceNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Next Renewal Date:</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.nextBillingDate || '2026-11-15'}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

