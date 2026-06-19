import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Alert, Snackbar } from "@mui/material";
import type { AlertColor } from "@mui/material";

export type NotificationSeverity = AlertColor;

export type Notify = (
  message: string,
  severity?: NotificationSeverity
) => void;

interface NotificationState {
  open: boolean;
  message: string;
  severity: NotificationSeverity;
}

interface ChildrenProps {
  children: React.ReactNode;
}

const AUTO_HIDE_DURATION = 6000;

const NotificationContext = createContext<Notify | undefined>(undefined);

export const NotificationProvider: React.FC<ChildrenProps> = ({ children }) => {
  const [state, setState] = useState<NotificationState>({
    open: false,
    message: "",
    severity: "error",
  });

  const notify = useCallback<Notify>((message, severity = "error") => {
    setState({ open: true, message, severity });
  }, []);

  const handleClose = useCallback(
    (_event?: React.SyntheticEvent | Event, reason?: string): void => {
      if (reason === "clickaway") return;
      setState((prev) => ({ ...prev, open: false }));
    },
    []
  );

  const value = useMemo<Notify>(() => notify, [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={AUTO_HIDE_DURATION}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={state.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = (): Notify => {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error(
      "useNotification deve ser usado dentro de um NotificationProvider"
    );
  }

  return context;
};
