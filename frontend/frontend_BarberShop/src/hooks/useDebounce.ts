import { useEffect, useState } from "react"

/**
 * Hook de debounce para atrasar a atualização de um valor.
 * @param value 
 * @param delay 
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
