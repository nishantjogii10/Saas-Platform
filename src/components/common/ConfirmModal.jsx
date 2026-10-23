import React from 'react';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // danger | warning | info | success
  loading = false,
}) => {
  const ICON_MAP = {
    danger: {
      icon: AlertTriangle,
      color: 'bg-rose-100 text-rose-600',
      btnVariant: 'danger',
    },
    warning: {
      icon: AlertTriangle,
      color: 'bg-amber-100 text-amber-600',
      btnVariant: 'primary',
    },
    info: {
      icon: Info,
      color: 'bg-blue-100 text-blue-600',
      btnVariant: 'primary',
    },
    success: {
      icon: CheckCircle2,
      color: 'bg-emerald-100 text-emerald-600',
      btnVariant: 'success',
    },
  };

  const current = ICON_MAP[type] || ICON_MAP.danger;
  const IconComponent = current.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={current.btnVariant}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4 pt-1">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${current.color}`}>
          <IconComponent className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-slate-900">{title}</h4>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
};

