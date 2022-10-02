import { useCallback, useEffect, useState } from "react";

import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../../utils/firebase/provider";
import { unzipBuffer } from "../../utils/deflate";

//
// Downloads a binary file from a Firestore Bucket
// specified by the url. (e.g data/hgt/N42E011.hgt.zip)
//
const useFirestoreDocument = (url: string) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<ArrayBuffer | null>(null);
  //
  const onSuccess = (ab: ArrayBuffer | null) => {
    setLoading(false);
    setData(ab);
  };

  const onError = (error: Error) => {
    setData(null);
    setLoading(false);
  };
  //
  const fetchApi = useCallback((url: string) => {
    if (!storage) return;
    //
    if (url) {
      const pathReference = ref(storage, url);
      //
      console.log("accesing", url, pathReference);
      //
      getDownloadURL(pathReference)
        .then((url) => {
          console.log("download url", url, "downloading...");
          //
          fetch(url)
            .then((res) => res.arrayBuffer())
            .then(async (blob) => {
              console.log("downloaded blob", blob);
              //
              return await unzipBuffer(blob); // decompress result
            })
            .then((unzipped) => {
              console.log("unzipped", unzipped);
              onSuccess(unzipped);
            });
        })
        .catch((error) => {
          // Handle any errors
          console.log("failed fbs", error);
          onError(error);
        });
    }
  }, []);
  //
  useEffect(() => {
    setLoading(true);
    fetchApi(url);
  }, [fetchApi, url]);
  //
  return { loading, data };
};

export default useFirestoreDocument;
