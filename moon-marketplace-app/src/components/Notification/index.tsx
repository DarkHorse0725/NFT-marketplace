import React from "react";
import { Snackbar, Alert, AlertTitle } from "@mui/material";
import { isEmpty } from "../../helpers/check";

interface Props {
  open: boolean;
  onClose: any;
  message: string;
}

const Notification: React.FC<Props> = (props) => {
  return (
    <Snackbar
      open={props.open}
      autoHideDuration={4000}
      onClose={props.onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" } as any}
    >
      <Alert
        onClose={props.onClose}
        severity="error"
        sx={{ width: "100%", maxWidth: "450px", overflowX: "hidden" }}
        variant="filled"
      >
        <AlertTitle>Error</AlertTitle>
        {props.message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
