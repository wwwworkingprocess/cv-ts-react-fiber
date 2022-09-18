import { useEffect, useState } from "react";

//
// Defered execution of a value update of type T
//
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  //
  // Recall effect if value or delay changes
  //
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay); // Update debounced value after delay
    //
    return () => clearTimeout(timeout); // clear effect on onmount
  }, [value, delay]);
  //
  return debouncedValue;
}
