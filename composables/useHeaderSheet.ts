let openSheets = 0

function syncHeaderSheetClass() {
  if (!import.meta.client) return
  document.documentElement.classList.toggle('has-header-sheet', openSheets > 0)
}

export function useHeaderSheet(active: Ref<boolean>) {
  let counted = false

  watch(
    active,
    (open) => {
      if (!import.meta.client) return
      if (open && !counted) {
        openSheets += 1
        counted = true
      } else if (!open && counted) {
        openSheets = Math.max(0, openSheets - 1)
        counted = false
      }
      syncHeaderSheetClass()
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    if (!import.meta.client || !counted) return
    openSheets = Math.max(0, openSheets - 1)
    counted = false
    syncHeaderSheetClass()
  })
}
