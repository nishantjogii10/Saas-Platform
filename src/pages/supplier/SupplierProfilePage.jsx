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
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { FormInput } from '../../components/common/FormInput';

export const SupplierProfilePage = () => {
  const { suppliers, currentUser, restaurants, addToast } = useApp();

  const currentSup =
    suppliers.find((s) => s.id === (currentUser.supplierId || 'sup-1')) ||
    suppliers[0];

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
    <div className="space-y-6 max-w-4xl mx-auto">
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

        {/* Right: Partner Restaurants */}
        <div className="md:col-span-4 space-y-5">
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
    </div>
  );
};

