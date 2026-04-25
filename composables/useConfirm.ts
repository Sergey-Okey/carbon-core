import { ref } from 'vue'

type ConfirmState = {
  isOpen: boolean
  message: string
  resolve: ((value: boolean) => void) | null
}

const state = ref<ConfirmState>({
  isOpen: false,
  message: '',
  resolve: null,
})

export function useConfirm() {
  function confirm(message: string): Promise<boolean> {
    if (state.value.isOpen && state.value.resolve) {
      state.value.resolve(false)
    }

    return new Promise<boolean>((resolve) => {
      state.value = {
        isOpen: true,
        message,
        resolve,
      }
    })
  }

  function handleConfirm() {
    if (state.value.resolve) {
      state.value.resolve(true)
    }
    state.value = { isOpen: false, message: '', resolve: null }
  }

  function handleCancel() {
    if (state.value.resolve) {
      state.value.resolve(false)
    }
    state.value = { isOpen: false, message: '', resolve: null }
  }

  return {
    state,
    confirm,
    handleConfirm,
    handleCancel,
  }
}
