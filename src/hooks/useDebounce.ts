import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  //
  //
  //
  useEffect(
    () => {
      const timeout = setTimeout(() => setDebouncedValue(value), delay); // Update debounced value after delay
      //
      return () => clearTimeout(timeout); // clear effect on onmount
    },
    [value, delay] // Recall effect if value or delay changes
  );
  //
  return debouncedValue;
}
