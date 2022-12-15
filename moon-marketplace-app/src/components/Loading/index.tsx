import React from "react";
import { Backdrop, CircularProgress } from "@mui/material";
import useTxLoading from "../../hooks/useTxLoading";

const TxLoading: React.FC = () => {
  const txLoading = useTxLoading();

  return (
    <Backdrop
      open={txLoading.open}
      sx={{ color: "#fff", zIndex: 100000, flexDirection: "column" }}
    >
      <CircularProgress color="inherit"></CircularProgress>
      <div className="mt-3">Sending Transaction, Please wait: </div>
    </Backdrop>
  );
};

export default TxLoading;
