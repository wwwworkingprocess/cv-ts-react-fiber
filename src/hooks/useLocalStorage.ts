import { useState, useEffect } from "react";

//
// Local storage based variable of any type.
// During save the value is seralized.
// This storage method is unsecure and have a
// size limit of 5 megabytes so use it wisely.
//
const useLocalStorage = (key: string, defaultValue: any) => {
  const [value, setValue] = useState(() => {
    let currentValue;
    //
    try {
      currentValue = JSON.parse(
        localStorage.getItem(key) || String(defaultValue)
      );
    } catch (error) {
      currentValue = defaultValue;
    }
    //
    return currentValue;
  });
  //
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
    //
    // no effect cleanup, to stored value will never get deleted
    // unless the user manually reset's its browser's cache
    //
  }, [value, key]);
  //
  const onRemoveKey = () => localStorage.removeItem(key); // explicit cleanup
  //
  return [value, setValue, onRemoveKey];
};

export default useLocalStorage;
