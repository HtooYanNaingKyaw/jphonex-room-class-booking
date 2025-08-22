import React from 'react';
import Modal from './Modal';
import type { ModalProps } from './Modal';

export interface FormModalProps extends Omit<ModalProps, 'footer'> {
  onSubmit?: (e: React.FormEvent) => void;
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  submitVariant?: 'primary' | 'secondary' | 'danger' | 'success';
  showCancelButton?: boolean;
  onCancel?: () => void;
  children: React.ReactNode;
}

const FormModal: React.FC<FormModalProps> = ({
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  isSubmitting = false,
  submitDisabled = false,
  submitVariant = 'primary',
  showCancelButton = true,
  onCancel,
  children,
  ...modalProps
}) => {
  const getSubmitButtonClasses = () => {
    const baseClasses = 'inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    switch (submitVariant) {
      case 'primary':
        return `${baseClasses} bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500`;
      case 'secondary':
        return `${baseClasses} bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500`;
      case 'danger':
        return `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;
      case 'success':
        return `${baseClasses} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500`;
      default:
        return `${baseClasses} bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      modalProps.onClose();
    }
  };

  const footer = (
    <div className="flex justify-end space-x-3">
      {showCancelButton && (
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {cancelText}
        </button>
      )}
      <button
        type="submit"
        form="form-modal-form"
        disabled={submitDisabled || isSubmitting}
        className={getSubmitButtonClasses()}
      >
        {isSubmitting ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {submitText === 'Submit' ? 'Submitting...' : submitText}
          </div>
        ) : (
          submitText
        )}
      </button>
    </div>
  );

  return (
    <Modal {...modalProps} footer={footer}>
      <form id="form-modal-form" onSubmit={handleSubmit}>
        {children}
      </form>
    </Modal>
  );
};

export default FormModal;
