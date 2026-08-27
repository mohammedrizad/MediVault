import React from "react";
import {
  Box,
  VStack,
  Text,
  Heading,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiInbox, FiUser, FiFileText, FiDatabase } from "react-icons/fi";
import CustomButton from "./CustomButton";

const EmptyState = ({
  title = "No data found",
  description = "There are no items to display at the moment.",
  icon = FiInbox,
  actionLabel,
  onAction,
  variant = "default",
  children,
  ...props
}) => {
  const textColor = useColorModeValue("gray.600", "gray.300");
  const iconColor = useColorModeValue("gray.400", "gray.500");
  const bgColor = useColorModeValue("gray.50", "gray.700");

  const getContextualIcon = (variant) => {
    switch (variant) {
      case "patients":
        return FiUser;
      case "doctors":
        return FiUser;
      case "records":
        return FiFileText;
      case "data":
        return FiDatabase;
      default:
        return icon;
    }
  };

  const getContextualContent = (variant) => {
    switch (variant) {
      case "patients":
        return {
          title: "No patients found",
          description:
            "Start by registering your first patient to manage their medical records.",
        };
      case "doctors":
        return {
          title: "No doctors found",
          description:
            "Add doctors to your system to enable patient consultations.",
        };
      case "nurses":
        return {
          title: "No nurses found",
          description:
            "Register nurses to assist with patient care and management.",
        };
      case "records":
        return {
          title: "No medical records",
          description:
            "Patient medical records will appear here once they are created.",
        };
      case "appointments":
        return {
          title: "No appointments scheduled",
          description: "Schedule appointments to manage patient visits.",
        };
      default:
        return { title, description };
    }
  };

  const IconComponent = getContextualIcon(variant);
  const content = getContextualContent(variant);

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      p={12}
      textAlign="center"
      borderWidth="2px"
      borderStyle="dashed"
      borderColor="gray.300"
      {...props}
    >
      <VStack spacing={6}>
        <Icon as={IconComponent} boxSize={16} color={iconColor} />

        <VStack spacing={3}>
          <Heading size="md" color={textColor}>
            {content.title}
          </Heading>
          <Text color={textColor} maxW="md" lineHeight="tall">
            {content.description}
          </Text>
        </VStack>

        {actionLabel && onAction && (
          <CustomButton onClick={onAction} colorScheme="blue" variant="solid">
            {actionLabel}
          </CustomButton>
        )}

        {children}
      </VStack>
    </Box>
  );
};

export default EmptyState;
