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

const MIME_TYPE_ZIP = "application/x-zip-compressed";

/**
 * Creating a zip Blob, from the provided ArrayBuffer
 *
 * @param buffer The ArrayBuffer containing the 'compressed bytes'.
 * @returns A zip Blob instance with the appropriate mime-type
 */
export const createZipBlob = (buffer: ArrayBuffer) =>
  new Blob([new Uint8Array(buffer)], { type: MIME_TYPE_ZIP });

/**
 * Returns a ZipReader instance for the provided Blob.
 * This reader needs to be closed explicitly after use
 *
 * @param zip A zip Blob instance with the appropriate mime-type
 * @returns An open ZipReader instance.
 */
const onArchiveOpen = (zip: Blob): Zip => new ZipReader(new BlobReader(zip));

/**
 * Creating a promise of ArrayBuffer to be used for write operation
 *
 * @returns A writable stream instance and a promise that upon invoking writes to the stream.
 */
const createOutputStream = () => {
  const ts = new TransformStream();
  const response = new Response(ts.readable).arrayBuffer();
  //
  return { stream: ts, promise: response };
};

/**
 * Closing the archive
 *
 * @param reader A ZipReader instance
 * @returns A promise of the close operation.
 */
const onArchiveClose = async (reader: ZipReader<unknown>) =>
  await reader.close(); //TODO: error handling

/**
 * Returns every entry from the archive, using the provided reader
 *
 * @param r A ZipReader<unknown> instance
 * @returns A promise of an array containing every entry.
 */
const retrieveEntries = async (r: Zip) => await r.getEntries();

/**
 * Returns the first entry from the archive, using the provided reader
 *
 * @param r A ZipReader<unknown> instance
 * @returns A promise that resolves in the first entry.
 */
const retrieveFirstEntry = async (r: Zip): Promise<Entry | undefined> =>
  ((await retrieveEntries(r)) ?? [])[0];

/**
 * Type guarding valid entries
 *
 * @param e An entry that is either a directory or a file or errorous
 * @returns True when the provided entity is valid
 */
const isValidEntry = (e: Entry | undefined): e is ValidEntry =>
  e !== undefined && e?.getData !== undefined;

const retrieveValidEntries = async (r: Zip) =>
  (await (
    await r.getEntries()
  ).filter((e) => isValidEntry(e))) as Array<ValidEntry>;

/**
 * Returns a promise of unzipping the first valid entry
 * from the provided zip blob
 *
 * @param zipFileBlob The Blob file to read the data from
 * @param ignoreDirectories When set to false, directories or empty buffers can be returned
 *
 * @returns A promise of the unzip operation, that resolves in an ArrayBuffer
 */
export const unzipFirstEntry = async (
  zipFileBlob: Blob,
  ignoreDirectories: boolean = true
) => {
  let p: Promise<ArrayBuffer> | undefined;
  const zipReader = onArchiveOpen(zipFileBlob);
  //
  try {
    const { stream, promise } = createOutputStream();
    //
    if (!ignoreDirectories) {
      const first = await retrieveFirstEntry(zipReader);
      //
      if (isValidEntry(first)) await first.getData(stream.writable);
      //
      p = promise;
    } else {
      const first = await retrieveFirstEntry(zipReader);
      await first?.getData?.(stream.writable);
      p = promise;
    }
  } catch (ex) {
    console.error("Error during unzip", ex);
    p = Promise.resolve(new ArrayBuffer(0));
  } finally {
    await onArchiveClose(zipReader);
  }
  //
  return p;
};

/**
 * Returns a list of filenames with a promise of unzipping
 * every non-directory like entry in the provided zip blob.
 *
 * @returns A list of filename with a single promise
 * [files] contains the filenames without path
 * [results] is a single promise resolving in an array of ArrayBuffers
 */
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

/**
 * Inflates a zip file, containing a single (file) entry
 */
export const unzipBuffer = (ab: ArrayBuffer): Promise<ArrayBuffer> =>
  unzipFirstEntry(createZipBlob(ab));

/**
 * Inflates a zip file, containing multiple entries
 * (Excludes directories and empty buffers)
 */
export const unzipBufferMulti = (
  ab: ArrayBuffer
): Promise<{ files: string[]; results: Promise<Array<ArrayBuffer>> }> =>
  unzipEntries(createZipBlob(ab));
