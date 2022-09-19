import { useEffect, useState } from "react";
import {
  changeEndianness,
  normalizeElevationData,
  removeLastRowAndColumn,
} from "../../../utils/srtm";

// Retrieving a HGT format heightmap file from the specified location
//
// - original dimension is 1201x1201
// - output dimension is 1200x1200
// - min elevation is MIN_ACCEPTED_HEIGHT
//
const useHgtSource = (url: string) => {
  const [value, setValue] = useState<Int16Array | undefined>();

  //
  // Loading a remote HGT file and normalizing it for use
  //
  useEffect(() => {
    if (url) {
      fetch(url)
        .then((res) => res.arrayBuffer())
        .then(removeLastRowAndColumn)
        .then(changeEndianness)
        .then(normalizeElevationData)
        .then(setValue);
    }
  }, [url]);

  return value;
};

export default useHgtSource;
