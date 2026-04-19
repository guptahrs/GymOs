import { useState } from "react";

export default function useSnackbar() {
  const [snackbar, setSnackbar] = useState({
    message: "",
    type: "info",
  });

  const showSnackbar = (message, type = "info") => {
    setSnackbar({ message, type });
  };

  const hideSnackbar = () => {
    setSnackbar({ message: "", type: "info" });
  };

  return {
    snackbar,
    showSnackbar,
    hideSnackbar,
  };
}