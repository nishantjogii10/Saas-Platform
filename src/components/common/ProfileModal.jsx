import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from './Modal';
import { Button } from './Button';
import { FormInput } from './FormInput';
import { Badge } from './Badge';
import {
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  KeyRound,
  Building2,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Camera,
  Store,
  Truck,
  ChefHat,
  Bell,
  Volume2,
} from 'lucide-react';

const AVATAR_PRESETS = [
  {
    id: 'chef-f',
    label: 'Chef Anita (Kitchen)',
    url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'chef-m',
    label: 'Chef Marco (Kitchen)',
    url: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'owner-f',
    label: 'Priya Sharma (Owner)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'owner-m',
    label: 'Marcus Chen (Owner)',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'mgr-m',
    label: 'Rahul Verma (Inventory)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'mgr-f',
    label: 'Elena Rostova (Inventory)',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'admin-m',
    label: 'Alexander Vance (Admin)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'sup-m',
    label: 'David Miller (Supplier)',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
];

export const ProfileModal = () => {
  const {
    currentUser,
    currentRestaurant,
    isProfileModalOpen,
    closeProfileModal,
    updateCurrentUserProfile,
  } = useApp();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [pin, setPin] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Preference toggles
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyLowStock, setNotifyLowStock] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // UI state
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load current user data when modal opens
  useEffect(() => {
    if (currentUser && isProfileModalOpen) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '+1 (555) 019-2834');
      setAvatar(currentUser.avatar || AVATAR_PRESETS[0].url);
      setCustomAvatarUrl('');
      setPin(currentUser.pin || '4421');
      setDeliveryNotes(currentUser.deliveryNotes || 'Standard dock delivery 7 AM - 11 AM.');

      // Reset password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
      setError('');

      // Preferences
      if (currentUser.preferences) {
        setNotifyEmail(currentUser.preferences.notifyEmail ?? true);
        setNotifyLowStock(currentUser.preferences.notifyLowStock ?? true);
        setSoundEnabled(currentUser.preferences.soundEnabled ?? true);
      }
    }
  }, [currentUser, isProfileModalOpen]);

  if (!currentUser) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    // Role-specific check for kitchen staff PIN
    if (currentUser.role === 'kitchen_staff') {
      if (!/^\d{4}$/.test(pin)) {
        setError('Kitchen Station PIN must be exactly 4 numeric digits.');
        return;
      }
    }

    // Password change validation if enabled
    let updatedPassword = null;
    if (showPasswordSection && (newPassword || currentPassword)) {
      const validCurrentPassword = currentUser.password || 'password123';
      if (currentPassword !== validCurrentPassword && currentPassword !== 'password123') {
        setError('The current password you entered is incorrect.');
        return;
      }
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match. Please re-type carefully.');
        return;
      }
      updatedPassword = newPassword;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        avatar: customAvatarUrl.trim() || avatar,
        preferences: {
          notifyEmail,
          notifyLowStock,
          soundEnabled,
        },
      };

      if (currentUser.role === 'kitchen_staff') {
        payload.pin = pin;
      }

      if (currentUser.role === 'supplier') {
        payload.deliveryNotes = deliveryNotes;
      }

      if (updatedPassword) {
        payload.password = updatedPassword;
      }

      const res = updateCurrentUserProfile(payload);
      setIsSubmitting(false);

      if (res.success) {
        closeProfileModal();
      } else {
        setError(res.error || 'Failed to update profile.');
      }
    }, 250);
  };

  return (
    <Modal
      isOpen={isProfileModalOpen}
      onClose={closeProfileModal}
      title="My Profile & Account Settings"
      subtitle="Manage your personal identity, avatar, contact details, and station credentials."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error alert banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. SECURITY & PERMISSIONS (LOCKED / READ-ONLY) */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Security &amp; Workspace Authorization
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
              ID: {currentUser.id}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* System Role */}
            <div className="bg-slate-800/70 p-2.5 rounded-xl border border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400" /> System Role
              </span>
              <div className="mt-1 flex items-center gap-1.5">
                <Badge status={currentUser.role} size="sm" />
              </div>
            </div>

            {/* Tenant Restaurant */}
            <div className="bg-slate-800/70 p-2.5 rounded-xl border border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400" /> Organization
              </span>
              <p className="mt-1 text-xs font-semibold text-white truncate">
                {currentUser.role === 'super_admin'
                  ? 'StockMate Platform (Global)'
                  : currentUser.role === 'supplier'
                  ? currentUser.supplierName || 'Metro Food Distributors'
                  : currentRestaurant?.name || 'Assigned Restaurant'}
              </p>
            </div>

            {/* Account Status */}
            <div className="bg-slate-800/70 p-2.5 rounded-xl border border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400" /> Account Status
              </span>
              <div className="mt-1 flex items-center gap-1 text-xs font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active &amp; Verified</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2.5 italic">
            🔒 Roles, tenant assignments, and administrative access levels are governed by platform security policies and cannot be modified from personal profile.
          </p>
        </div>

        {/* 2. AVATAR PICKER */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Profile Avatar &amp; Appearance
          </label>
          <div className="flex items-center gap-4 mb-3">
            <div className="relative">
              <img
                src={customAvatarUrl || avatar}
                alt="Avatar preview"
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-500/20 border-2 border-emerald-500 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-600 rounded-lg text-white shadow-xs">
                <Camera className="w-3 h-3" />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">
                Choose an avatar preset or paste a custom URL
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                This image represents you across audit logs, orders, and dashboard activity.
              </p>
            </div>
          </div>

          {/* Preset Avatar Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-3">
            {AVATAR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setAvatar(preset.url);
                  setCustomAvatarUrl('');
                }}
                className={`group relative rounded-xl overflow-hidden aspect-square border-2 transition-all p-0.5 ${
                  (customAvatarUrl === '' && avatar === preset.url)
                    ? 'border-emerald-600 ring-2 ring-emerald-500/30 scale-105'
                    : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                }`}
                title={preset.label}
              >
                <img
                  src={preset.url}
                  alt={preset.label}
                  className="w-full h-full object-cover rounded-lg"
                />
                {customAvatarUrl === '' && avatar === preset.url && (
                  <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Custom URL Input */}
          <FormInput
            placeholder="Or paste a custom image URL (https://...)"
            value={customAvatarUrl}
            onChange={(e) => setCustomAvatarUrl(e.target.value)}
            className="text-xs"
          />
        </div>

        {/* 3. PERSONAL CONTACT DETAILS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Full Display Name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Sharma"
            icon={User}
            required
          />

          <FormInput
            label="Work Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. priya@spicegarden.com"
            icon={Mail}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            label="Phone Number"
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            icon={Phone}
            helperText="Used for low-stock SMS and delivery dispatch updates."
          />

          {/* Kitchen Staff PIN Setting */}
          {currentUser.role === 'kitchen_staff' && (
            <div>
              <FormInput
                label="Kitchen Station Touch PIN"
                name="pin"
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="4421"
                icon={KeyRound}
                helperText="4-digit quick passcode for kitchen touchscreen line stations."
                required
              />
            </div>
          )}

          {/* Supplier Dispatch Notes */}
          {currentUser.role === 'supplier' && (
            <div>
              <FormInput
                label="Dock Delivery Notes"
                name="deliveryNotes"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="e.g. Standard delivery hours: 7 AM - 11 AM"
                icon={Truck}
                helperText="Appears on purchase order receipts for receiving staff."
              />
            </div>
          )}
        </div>

        {/* 4. PASSWORD & SECURITY EXPANDER */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Login Password &amp; Credentials
              </h4>
              <p className="text-[11px] text-slate-500">
                Change the password you use to authenticate into StockMate SaaS.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-200"
            >
              {showPasswordSection ? 'Cancel Password Change' : 'Change Password'}
            </button>
          </div>

          {showPasswordSection && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-fade-in">
              <div className="relative">
                <FormInput
                  label="Current Password"
                  name="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password (default: password123)"
                  icon={Lock}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <FormInput
                    label="New Password"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    icon={Lock}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <FormInput
                  label="Confirm New Password"
                  name="confirmPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  icon={Lock}
                />
              </div>
            </div>
          )}
        </div>

        {/* 5. NOTIFICATION PREFERENCES */}
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Notification Preferences
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Email Alerts</span>
                <span className="text-[10px] text-slate-500">PO &amp; inventory digest</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={notifyLowStock}
                onChange={(e) => setNotifyLowStock(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Low-Stock Warnings</span>
                <span className="text-[10px] text-slate-500">Urgent depletion alerts</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Audio Chimes</span>
                <span className="text-[10px] text-slate-500">Sound on new order</span>
              </div>
            </label>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            onClick={closeProfileModal}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="brand"
            loading={isSubmitting}
            iconLeft={Check}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

