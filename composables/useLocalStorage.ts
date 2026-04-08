export function useLocalStorage<T>(key: string, defaultValue: T) {
  const storedValue = ref<T>(defaultValue)

  if (process.client) {
    const raw = localStorage.getItem(key)
    if (raw) {
      try {
        storedValue.value = JSON.parse(raw)
      } catch (e) {
        console.error(`Error parsing localStorage key "${key}"`, e)
      }
    }

    watch(
      storedValue,
      (newVal) => {
        localStorage.setItem(key, JSON.stringify(newVal))
      },
      { deep: true }
    )
  }

  return storedValue
}
