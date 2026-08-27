import React from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Text,
  Icon,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiAlertTriangle, FiTrash2, FiLogOut, FiX } from "react-icons/fi";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  isLoading = false,
  ...props
}) => {
  const cancelRef = React.useRef();
  const headerColor = useColorModeValue("gray.800", "white");
  const bodyColor = useColorModeValue("gray.600", "gray.300");

  const getVariantConfig = (variant) => {
    switch (variant) {
      case "danger":
        return {
          icon: FiTrash2,
          iconColor: "red.500",
          confirmColorScheme: "red",
          title: title || "Delete Item",
          message:
            message ||
            "This action cannot be undone. Are you sure you want to delete this item?",
        };
      case "logout":
        return {
          icon: FiLogOut,
          iconColor: "orange.500",
          confirmColorScheme: "orange",
          title: title || "Sign Out",
          message:
            message || "Are you sure you want to sign out of your account?",
        };
      case "cancel":
        return {
          icon: FiX,
          iconColor: "gray.500",
          confirmColorScheme: "gray",
          title: title || "Cancel Action",
          message:
            message ||
            "Are you sure you want to cancel? Any unsaved changes will be lost.",
        };
      default:
        return {
          icon: FiAlertTriangle,
          iconColor: "yellow.500",
          confirmColorScheme: "yellow",
          title,
          message,
        };
    }
  };

  const config = getVariantConfig(variant);

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      {...props}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader
            fontSize="lg"
            fontWeight="bold"
            color={headerColor}
          >
            <HStack spacing={3}>
              <Icon as={config.icon} color={config.iconColor} boxSize={5} />
              <Text>{config.title}</Text>
            </HStack>
          </AlertDialogHeader>

          <AlertDialogBody color={bodyColor}>{config.message}</AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} isDisabled={isLoading}>
              {cancelText}
            </Button>
            <Button
              colorScheme={config.confirmColorScheme}
              onClick={onConfirm}
              ml={3}
              isLoading={isLoading}
              loadingText="Processing..."
            >
              {confirmText}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default ConfirmDialog;
