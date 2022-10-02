declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test";
    //
    readonly REACT_APP_FIREBASE_ENABLED: "TRUE" | "FALSE";
    readonly REACT_APP_FIREBASE_PROJECT_ID: string;
    readonly REACT_APP_FIREBASE_AUTH_DOMAIN: string;
    readonly REACT_APP_FIREBASE_STORAGE_BUCKET: string;
    readonly REACT_APP_FIREBASE_API_KEY: string;
    readonly REACT_APP_FIREBASE_APP_ID: string;
    readonly REACT_APP_FIREBASE_MESSAGING_SENDER_ID: string;
  }
}

declare module "*.svg" {
  import React = require("react");
  export const ReactComponent: React.FC<React.SVGProps<SVGAElement>>;
  const src: string;
  export default src;
}
