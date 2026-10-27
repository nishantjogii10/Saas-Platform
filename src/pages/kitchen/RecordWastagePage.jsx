import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { FormInput } from '../../components/common/FormInput';

export const RecordWastagePage = () => {
  const navigate = useNavigate();
  const { restaurantIngredients, recordWastage, currentUser } = useApp();

  const [selectedIngredientId, setSelectedIngredientId] = useState(
    restaurantIngredients[0]?.id || ''
  );
  const [amount, setAmount] = useState(1);
  const [reason, setReason] = useState('Expired past safe use window');
  const [submitted, setSubmitted] = useState(false);

  const selectedIngredient =
    restaurantIngredients.find((i) => i.id === selectedIngredientId) ||
    restaurantIngredients[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedIngredient) return;

    recordWastage({
      ingredientId: selectedIngredient.id,
      amount: Number(amount),
      reason,
      staffName: currentUser.name,
      roleName: currentUser.role,
    });
    setSubmitted(true);
  };

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Record Food Wastage"
        subtitle="Log spoiled batches, accidental kitchen damage, and trimming discards"
        breadcrumbs={[
          { label: 'Kitchen', href: '#/kitchen' },
          { label: 'Record Wastage' },
        ]}
      />

      <div className="max-w-3xl">
        <Card>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormInput
              label="Select Wasted Ingredient"
              name="ingredientId"
              type="select"
              value={selectedIngredientId}
              onChange={(e) => setSelectedIngredientId(e.target.value)}
              options={restaurantIngredients.map((ing) => ({
                label: `${ing.name} (Batch: ${ing.batchNumber} • ${ing.quantity} ${ing.unit} on-hand)`,
                value: ing.id,
              }))}
              required
            />

            {selectedIngredient && (
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 text-xs space-y-1.5 text-rose-950">
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Stock:</span>
                  <span className="font-bold">{selectedIngredient.quantity} {selectedIngredient.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Batch Code:</span>
                  <span className="font-mono font-semibold">{selectedIngredient.batchNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Batch Expiry:</span>
                  <span className="font-bold">{selectedIngredient.expiryDate} ({selectedIngredient.daysUntilExpiry}d left)</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label={`Quantity Discarded (${selectedIngredient?.unit || 'units'})`}
                name="amount"
                type="number"
                step="any"
                min="0.1"
                max={selectedIngredient?.quantity || 100}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />

              <FormInput
                label="Reason for Spoilage / Wastage"
                name="reason"
                type="select"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                options={[
                  'Expired past safe use window',
                  'Visual mold / discoloration',
                  'Dropped or damaged container',
                  'Cold storage temperature variance',
                  'Over-prepped line surplus',
                ]}
                required
              />
            </div>

            <Button
              type="submit"
              variant="danger"
              className="w-full"
              size="lg"
              icon={Trash2}
            >
              Log Wastage Discard
            </Button>
          </form>
        ) : (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Food Wastage Logged</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
              Recorded {amount} {selectedIngredient?.unit} of {selectedIngredient?.name} as wastage ({reason}). Discard audited in stock ledger.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSubmitted(false);
                  setAmount(1);
                }}
              >
                Log Another Wastage Item
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/kitchen')}
              >
                Return to Station
              </Button>
            </div>
          </div>
        )}
        </Card>
      </div>
    </div>
  );
};

