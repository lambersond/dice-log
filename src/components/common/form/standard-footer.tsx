type Props = {
  onCancel: VoidFunction
  submitting?: boolean
  disableSubmit?: boolean
  cancelText?: string
  submitText?: string
  submittingText?: string
}

export function StandardFooter({
  onCancel,
  submitting = false,
  disableSubmit = false,
  cancelText = 'Cancel',
  submitText = 'Save',
  submittingText = 'Saving…',
}: Readonly<Props>) {
  return (
    <div className='flex justify-end gap-2 mt-4'>
      <button
        type='button'
        onClick={onCancel}
        className='rounded-md px-4 py-1.5 text-sm font-medium
          text-text-primary hover:bg-hover cursor-pointer'
      >
        {cancelText}
      </button>
      <button
        type='submit'
        disabled={submitting || disableSubmit}
        className='rounded-md bg-primary px-4 py-1.5 text-sm font-medium
          text-white hover:opacity-90 cursor-pointer disabled:opacity-50
          disabled:cursor-not-allowed'
      >
        {submitting ? submittingText : submitText}
      </button>
    </div>
  )
}
