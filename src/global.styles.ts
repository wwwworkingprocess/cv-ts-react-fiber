import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
body {
    margin: 0;
    padding: 20px 40px;
    font-family: "Open Sans", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    @media screen and (max-width: 800px) {
        padding: 10px;
    }
  }
  
  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New",
      monospace;
  }
  
  a {
    text-decoration: none;
    color: gold;
  }
  
  * {
    box-sizing: border-box;
  }  
`;

export default GlobalStyle;
