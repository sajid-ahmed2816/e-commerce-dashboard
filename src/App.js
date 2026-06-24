import { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Routes,
  Route,
} from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material";
import "@fontsource/comfortaa";
import adminRoutes from "./routes/admin.routes";
import { Layout } from "./layouts/Layout";
import publicRoutes from "./routes/public.routes";
import colors from "./assets/styles/colors";
import { registerServiceWorker, subscribeToPush } from './push-notification';
import "./App.css";

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
  },
  typography: {
    fontFamily: "Comfortaa",
  },
});

function App() {
  useEffect(() => {
    async function initPush() {
      const registration = await registerServiceWorker();
      if (registration) {
        // Check if already subscribed
        const existingSubscription = await registration.pushManager.getSubscription();
        if (!existingSubscription) {
          await subscribeToPush(registration);
        }
      }
    }
    initPush();
  }, []);
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {adminRoutes.map((item, index) => (
              <Route key={index} path={item.path} element={item.component} />
            ))}
          </Route>
          <Route element={<Outlet />}>
            {publicRoutes.map((item, index) => (
              <Route key={index} path={item.path} element={item.component} />
            ))}
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
