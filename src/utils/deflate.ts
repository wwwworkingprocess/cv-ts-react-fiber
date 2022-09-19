import { BlobReader, ZipReader } from "@zip.js/zip.js";
import type {
  Entry,
  Writer,
  WritableWriter,
  EntryGetDataOptions,
} from "@zip.js/zip.js";

type Zip = ZipReader<unknown>; // aliasing only
type ValidEntry = Entry & {
  getData: <Type>(
    writer: Writer<Type> | WritableWriter | WritableStream,
    options?: EntryGetDataOptions
  ) => Promise<Type>;
};

const MIME_TYPE_ZIP = "application/octet-stream";

//
// Preparing input (ArrayBuffer -> Blob)
//
export const createZipBlob = (buffer: ArrayBuffer) =>
  new Blob([new Uint8Array(buffer)], { type: MIME_TYPE_ZIP });

//
// Opening archive ( Blob -> ZipReader)
//
const onArchiveOpen = (zip: Blob): Zip => new ZipReader(new BlobReader(zip));

//
// Closing archive
//
const onArchiveClose = async (reader: ZipReader<unknown>) =>
  await reader.close(); //TODO: error handling

//
//
//
const retrieveEntries = async (r: Zip) => await r.getEntries();
const retrieveFirstEntry = async (r: Zip) =>
  ((await retrieveEntries(r)) ?? [])[0];
//
const retrieveValidEntries = async (r: Zip) =>
  (await (await r.getEntries())
    .map((e) => asValidEntry(e))
    .filter((e) => e !== undefined)) as Array<ValidEntry>;

//
// Creating a promise of ArrayBuffer to be used by the invoker
//
const createOutputStream = () => {
  const ts = new TransformStream();
  const response = new Response(ts.readable).arrayBuffer();
  //
  return { stream: ts, promise: response };
};

const asValidEntry = (e: Entry): ValidEntry | undefined =>
  e !== undefined && e?.getData !== undefined ? (e as ValidEntry) : undefined;

export const unzipFirstEntry = async (zipFileBlob: Blob) => {
  const zipReader = onArchiveOpen(zipFileBlob);
  //
  const first = asValidEntry(await retrieveFirstEntry(zipReader));
  //
  const { stream, promise } = createOutputStream();
  //
  if (first) {
    await first.getData(stream.writable);
    // await zipReader.close();
    await onArchiveClose(zipReader);
  }
  //
  return promise;
};

export const unzipEntries = async (zipFileBlob: Blob) => {
  const zipReader = onArchiveOpen(zipFileBlob);
  //
  const entries = await retrieveValidEntries(zipReader);
  //
  const promises = [] as Array<Promise<ArrayBuffer>>;
  const filenames = [] as Array<string>;
  //
  for (const ent of entries) {
    const { stream, promise } = createOutputStream();
    await ent.getData(stream.writable);
    //
    if (!ent.directory) {
      const fn =
        ent.filename.indexOf("/") > 0
          ? ent.filename.split("/").pop()
          : ent.filename;
      //
      if (fn) {
        filenames.push(fn);
        promises.push(promise);
      }
    }
  }
  //
  await onArchiveClose(zipReader);
  //
  return { files: filenames, results: Promise.all(promises) };
};

//
// Inflates a zip file, containing a single (file) entry
//
export const unzipBuffer = (ab: ArrayBuffer): Promise<ArrayBuffer> =>
  unzipFirstEntry(createZipBlob(ab));

//
// Inflates a zip file, containing multiple entries
// (Empty entries, such as directories are also returned)
//
export const unzipBufferMulti = (
  ab: ArrayBuffer
): Promise<{ files: string[]; results: Promise<Array<ArrayBuffer>> }> =>
  unzipEntries(createZipBlob(ab));
