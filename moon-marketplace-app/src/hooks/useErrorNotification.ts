import { useContext, createContext } from 'react'

type ErrorNotificationType = {
  error: string;
  setError: any;
};

export const ErrorNotification = createContext<ErrorNotificationType>({
  error: '',
  setError: () => {},
});

const useErrorNotification = () => {
  const context = useContext<ErrorNotificationType>(ErrorNotification)
  return context
}

export default useErrorNotification