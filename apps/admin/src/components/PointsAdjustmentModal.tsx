import React, { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon, 
  PlusIcon, 
  MinusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import FormModal from './FormModal';

export interface PointsAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (delta: number, reason: string) => void;
  userName: string;
  currentPoints: number;
  isSubmitting?: boolean;
}

const PointsAdjustmentModal: React.FC<PointsAdjustmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userName,
  currentPoints,
  isSubmitting = false,
}) => {
  const [delta, setDelta] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');
  const [errors, setErrors] = useState<{ delta?: string; reason?: string }>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setDelta('');
      setReason('');
      setAdjustmentType('add');
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: { delta?: string; reason?: string } = {};

    if (!delta || delta.trim() === '') {
      newErrors.delta = 'Points amount is required';
    } else if (isNaN(Number(delta)) || Number(delta) <= 0) {
      newErrors.delta = 'Points must be a positive number';
    }

    if (!reason || reason.trim() === '') {
      newErrors.reason = 'Reason is required';
    } else if (reason.trim().length < 3) {
      newErrors.reason = 'Reason must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const pointsDelta = adjustmentType === 'add' ? Number(delta) : -Number(delta);
    onSubmit(pointsDelta, reason.trim());
  };

  const getNewBalance = () => {
    if (!delta || isNaN(Number(delta))) return currentPoints;
    const pointsDelta = adjustmentType === 'add' ? Number(delta) : -Number(delta);
    return currentPoints + pointsDelta;
  };

  const getBalanceChangeColor = () => {
    const newBalance = getNewBalance();
    if (newBalance > currentPoints) return 'text-green-600';
    if (newBalance < currentPoints) return 'text-red-600';
    return 'text-gray-600';
  };

  const getBalanceChangeIcon = () => {
    const newBalance = getNewBalance();
    if (newBalance > currentPoints) return <PlusIcon className="h-4 w-4 text-green-500" />;
    if (newBalance < currentPoints) return <MinusIcon className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getBalanceChangeBg = () => {
    const newBalance = getNewBalance();
    if (newBalance > currentPoints) return 'bg-green-50 border-green-200';
    if (newBalance < currentPoints) return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust User Points"
      onSubmit={handleSubmit}
      submitText="Apply Adjustment"
      isSubmitting={isSubmitting}
      size="lg"
    >
      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-100">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
              <UserCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900">{userName}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Active User</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <CurrencyDollarIcon className="h-5 w-5 text-indigo-500" />
                <span className="text-2xl font-bold text-indigo-600">{currentPoints}</span>
              </div>
              <span className="text-xs text-gray-500">current points</span>
            </div>
          </div>
        </div>

        {/* Adjustment Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Adjustment Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAdjustmentType('add')}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                adjustmentType === 'add'
                  ? 'border-green-500 bg-green-50 text-green-700 shadow-md'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:bg-green-25'
              }`}
            >
              <PlusIcon className="h-5 w-5" />
              <span className="font-medium">Add Points</span>
            </button>
            <button
              type="button"
              onClick={() => setAdjustmentType('subtract')}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                adjustmentType === 'subtract'
                  ? 'border-red-500 bg-red-50 text-red-700 shadow-md'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:bg-red-25'
              }`}
            >
              <MinusIcon className="h-5 w-5" />
              <span className="font-medium">Subtract Points</span>
            </button>
          </div>
        </div>

        {/* Points Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Points Amount *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              min="1"
              step="1"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                errors.delta ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter points amount"
            />
          </div>
          {errors.delta && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              {errors.delta}
            </p>
          )}
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Adjustment *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className={`block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
              errors.reason ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Explain why you're adjusting these points..."
          />
          {errors.reason && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              {errors.reason}
            </p>
          )}
        </div>

        {/* Preview */}
        {delta && !isNaN(Number(delta)) && Number(delta) > 0 && (
          <div className={`${getBalanceChangeBg()} border rounded-lg p-4 transition-all duration-200`}>
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
              Adjustment Preview
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Current Balance:</span>
                <span className="font-semibold text-gray-900">{currentPoints} points</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Adjustment:</span>
                <span className={`font-semibold flex items-center space-x-1 ${
                  adjustmentType === 'add' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {getBalanceChangeIcon()}
                  <span>
                    {adjustmentType === 'add' ? '+' : '-'}{delta} points
                  </span>
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">New Balance:</span>
                  <span className={`text-lg font-bold ${getBalanceChangeColor()}`}>
                    {getNewBalance()} points
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Warning for large adjustments */}
        {delta && !isNaN(Number(delta)) && Number(delta) > 100 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="text-sm text-yellow-800">
                <p className="font-semibold">Large Points Adjustment</p>
                <p className="mt-1">
                  You're about to adjust <span className="font-medium">{delta} points</span>. 
                  Please ensure this is correct and properly documented.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success message for positive adjustments */}
        {adjustmentType === 'add' && delta && !isNaN(Number(delta)) && Number(delta) > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <span className="text-sm text-green-700 font-medium">
                Adding points will increase the user's balance and may provide additional benefits.
              </span>
            </div>
          </div>
        )}

        {/* Caution message for negative adjustments */}
        {adjustmentType === 'subtract' && delta && !isNaN(Number(delta)) && Number(delta) > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <XCircleIcon className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-700 font-medium">
                Subtracting points will decrease the user's balance. This action should be used carefully.
              </span>
            </div>
          </div>
        )}
      </div>
    </FormModal>
  );
};

export default PointsAdjustmentModal;
