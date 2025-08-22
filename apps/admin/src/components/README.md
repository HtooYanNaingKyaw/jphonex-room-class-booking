# Reusable Modal Components

This directory contains reusable modal components that provide consistent UI patterns across the admin application.

## Components

### 1. Modal (Base Component)

The base modal component that provides the foundation for all modal dialogs.

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Function called when modal should close
- `title?: string` - Optional modal title
- `children: React.ReactNode` - Modal content
- `size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'` - Modal size (default: 'md')
- `showCloseButton?: boolean` - Show/hide close button (default: true)
- `closeOnOverlayClick?: boolean` - Close on backdrop click (default: true)
- `closeOnEscape?: boolean` - Close on Escape key (default: true)
- `className?: string` - Additional CSS classes
- `footer?: React.ReactNode` - Optional footer content

**Usage:**
```tsx
import Modal from '../components/Modal';

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Simple Modal"
  size="lg"
>
  <p>This is a simple modal with custom content.</p>
</Modal>
```

### 2. FormModal (Specialized Component)

A specialized modal component designed for forms with built-in form handling and footer actions.

**Props:**
- All props from Modal component
- `onSubmit?: (e: React.FormEvent) => void` - Form submit handler
- `submitText?: string` - Submit button text (default: 'Submit')
- `cancelText?: string` - Cancel button text (default: 'Cancel')
- `isSubmitting?: boolean` - Shows loading state (default: false)
- `submitDisabled?: boolean` - Disables submit button (default: false)
- `submitVariant?: 'primary' | 'secondary' | 'danger' | 'success'` - Button style (default: 'primary')
- `showCancelButton?: boolean` - Show/hide cancel button (default: true)
- `onCancel?: () => void` - Custom cancel handler

**Usage:**
```tsx
import FormModal from '../components/FormModal';

<FormModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Add New Item"
  onSubmit={handleSubmit}
  submitText="Create Item"
  isSubmitting={isLoading}
  size="lg"
>
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Name *
      </label>
      <input
        type="text"
        required
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  </div>
</FormModal>
```

## Features

### Built-in Functionality
- **Keyboard Support**: ESC key closes modal
- **Body Scroll Lock**: Prevents background scrolling when modal is open
- **Responsive Design**: Adapts to different screen sizes
- **Accessibility**: Proper ARIA attributes and focus management
- **Backdrop Click**: Click outside modal to close
- **Smooth Animations**: CSS transitions for opening/closing

### Size Variants
- `sm`: Small modal (max-w-md)
- `md`: Medium modal (max-w-lg) - Default
- `lg`: Large modal (max-w-2xl)
- `xl`: Extra large modal (max-w-4xl)
- `full`: Full width modal with margins

### Button Variants
- `primary`: Indigo button (default)
- `secondary`: Gray button
- `danger`: Red button
- `success`: Green button

## Examples

### Simple Information Modal
```tsx
<Modal
  isOpen={showInfo}
  onClose={() => setShowInfo(false)}
  title="Information"
  size="sm"
>
  <p>This is an informational message.</p>
</Modal>
```

### Form Modal with Loading State
```tsx
<FormModal
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  title="Create User"
  onSubmit={handleSubmit}
  submitText="Create User"
  isSubmitting={isCreating}
  submitVariant="success"
>
  {/* Form fields here */}
</FormModal>
```

### Modal with Custom Footer
```tsx
<Modal
  isOpen={showCustom}
  onClose={() => setShowCustom(false)}
  title="Custom Actions"
  footer={
    <div className="flex justify-between">
      <button className="text-red-600 hover:text-red-800">
        Delete
      </button>
      <button className="text-blue-600 hover:text-blue-800">
        Archive
      </button>
    </div>
  }
>
  <p>Modal with custom footer actions.</p>
</Modal>
```

## Migration from Old Modal Implementation

The new modal components replace the old inline modal implementations. Here's how to migrate:

**Before (Old):**
```tsx
{showModal && (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <h3>Title</h3>
      <form onSubmit={handleSubmit}>
        {/* Form content */}
        <div className="flex justify-end space-x-3 mt-6">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  </div>
)}
```

**After (New):**
```tsx
<FormModal
  isOpen={showModal}
  onClose={onClose}
  title="Title"
  onSubmit={handleSubmit}
  submitText="Submit"
>
  {/* Form content */}
</FormModal>
```

## Benefits

1. **Consistency**: All modals look and behave the same
2. **Maintainability**: Changes to modal behavior only need to be made in one place
3. **Accessibility**: Built-in keyboard navigation and ARIA support
4. **Responsiveness**: Automatically adapts to different screen sizes
5. **Reusability**: Easy to create new modals with consistent behavior
6. **Type Safety**: Full TypeScript support with proper interfaces
