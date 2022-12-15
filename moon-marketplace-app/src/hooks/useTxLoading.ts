import { useContext, createContext } from 'react'

type TxLoadingContextType = {
  open: boolean;
  setOpen: any;
};

export const TxLoadingContext = createContext<TxLoadingContextType>({
  open: false,
  setOpen: () => {},
});

const useTxLoading = () => {
  const context = useContext<TxLoadingContextType>(TxLoadingContext)
  return context
}

export default useTxLoading