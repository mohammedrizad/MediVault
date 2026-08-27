import React from "react";
import {
  Box,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";

const LoadingSpinner = ({
  message = "Loading...",
  size = "lg",
  variant = "default",
  color = "blue.500",
  fullPage = false,
  ...props
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");

  const SpinnerComponent = () => (
    <VStack spacing={4} {...props}>
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color={color}
        size={size}
      />
      {message && (
        <Text color={textColor} fontSize="md" textAlign="center">
          {message}
        </Text>
      )}
    </VStack>
  );

  if (fullPage) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg={bgColor}
        display="flex"
        alignItems="center"
        justifyContent="center"
        zIndex={9999}
      >
        <SpinnerComponent />
      </Box>
    );
  }

  if (variant === "overlay") {
    return (
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg={`${bgColor}CC`}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRadius="md"
        zIndex={10}
      >
        <SpinnerComponent />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={8}
      {...props}
    >
      <SpinnerComponent />
    </Box>
  );
};

export default LoadingSpinner;
