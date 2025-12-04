import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#050816",
      paper: "#0b1020",
    },
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#ff9800",
    },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily:
      '"Roboto","system-ui","-apple-system","BlinkMacSystemFont","Segoe UI",sans-serif',
  },
});

export default theme;
