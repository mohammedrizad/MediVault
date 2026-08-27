import { useState, useEffect, useCallback } from "react";
import { useToast } from "@chakra-ui/react";

const useFetch = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const {
    immediate = true, // Whether to call immediately on mount
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
    retryAttempts = 0,
  } = options;

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      let attempts = 0;
      while (attempts <= retryAttempts) {
        try {
          const result = await apiFunction(...args);
          const responseData = result.data;

          setData(responseData);
          setLoading(false);

          if (showSuccessToast) {
            toast({
              title: "Success",
              description: "Data loaded successfully",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          }

          if (onSuccess) {
            onSuccess(responseData);
          }

          return responseData;
        } catch (err) {
          attempts++;

          if (attempts > retryAttempts) {
            const errorMessage =
              err.response?.data?.message || err.message || "An error occurred";
            setError(errorMessage);
            setLoading(false);

            if (showErrorToast) {
              toast({
                title: "Error",
                description: errorMessage,
                status: "error",
                duration: 5000,
                isClosable: true,
              });
            }

            if (onError) {
              onError(err);
            }

            throw err;
          }

          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
        }
      }
    },
    [
      apiFunction,
      toast,
      onSuccess,
      onError,
      showSuccessToast,
      showErrorToast,
      retryAttempts,
    ]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    setData, // Allow manual data updates
  };
};

export default useFetch;
export { useFetch };
