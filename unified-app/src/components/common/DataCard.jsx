import React from "react";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Badge,
  HStack,
  VStack,
  Avatar,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";

const DataCard = ({
  title,
  subtitle,
  data = {},
  avatar,
  status,
  onEdit,
  onDelete,
  onView,
  variant = "default",
  children,
  ...props
}) => {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "green";
      case "inactive":
        return "red";
      case "pending":
        return "yellow";
      default:
        return "gray";
    }
  };

  return (
    <Card
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{
        borderColor: "blue.300",
        transform: "translateY(-2px)",
        boxShadow: "lg",
      }}
      {...props}
    >
      <CardHeader pb={2}>
        <HStack justify="space-between" align="start">
          <HStack spacing={3} flex={1}>
            {avatar && <Avatar size="md" src={avatar} name={title} />}
            <VStack align="start" spacing={1} flex={1}>
              <Heading size="md" noOfLines={1}>
                {title}
              </Heading>
              {subtitle && (
                <Text fontSize="sm" color="gray.500" noOfLines={1}>
                  {subtitle}
                </Text>
              )}
            </VStack>
          </HStack>

          <HStack spacing={1}>
            {status && (
              <Badge colorScheme={getStatusColor(status)} variant="subtle">
                {status}
              </Badge>
            )}

            {onView && (
              <IconButton
                aria-label="View details"
                icon={<FiEye />}
                size="sm"
                variant="ghost"
                colorScheme="blue"
                onClick={onView}
              />
            )}

            {onEdit && (
              <IconButton
                aria-label="Edit"
                icon={<FiEdit />}
                size="sm"
                variant="ghost"
                colorScheme="green"
                onClick={onEdit}
              />
            )}

            {onDelete && (
              <IconButton
                aria-label="Delete"
                icon={<FiTrash2 />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={onDelete}
              />
            )}
          </HStack>
        </HStack>
      </CardHeader>

      <CardBody pt={0}>
        {variant === "detailed" && (
          <VStack align="start" spacing={2}>
            {Object.entries(data).map(([key, value]) => (
              <HStack key={key} justify="space-between" w="full">
                <Text fontSize="sm" fontWeight="medium" color="gray.600">
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                  :
                </Text>
                <Text fontSize="sm" textAlign="right">
                  {value || "N/A"}
                </Text>
              </HStack>
            ))}
          </VStack>
        )}

        {children}
      </CardBody>
    </Card>
  );
};

export default DataCard;
