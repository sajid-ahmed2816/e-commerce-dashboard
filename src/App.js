import {
  BrowserRouter,
  Navigate,
  Outlet,
  Routes,
  Route,
} from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material";
import colors from "./styles/colors";
import adminRoutes from "./routes/admin.routes";
import { Layout } from "./layouts/Layout";

const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
      contrastText: "#ffffff",
    },
    secondary: {
      main: colors.secondary,
      contrastText: "#ffffff",
    },
    typography: {
      fontFamily: ["Roboto", "sans-serif"].join(","),
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {adminRoutes.map((item, index) => (
              <Route key={index} path={item.path} element={item.component} />
            ))}
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
