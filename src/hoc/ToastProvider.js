import { Alert, Snackbar } from "@mui/material";
import ToastContext from "../context/ToastContext";
import useProvideToast from "../hooks/useProvideToast";
import colors from "../assets/styles/colors";

function ToastProvider({ children }) {
  const { toast, showToast, handleClose } = useProvideToast();
  return (
    <ToastContext.Provider value={{ showToast, handleClose }}>
      {children}
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleClose} severity={toast.severity} variant="outlined" sx={{ background: colors.white }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};

export default ToastProvider;