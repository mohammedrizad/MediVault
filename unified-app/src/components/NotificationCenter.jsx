import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  HStack,
  VStack,
  Text,
  Badge,
  Icon,
  IconButton,
  Button,
  Divider,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Tooltip,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiAlertCircle,
  FiShield,
  FiSettings,
  FiCheck,
  FiCheckCircle,
} from "react-icons/fi";
import { useNotifications } from "../context/NotificationContext";

// ─── Single notification item ──────────────────────────────────────────
const NotificationItem = ({ notification, onMarkRead, onNavigate }) => {
  const unreadBg = useColorModeValue("blue.50", "blue.900");

  const iconMap = {
    alert: FiAlertCircle,
    access: FiShield,
    system: FiSettings,
  };

  const colorMap = {
    alert: "red.400",
    access: "purple.400",
    system: "blue.400",
  };

  const formatTime = (ts) => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <MenuItem
      bg={notification.read ? "transparent" : unreadBg}
      _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
      onClick={() => {
        if (!notification.read) onMarkRead(notification.id);
        if (notification.link) onNavigate(notification.link);
      }}
      py={3}
      px={4}
      borderRadius="md"
    >
      <HStack spacing={3} w="full" align="start">
        <Icon
          as={iconMap[notification.type] || FiBell}
          color={colorMap[notification.type] || "gray.400"}
          boxSize={5}
          mt={1}
          flexShrink={0}
        />
        <VStack align="start" spacing={0} flex={1} minW={0}>
          <HStack w="full" justify="space-between">
            <Text
              fontSize="sm"
              fontWeight={notification.read ? "normal" : "bold"}
              noOfLines={1}
            >
              {notification.title}
            </Text>
            {!notification.read && (
              <Box
                w="8px"
                h="8px"
                borderRadius="full"
                bg="blue.400"
                flexShrink={0}
              />
            )}
          </HStack>
          <Text fontSize="xs" color="gray.500" noOfLines={2}>
            {notification.message}
          </Text>
          <Text fontSize="xs" color="gray.400" mt={1}>
            {formatTime(notification.timestamp)}
          </Text>
        </VStack>
      </HStack>
    </MenuItem>
  );
};

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["alert", "access", "system"]).isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    read: PropTypes.bool.isRequired,
    link: PropTypes.string,
  }).isRequired,
  onMarkRead: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

// ─── Notification Center (bell + dropdown) ─────────────────────────────
const NotificationCenter = ({ colorScheme }) => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const menuBg = useColorModeValue("white", "gray.700");
  const accentColor = colorScheme === "green" ? "green.400" : "blue.400";

  // Show last 10 notifications
  const recentNotifications = notifications.slice(0, 10);

  const handleNavigate = (link) => {
    if (link) navigate(link);
  };

  return (
    <Menu closeOnSelect={false} placement="bottom-end">
      <Tooltip label={`${unreadCount} unread notifications`}>
        <Box position="relative" display="inline-block">
          <MenuButton
            as={IconButton}
            icon={<FiBell />}
            variant="ghost"
            color="white"
            fontSize="xl"
            aria-label="Notifications"
            _hover={{ bg: "whiteAlpha.200" }}
            _active={{ bg: "whiteAlpha.300" }}
          />
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="-2px"
              right="-2px"
              colorScheme="red"
              borderRadius="full"
              fontSize="xs"
              minW="20px"
              h="20px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              pointerEvents="none"
              zIndex={1}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Box>
      </Tooltip>

      <MenuList
        bg={menuBg}
        maxH="480px"
        overflowY="auto"
        w={{ base: "320px", md: "380px" }}
        boxShadow="xl"
        borderRadius="lg"
        p={0}
      >
        {/* Header */}
        <Box px={4} py={3}>
          <HStack justify="space-between">
            <HStack>
              <Text fontWeight="bold" fontSize="md">
                Notifications
              </Text>
              {unreadCount > 0 && (
                <Badge colorScheme="red" borderRadius="full" fontSize="xs">
                  {unreadCount} new
                </Badge>
              )}
            </HStack>
            {unreadCount > 0 && (
              <Button
                size="xs"
                variant="ghost"
                colorScheme="blue"
                leftIcon={<FiCheckCircle />}
                onClick={markAllAsRead}
              >
                Mark all read
              </Button>
            )}
          </HStack>
        </Box>
        <Divider />

        {/* Notification list */}
        {recentNotifications.length === 0 ? (
          <Box py={8} textAlign="center">
            <Icon as={FiBell} boxSize={8} color="gray.300" mb={2} />
            <Text fontSize="sm" color="gray.500">
              No notifications yet
            </Text>
          </Box>
        ) : (
          <Box py={1}>
            {recentNotifications.map((notif) => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                onMarkRead={markAsRead}
                onNavigate={handleNavigate}
              />
            ))}
          </Box>
        )}

        {/* Footer */}
        {recentNotifications.length > 0 && (
          <>
            <Divider />
            <Box px={4} py={2} textAlign="center">
              <HStack justify="center" spacing={1}>
                <Icon as={FiCheck} color={accentColor} boxSize={3} />
                <Text fontSize="xs" color="gray.500">
                  Showing last {recentNotifications.length} notifications
                </Text>
              </HStack>
            </Box>
          </>
        )}
      </MenuList>
    </Menu>
  );
};

NotificationCenter.propTypes = {
  colorScheme: PropTypes.string,
};

NotificationCenter.defaultProps = {
  colorScheme: "blue",
};

export default NotificationCenter;
