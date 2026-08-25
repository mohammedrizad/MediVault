import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import App from "./App";

// Custom theme configuration
const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: "#e6f3ff",
      100: "#bdd9ff",
      200: "#94c0ff",
      300: "#6ba6ff",
      400: "#428cff",
      500: "#1973ff",
      600: "#145acc",
      700: "#0f4199",
      800: "#0a2866",
      900: "#051033",
    },
  },
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: "brand",
      },
      variants: {
        solid: {
          borderRadius: "md",
          fontWeight: "medium",
        },
        outline: {
          borderRadius: "md",
          fontWeight: "medium",
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: "lg",
          boxShadow: "sm",
        },
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: "brand.500",
      },
      variants: {
        outline: {
          field: {
            borderRadius: "md",
          },
        },
      },
    },
    Select: {
      defaultProps: {
        focusBorderColor: "brand.500",
      },
      variants: {
        outline: {
          field: {
            borderRadius: "md",
          },
        },
      },
    },
    Textarea: {
      defaultProps: {
        focusBorderColor: "brand.500",
      },
      variants: {
        outline: {
          borderRadius: "md",
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        fontFamily: "body",
        lineHeight: "base",
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
