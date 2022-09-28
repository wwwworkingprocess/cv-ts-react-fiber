import { ChangeEvent, useEffect, useRef, useState } from "react";

import { unzipBufferMulti } from "../../../utils/deflate";

const FileUploader = ({ onFileSelect }: any) => {
  const fileInput = useRef<HTMLInputElement>(null!);
  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => onFileSelect(e);
  //
  return (
    <span className="file-uploader" style={{ display: "inline" }}>
      <input
        ref={fileInput}
        type="file"
        onChange={handleFileInput}
        style={{ display: "none" }}
      />
      <button
        onClick={(e) => fileInput.current && fileInput.current.click()}
        className="btn btn-primary"
      >
        Upload
      </button>
    </span>
  );
};

const useFileReader = ({ setResult }: any) => {
  const fileReader = new FileReader();

  const onFileReaderLoad = async (e: any) => {
    const data = fileReader.result as ArrayBuffer;
    //
    if (data) {
      const i8 = new Int8Array(data);
      const u = unzipBufferMulti(i8);
      //
      const result = await u; // only parsing for filenames, not unzipping yet
      //
      setResult(result);
    }
  };

  fileReader.onload = onFileReaderLoad;
  //
  return fileReader;
};

const FileInputZip = ({ setZipResults, setFilenames }: any) => {
  const [, setSelectedFile] = useState<File>();
  const [error, setError] = useState<string>();
  //
  const [rawUnzipOpenResult, setRawUnzipOpenResult] = useState<{
    files: Array<string>;
    results: Promise<Array<ArrayBuffer>>;
  }>();
  //
  const fileReader = useFileReader({ setResult: setRawUnzipOpenResult });

  //
  // Filenames are accessible before inflate
  //
  useEffect(() => {
    if (rawUnzipOpenResult) setFilenames(rawUnzipOpenResult.files);
  }, [rawUnzipOpenResult, setFilenames]);

  //
  // Decompressing provided zip file
  //
  useEffect(() => {
    const asyncUnzip = async () => {
      if (rawUnzipOpenResult) {
        console.log("unzipping contents...");
        //
        const inflatedResults = await rawUnzipOpenResult.results;
        //
        console.log("unzipping finished...");
        //
        setZipResults(inflatedResults);
      } else console.log("no file selected");
    };
    //
    asyncUnzip();
    //
    return () => {
      console.log("freeing up memory on onmount");
      setZipResults(undefined);
    };
  }, [rawUnzipOpenResult, setZipResults]); //todo decompose effect

  //
  // Select a zip file, max 50 MB
  //
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const types = ["application/x-zip-compressed"];
    //
    if (e) {
      let selectedFile = e.target.files?.[0];
      if (selectedFile) {
        if (!types.includes(selectedFile.type)) {
          alert(selectedFile.type + "|" + selectedFile.size);
        }
        //  if (types.includes(selectedFile.type)) {
        if (selectedFile.size < 1024 * 1024 * 50) {
          setError(undefined);
          setSelectedFile(selectedFile);
          //
          fileReader.readAsArrayBuffer(selectedFile);
        } else {
          setSelectedFile(undefined);
          setError("Please select a smaller input file (max 50mb)");
        }
        // } else {
        //   setSelectedFile(undefined);
        //   setError("Please select a zip file with a tileset");
        // }
      }
    }
  };
  //
  return (
    <>
      or
      <FileUploader onFileSelect={handleChange} />
      {error && error} a file
    </>
  );
};

export default FileInputZip;
