import React from "react";
import { ethers } from "ethers";
import { useAccount, useContractRead } from "wagmi";
import { Token } from "../../contracts/config";
import Logo from "../../assets/image/logo.png";
import { Box } from "@mui/system";

const BalanceChip: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { data } = useContractRead({
    address: Token.address[137],
    abi: Token.abi,
    functionName: "balanceOf",
    args: [address],
    watch: true,
  });

  return isConnected && ethers.BigNumber.isBigNumber(data) ? (
    <Box
      sx={{
        borderRadius: "50rem",
        border: "1px solid #8e8e8e",
        p: { xs: "3px 8px", md: "9px 15px" },
      }}
    >
      <Box
        component={"img"}
        src={Logo}
        sx={{
          width: { xs: "17px", md: "23px" },
          marginRight: {
            xs: "8px",
            md: "15px",
          },
        }}
      ></Box>
      <Box
        component={"span"}
        sx={{ verticalAlign: "middle", fontSize: { xs: "80%", md: "100%" } }}
      >
        {parseFloat(ethers.utils.formatEther(data)).toFixed(2)}
      </Box>
    </Box>
  ) : null;
};

export default BalanceChip;
