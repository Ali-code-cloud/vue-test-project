import Swal from 'sweetalert2'

// Custom SweetAlert Toast Configuration
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  customClass: {
    popup: 'colored-toast-popup'
  },
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer
    toast.onmouseleave = Swal.resumeTimer
  }
})

/**
  Show quick top-right Toast notification for user feedback
 */
export const showToast = (title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  return Toast.fire({
    icon,
    title
  })
}

export const showSuccessToast = (title: string) => showToast(title, 'success')
export const showErrorToast = (title: string) => showToast(title, 'error')
export const showInfoToast = (title: string) => showToast(title, 'info')
export const showWarningToast = (title: string) => showToast(title, 'warning')

/**
 * Standard SweetAlert Modal Dialogs
 */
export const showSuccessAlert = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonColor: '#1A56DB',
    timer: 3000,
    timerProgressBar: true
  })
}

export const showErrorAlert = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonColor: '#1A56DB'
  })
}

export const showConfirmAlert = (title: string, text: string, confirmButtonText = 'Yes, proceed!') => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#1A56DB',
    cancelButtonColor: '#94A3B8',
    confirmButtonText
  })
}

export const showPromptAlert = (title: string, inputPlaceholder = 'Enter reason...', defaultValue = '') => {
  return Swal.fire({
    title,
    input: 'textarea',
    inputPlaceholder,
    inputValue: defaultValue,
    showCancelButton: true,
    confirmButtonColor: '#1A56DB',
    cancelButtonColor: '#94A3B8',
    confirmButtonText: 'Submit',
    inputValidator: (value) => {
      if (!value || !value.trim()) {
        return 'Please enter a value before submitting.'
      }
      return null
    }
  })
}

export default Swal
