import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Send,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { FormInput } from '../../components/common/FormInput';

export const ReportLowStockPage = () => {
  const navigate = useNavigate();
  const { restaurantIngredients, reportLowStock, currentUser } = useApp();

  const [selectedIngredientId, setSelectedIngredientId] = useState(
    restaurantIngredients[0]?.id || ''
  );
  const [notes, setNotes] = useState('Running very low during dinner service rush');
  const [submitted, setSubmitted] = useState(false);

  const selectedIngredient =
    restaurantIngredients.find((i) => i.id === selectedIngredientId) ||
    restaurantIngredients[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedIngredient) return;

    reportLowStock({
      ingredientId: selectedIngredient.id,
      notes,
      reportedBy: currentUser.name,
    });
    setSubmitted(true);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title="Report Low Stock to Inventory Manager"
        subtitle="Quickly signal stock shortages observed at your cooking station or prep table"
        breadcrumbs={[
          { label: 'Kitchen', href: '#/kitchen' },
          { label: 'Report Low Stock' },
        ]}
      />

      <Card>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormInput
              label="Select Depleted Ingredient"
              name="ingredientId"
              type="select"
              value={selectedIngredientId}
              onChange={(e) => setSelectedIngredientId(e.target.value)}
              options={restaurantIngredients.map((ing) => ({
                label: `${ing.name} (Recorded Stock: ${ing.quantity} ${ing.unit})`,
                value: ing.id,
              }))}
              required
            />

            <FormInput
              label="Observed Shortage Notes"
              name="notes"
              type="textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Only 2 chicken breasts left in line chiller, rush starting in 30 minutes"
              required
            />

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <strong>Manager Notification:</strong> Submitting this report will generate a high-priority alert for the restaurant owner and inventory manager to initiate a purchase order.
            </div>

            <Button
              type="submit"
              variant="brand"
              className="w-full"
              size="lg"
              icon={Send}
            >
              Dispatch Low Stock Alert
            </Button>
          </form>
        ) : (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Alert Dispatched!</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
              Inventory managers have been notified that <span className="font-semibold text-slate-800">{selectedIngredient?.name}</span> requires immediate restocking.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSubmitted(false);
                  setNotes('Running low on line');
                }}
              >
                Report Another Shortage
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/kitchen')}
              >
                Back to Station
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

