import { useState } from "react";

function useProvideToast() {
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const handleClose = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  return {
    toast,
    showToast,
    handleClose
  };
};

export default useProvideToast;