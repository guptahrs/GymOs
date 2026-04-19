import { createContext, useContext, useState } from "react";
import Snackbar from "../components/Snackbar";

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