import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { FormInput } from '../../components/common/FormInput';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building2,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  Camera,
  HeartHandshake,
  Clock,
  Sparkles,
  Save,
  Check,
} from 'lucide-react';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
];

// Helper to mask account number everywhere: e.g. "•••• 4421"
export const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) return '•••• 4421';
  const clean = String(accountNumber).trim();
  if (clean.startsWith('••••')) return clean;
  const last4 = clean.slice(-4);
  return last4 ? `•••• ${last4}` : '•••• 4421';
};

export const MyProfilePage = () => {
  const { currentUser, updateStaffProfile, addToast } = useApp();

  // Extract initial values from currentUser
  const [photo, setPhoto] = useState(currentUser?.avatar || AVATAR_OPTIONS[0]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');

  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState(currentUser?.dateOfBirth || '1994-06-18');
  const [address, setAddress] = useState(
    currentUser?.address || 'Flat 302, Green Valley Apartments, FC Road, Shivaji Nagar, Pune 411005'
  );

  // Emergency contact
  const [emergencyContactName, setEmergencyContactName] = useState(
    currentUser?.emergencyContact?.name || 'Ramesh Rao'
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    currentUser?.emergencyContact?.phone || '+91 98221 55667'
  );

  // Bank details
  const existingBank = currentUser?.bankDetails;
  const [accountHolderName, setAccountHolderName] = useState(
    existingBank?.accountHolderName || currentUser?.name || ''
  );
  const [bankName, setBankName] = useState(
    existingBank?.bankName || (currentUser?.bankAccount ? currentUser.bankAccount.split(' ••••')[0] : 'HDFC Bank')
  );
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState(existingBank?.ifscCode || 'HDFC0001234');

  // Form feedback state
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Current bank status from user record
  const currentBankStatus = currentUser?.bankStatus || (currentUser?.bankAccount ? 'Pending Verification' : 'Not Submitted');
  const currentStaffStatus = currentUser?.status || 'Active';

  // Display masked account number:
  const displayMaskedAcc = existingBank?.maskedAccountNumber || maskAccountNumber(currentUser?.bankAccount);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const newErrors = {};

    // 1. Validate IFSC Code: 4 letters, 0, then 6 alphanumeric characters
    const cleanIfsc = ifscCode.trim().toUpperCase();
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!cleanIfsc) {
      newErrors.ifscCode = 'IFSC code is required.';
    } else if (!ifscRegex.test(cleanIfsc)) {
      newErrors.ifscCode =
        'Invalid IFSC format. Must be 4 letters, followed by 0, and 6 alphanumeric characters (e.g. HDFC0001234).';
    }

    // 2. Validate Bank Name and Account Holder
    if (!accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required.';
    }
    if (!bankName.trim()) {
      newErrors.bankName = 'Bank name is required.';
    }

    // 3. Validate Account Numbers Match
    // If user entered a new account number or hasn't saved one yet:
    if (!displayMaskedAcc || accountNumber) {
      if (!accountNumber) {
        newErrors.accountNumber = 'Account number is required.';
      } else if (accountNumber.length < 8) {
        newErrors.accountNumber = 'Account number must be at least 8 digits.';
      }

      if (!confirmAccountNumber) {
        newErrors.confirmAccountNumber = 'Please confirm your account number.';
      } else if (accountNumber !== confirmAccountNumber) {
        newErrors.confirmAccountNumber = 'Account numbers do not match. Please verify.';
      }
    }

    // 4. Validate Emergency Contact
    if (!emergencyContactName.trim()) {
      newErrors.emergencyContactName = 'Emergency contact name is required.';
    }
    if (!emergencyContactPhone.trim()) {
      newErrors.emergencyContactPhone = 'Emergency contact phone number is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast('Please resolve the errors highlighted below.', 'error');
      return;
    }

    setErrors({});
    setIsSaving(true);

    setTimeout(() => {
      // Dispatch update to service layer
      const result = updateStaffProfile({
        avatar: photo,
        phone: phone.trim(),
        dateOfBirth,
        address: address.trim(),
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactPhone: emergencyContactPhone.trim(),
        accountHolderName: accountHolderName.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber ? accountNumber.trim() : (existingBank?.last4 || '4421'),
        ifscCode: cleanIfsc,
      });

      setIsSaving(false);

      if (result.success) {
        // Clear password inputs for security
        setAccountNumber('');
        setConfirmAccountNumber('');
      } else {
        setErrors({ general: result.error || 'Failed to update profile.' });
      }
    }, 400);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal details, emergency contact, and banking information for direct salary disbursement."
        breadcrumbs={[
          {
            label: currentUser?.role === 'kitchen_staff' ? 'Kitchen Station' : 'Inventory',
            href: currentUser?.role === 'kitchen_staff' ? '#/kitchen' : '#/inventory',
          },
          { label: 'My Profile' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                currentStaffStatus.toLowerCase() === 'active'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-blue-100 text-blue-800 border-blue-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Staff Status: {currentStaffStatus}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                currentBankStatus === 'Pending Verification'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : currentBankStatus === 'Verified'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Bank: {currentBankStatus}
            </span>
          </div>
        }
      />

      {/* Hero Profile Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={photo}
                alt={currentUser?.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-600/30 shadow-md"
              />
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-emerald-800 text-white flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-sm"
                title="Change Profile Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{currentUser?.name}</h2>
                <Badge variant={currentUser?.role}>{currentUser?.roleLabel || currentUser?.role}</Badge>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <span>{currentUser?.email}</span>
                <span>•</span>
                <span className="font-mono text-emerald-800 font-bold">
                  {currentUser?.employeeId || 'EMP-0003'}
                </span>
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser?.branchName || 'Spice Garden — Pune Central'}</span>
                <span>•</span>
                <span>Shift: {currentUser?.shift ? currentUser.shift.split(' (')[0] : 'Morning Shift'}</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1 self-stretch sm:self-auto sm:min-w-60">
            <div className="flex justify-between">
              <span className="text-slate-500">Security Clearance:</span>
              <span className="font-bold text-slate-800">Station Authorized</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Bank Verification:</span>
              <span className="font-bold text-amber-700">{currentBankStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Salary Account:</span>
              <span className="font-mono font-bold text-slate-900">{displayMaskedAcc}</span>
            </div>
          </div>
        </div>

        {/* Optional Avatar Selector Drawer */}
        {showAvatarPicker && (
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Choose Profile Photo:</span>
              <button
                type="button"
                onClick={() => setShowAvatarPicker(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {AVATAR_OPTIONS.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPhoto(imgUrl);
                    setShowAvatarPicker(false);
                  }}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                    photo === imgUrl
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20 scale-105'
                      : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Avatar option ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Or paste an image URL..."
                value={customPhotoUrl}
                onChange={(e) => setCustomPhotoUrl(e.target.value)}
                className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl flex-1 focus:outline-none focus:border-emerald-600"
              />
              <Button
                size="xs"
                variant="outline"
                onClick={() => {
                  if (customPhotoUrl.trim()) {
                    setPhoto(customPhotoUrl.trim());
                    setCustomPhotoUrl('');
                    setShowAvatarPicker(false);
                  }
                }}
              >
                Apply URL
              </Button>
            </div>
          </div>
        )}
      </div>

      {errors.general && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Personal Information */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Personal Information</h3>
                <p className="text-xs text-slate-400">Your core identity and residential address</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Full Legal Name"
                value={currentUser?.name || ''}
                disabled
                helper="Governed by branch management"
              />
              <FormInput
                label="Work Email Address"
                value={currentUser?.email || ''}
                disabled
                helper="Primary login credential"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Contact Phone"
                placeholder="+91 98200 XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <div>
                <FormInput
                  label="Date of Birth *"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Current Residential Address *
              </label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your flat/house number, street name, locality, city, state, and PIN code"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 leading-relaxed"
                required
              />
            </div>
          </div>

          {/* Section 2: Emergency Contact */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Emergency Contact</h3>
                  <p className="text-xs text-slate-400">Primary point of contact during station emergencies</p>
                </div>
              </div>

              <div>
                <FormInput
                  label="Emergency Contact Name *"
                  placeholder="e.g. Ramesh Rao (Father / Spouse)"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  required
                />
                {errors.emergencyContactName && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.emergencyContactName}</p>
                )}
              </div>

              <div>
                <FormInput
                  label="Emergency Contact Phone *"
                  placeholder="+91 98221 XXXXX"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  required
                />
                {errors.emergencyContactPhone && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.emergencyContactPhone}</p>
                )}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-start gap-2 mt-4">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                Emergency contact details are confidential and will only be contacted by the Restaurant Manager or Head Chef in critical operational or health situations.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Bank Details for Salary Disbursement */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Banking Details &amp; Direct Salary Transfer</h3>
                <p className="text-xs text-slate-400">
                  Electronic transfer details for monthly salary, incentives &amp; allowances
                </p>
              </div>
            </div>

            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg self-start sm:self-auto">
              Bank Status: <strong className="text-amber-700">{currentBankStatus}</strong>
            </span>
          </div>

          {/* Masked Active Bank Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                Registered Salary Disbursement Account
              </span>
              <div className="text-lg font-mono font-bold tracking-wider">
                {displayMaskedAcc}
              </div>
              <div className="text-xs text-slate-300">
                {accountHolderName || currentUser?.name} • {bankName || 'HDFC Bank'}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:text-right">
              <div className="space-y-0.5">
                <div className="text-[10px] text-slate-400 font-mono">IFSC Code</div>
                <div className="text-xs font-mono font-bold text-emerald-400">{ifscCode || 'HDFC0001234'}</div>
                <div className="text-[10px] text-amber-300 font-medium">{currentBankStatus}</div>
              </div>
            </div>
          </div>

          {/* Bank Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormInput
                label="Account Holder Name *"
                placeholder="e.g. Anita Ramesh Rao"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                required
              />
              {errors.accountHolderName && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.accountHolderName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Bank Name *
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              >
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="State Bank of India">State Bank of India (SBI)</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                <option value="Bank of Baroda">Bank of Baroda</option>
                <option value="Punjab National Bank">Punjab National Bank</option>
              </select>
              {errors.bankName && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.bankName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormInput
                label="Account Number *"
                type="password"
                placeholder={displayMaskedAcc || 'Enter account number'}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required={!displayMaskedAcc}
                helper="Account number is encrypted and stored masked as •••• XXXX"
              />
              {errors.accountNumber && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.accountNumber}</p>
              )}
            </div>

            <div>
              <FormInput
                label="Confirm Account Number *"
                type="password"
                placeholder="Re-enter full account number"
                value={confirmAccountNumber}
                onChange={(e) => setConfirmAccountNumber(e.target.value)}
                required={!!accountNumber}
                helper="Must match the account number above exactly"
              />
              {errors.confirmAccountNumber && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.confirmAccountNumber}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FormInput
                label="Bank IFSC Code *"
                placeholder="e.g. HDFC0001234"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                maxLength={11}
                required
                helper="4 letters, 0, then 6 alphanumeric characters"
              />
              {errors.ifscCode && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.ifscCode}</p>
              )}
            </div>

            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2 self-center">
              <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Security &amp; Encryption Policy</div>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Saving updates your bank verification status to <strong>Pending Verification</strong> and activates your staff standing to <strong>Active</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Note: You are editing your personal profile as <strong>{currentUser?.name}</strong>.
          </p>

          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={Save}
            disabled={isSaving}
            className="px-6 shadow-sm"
          >
            {isSaving ? 'Submitting Verification...' : 'Save & Submit Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
};

