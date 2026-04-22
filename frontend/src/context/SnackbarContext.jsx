import { createContext, useContext, useState, useEffect } from "react";
import Snackbar from "../components/Snackbar";
import { registerSnackbar, unregisterSnackbar } from "../utils/snackbarService";

const SnackbarContext = createContext();

export const useSnackbar = () => useContext(SnackbarContext);

export function SnackbarProvider({ children }) {
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
  // Register the provider's showSnackbar so non-React modules can call it
  useEffect(() => {
    registerSnackbar(showSnackbar);
    return () => unregisterSnackbar();
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}

      <Snackbar
        message={snackbar.message}
        type={snackbar.type}
        onClose={hideSnackbar}
      />
    </SnackbarContext.Provider>
  );
}
