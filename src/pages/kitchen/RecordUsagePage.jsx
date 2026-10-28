import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Boxes,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { FormInput } from '../../components/common/FormInput';
import { Badge } from '../../components/common/Badge';

export const RecordUsagePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const preselectedId = searchParams.get('ingredientId');

  const { restaurantIngredients, recordConsumption, currentUser } = useApp();

  const [selectedIngredientId, setSelectedIngredientId] = useState(
    preselectedId || restaurantIngredients[0]?.id || ''
  );
  const [amount, setAmount] = useState(2);
  const [reason, setReason] = useState('Prep session for service');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (preselectedId) {
      setSelectedIngredientId(preselectedId);
    }
  }, [preselectedId]);

  const selectedIngredient =
    restaurantIngredients.find((i) => i.id === selectedIngredientId) ||
    restaurantIngredients[0];

  const simulatedRemaining = selectedIngredient
    ? Math.max(0, selectedIngredient.quantity - Number(amount))
    : 0;

  const willBeLowStock =
    selectedIngredient && simulatedRemaining <= selectedIngredient.minThreshold;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedIngredient) return;

    recordConsumption({
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
        title="Record Ingredient Usage"
        subtitle="Log quantities consumed during daily station prep or cooking orders (Workflow B)"
        breadcrumbs={[
          { label: 'Kitchen', href: '#/kitchen' },
          { label: 'Record Usage' },
        ]}
      />

      <div className="max-w-3xl">
        <Card>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormInput
              label="Select Ingredient"
              name="ingredientId"
              type="select"
              value={selectedIngredientId}
              onChange={(e) => setSelectedIngredientId(e.target.value)}
              options={restaurantIngredients.map((ing) => ({
                label: `${ing.name} (${ing.quantity} ${ing.unit} available)`,
                value: ing.id,
              }))}
              required
            />

            {selectedIngredient && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Current Stock On-Hand:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedIngredient.quantity} {selectedIngredient.unit}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Safety Threshold:</span>
                  <span className="font-semibold text-slate-700">
                    {selectedIngredient.minThreshold} {selectedIngredient.unit}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-slate-600 font-semibold">Simulated Balance After Usage:</span>
                  <span
                    className={`font-extrabold text-sm ${
                      willBeLowStock ? 'text-amber-600' : 'text-emerald-700'
                    }`}
                  >
                    {simulatedRemaining.toFixed(1)} {selectedIngredient.unit}
                  </span>
                </div>

                {willBeLowStock && (
                  <div className="pt-2 text-amber-800 font-medium flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>This usage will trigger an automated Low Stock Alert for inventory reordering!</span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label={`Quantity Used (${selectedIngredient?.unit || 'units'})`}
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
                label="Kitchen Station / Reason"
                name="reason"
                type="select"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                options={[
                  'Prep session for service',
                  'Lunch rush main course',
                  'Dinner rush banquet order',
                  'Sauce & broth batch cook',
                  'Dessert & bakery station',
                  'Staff meal prep',
                ]}
                required
              />
            </div>

            <Button
              type="submit"
              variant="brand"
              className="w-full"
              size="lg"
              icon={Scale}
            >
              Confirm and Log Usage
            </Button>
          </form>
        ) : (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Usage Recorded!</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
              Consumed {amount} {selectedIngredient?.unit} of {selectedIngredient?.name}. Stock balance and movement ledgers have been updated.
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
                Log Another Item
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

