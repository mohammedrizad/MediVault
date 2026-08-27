import React from "react";
import { Button } from "@chakra-ui/react";

const CustomButton = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  isDisabled = false,
  leftIcon,
  rightIcon,
  onClick,
  type = "button",
  width = "auto",
  ...props
}) => {
  const getVariantProps = () => {
    switch (variant) {
      case "primary":
        return {
          colorScheme: "blue",
          variant: "solid",
        };
      case "secondary":
        return {
          colorScheme: "gray",
          variant: "outline",
        };
      case "danger":
        return {
          colorScheme: "red",
          variant: "solid",
        };
      case "ghost":
        return {
          variant: "ghost",
          colorScheme: "blue",
        };
      case "success":
        return {
          colorScheme: "green",
          variant: "solid",
        };
      default:
        return {
          colorScheme: "blue",
          variant: "solid",
        };
    }
  };

  return (
    <Button
      {...getVariantProps()}
      size={size}
      isLoading={isLoading}
      isDisabled={isDisabled}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      onClick={onClick}
      type={type}
      width={width}
      loadingText="Loading..."
      transition="all 0.2s"
      _hover={{
        transform: "translateY(-1px)",
        boxShadow: "lg",
      }}
      _active={{
        transform: "translateY(0)",
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default CustomButton;
