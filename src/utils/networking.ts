import { TreeNodeNumericProps } from "./tree-helper";

export const responseAsJson = (response: Response) => {
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export const responseAsBlob = (response: Response) => {
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.blob();
};

export const onNetworkError = (reject: any, error: Error) => {
  console.error(error);
  reject("There has been a problem with your fetch operation:", error);
};

//
// Loading country data
//

export const load_labels = (fn: string): Promise<Array<[number, string]>> =>
  new Promise((resolve, reject) => {
    fetch(fn)
      .then(responseAsJson)
      .then((json) => resolve(json as Array<[number, string]>))
      .catch((error) => onNetworkError(reject, error));
  });

export const load_types = (
  fn: string
): Promise<
  Record<
    string,
    { code: number; name: string; p: number | undefined; type: number }
  >
> =>
  new Promise((resolve, reject) => {
    fetch(fn)
      .then(responseAsJson)
      .then((json) =>
        resolve(
          json as Record<
            string,
            { code: number; name: string; p: number | undefined; type: number }
          >
        )
      )
      .catch((error) => onNetworkError(reject, error));
  });
//
export const load_hierarchy = (
  fn: string,
  fn_blob_to_hierarchy: (event: any) => Int32Array
): Promise<Int32Array> =>
  new Promise((resolve, reject) => {
    fetch(fn)
      .then(responseAsBlob)
      .then((blob) => {
        const fileReader = new FileReader();
        //
        fileReader.onload = (event) => resolve(fn_blob_to_hierarchy(event));
        //
        fileReader.readAsArrayBuffer(blob);
      })
      .catch((error) => onNetworkError(reject, error));
  });
//
export const load_nodedata = (
  fn: string,
  fn_blob_to_nodedata: any,
  fn_from_ab: any
): Promise<Array<TreeNodeNumericProps>> =>
  new Promise((resolve, reject) => {
    fetch(fn)
      .then(responseAsBlob)
      .then((blob) => {
        const fileReader = new FileReader();
        fileReader.onload = (event) =>
          resolve(
            fn_blob_to_nodedata(event).map((stripe: Uint8Array) =>
              fn_from_ab(stripe.buffer)
            )
          );
        fileReader.readAsArrayBuffer(blob);
      })
      .catch((error) => onNetworkError(reject, error));
  });
