import { useEffect } from "react";

//
// Change the document's title dynamically
//
export const useTitle = (title: string) => {
  //
  // update the title once the hook is called or title changes
  //
  useEffect(() => {
    const prevTitle = document.title; // store previous value
    //
    document.title = title;
    //
    // restore previous title on effect cleanup
    //
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
};
