import React, { ComponentClass, FunctionComponent } from "react";

import { Spinner } from "../spinner/spinner.component";

const WithSpinner =
  (
    WrappedComponent: string | FunctionComponent<any> | ComponentClass<any, any>
  ) =>
  ({
    isLoading,
    ...otherProps
  }: {
    isLoading: boolean;
    otherProps?: Record<string, any>;
  }) => {
    return isLoading ? <Spinner /> : <WrappedComponent {...otherProps} />;
  };

export default WithSpinner;
