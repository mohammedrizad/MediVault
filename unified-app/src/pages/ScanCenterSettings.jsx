import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Button,
  SimpleGrid,
  Input,
  Select,
  Switch,
  FormControl,
  FormLabel,
  Textarea,
  useColorModeValue,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Divider,
} from "@chakra-ui/react";
import {
  FiSettings,
  FiUsers,
  FiBell,
  FiShield,
  FiDatabase,
  FiWifi,
  FiMonitor,
  FiSave,
  FiRefreshCw,
  FiLock,
  FiMail,
  FiCalendar,
} from "react-icons/fi";

const defaultGeneralSettings = {
  centerName: "MediVault Imaging Center",
  centerCode: "MIC-001",
  address: "123 Healthcare Ave, Medical District",
  phone: "+1 (555) 123-4567",
  email: "contact@medivault-imaging.com",
  operatingHours: "Mon-Fri: 7:00 AM - 8:00 PM, Sat: 8:00 AM - 6:00 PM",
  timezone: "America/New_York",
};

const defaultNotificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  urgentAlerts: true,
  maintenanceReminders: true,
  reportCompletionAlerts: true,
  appointmentReminders: true,
  equipmentAlerts: true,
};

const defaultSecuritySettings = {
  twoFactorAuth: true,
  sessionTimeout: "30",
  passwordExpiry: "90",
  loginAttempts: "3",
  dataEncryption: true,
  auditLogging: true,
  backupFrequency: "daily",
};

const defaultSystemSettings = {
  autoBackup: true,
  maintenanceMode: false,
  debugMode: false,
  apiRateLimit: "1000",
  storageQuota: "500",
  retentionPeriod: "7",
  compressionEnabled: true,
};

const ScanCenterSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const { currentUser } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

  // Settings state
  const [generalSettings, setGeneralSettings] = useState({
    ...defaultGeneralSettings,
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser?.id) return;
      try {
        const res = await fetch(`${API_URL}/scan/getall`);
        const data = await res.json();
        const record = (data.result || []).find((r) => r._id === currentUser.id);
        if (record) {
          setGeneralSettings((prev) => ({
            ...prev,
            centerName: record.username || prev.centerName,
            address: record.Current_Address || prev.address,
            email: record.Email_Address || prev.email,
          }));
        }
      } catch (err) {
        console.error("Failed to load scan center profile:", err);
      }
    };
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const [notificationSettings, setNotificationSettings] = useState({
    ...defaultNotificationSettings,
  });

  const [securitySettings, setSecuritySettings] = useState({
    ...defaultSecuritySettings,
  });

  const [systemSettings, setSystemSettings] = useState({
    ...defaultSystemSettings,
  });

  const [equipmentConfig, setEquipmentConfig] = useState([
    {
      id: 1,
      name: "MRI Machine 1",
      status: "Active",
      autoScheduling: true,
      maintenanceInterval: 30,
      calibrationInterval: 7,
      maxDailyScans: 20,
    },
    {
      id: 2,
      name: "CT Scanner 1",
      status: "Active",
      autoScheduling: true,
      maintenanceInterval: 15,
      calibrationInterval: 3,
      maxDailyScans: 35,
    },
    {
      id: 3,
      name: "X-Ray Room 1",
      status: "Maintenance",
      autoScheduling: false,
      maintenanceInterval: 10,
      calibrationInterval: 1,
      maxDailyScans: 50,
    },
  ]);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const authToken = localStorage.getItem("authToken");
      const res = await fetch(`${API_URL}/scan/update/${currentUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          username: generalSettings.centerName,
          Current_Address: generalSettings.address,
          Email_Address: generalSettings.email,
        }),
      });
      const data = await res.json();
      if (data.msg !== "Scan center updated successfully") {
        throw new Error(data.msg || "Failed to save settings");
      }
      onOpen();
    } catch (err) {
      toast({
        title: "Failed to save settings",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "green";
      case "Maintenance":
        return "orange";
      case "Offline":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          Scan Center Settings
        </Text>
        <Text color="gray.600">
          Configure and manage scan center operations, security, and equipment
        </Text>
      </Box>

      <Tabs>
        <TabList>
          <Tab>General</Tab>
          <Tab>Notifications</Tab>
          <Tab>Security</Tab>
          <Tab>System</Tab>
          <Tab>Equipment</Tab>
        </TabList>

        <TabPanels>
          {/* General Settings */}
          <TabPanel>
            <Card>
              <CardHeader>
                <HStack>
                  <FiSettings />
                  <Text fontSize="lg" fontWeight="semibold">
                    General Configuration
                  </Text>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Center Name</FormLabel>
                      <Input
                        value={generalSettings.centerName}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            centerName: e.target.value,
                          })
                        }
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Center Code</FormLabel>
                      <Input
                        value={generalSettings.centerCode}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            centerCode: e.target.value,
                          })
                        }
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Phone Number</FormLabel>
                      <Input
                        value={generalSettings.phone}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            phone: e.target.value,
                          })
                        }
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Email Address</FormLabel>
                      <Input
                        type="email"
                        value={generalSettings.email}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            email: e.target.value,
                          })
                        }
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Timezone</FormLabel>
                      <Select
                        value={generalSettings.timezone}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            timezone: e.target.value,
                          })
                        }
                      >
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">
                          Pacific Time
                        </option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>

                  <FormControl>
                    <FormLabel>Address</FormLabel>
                    <Textarea
                      value={generalSettings.address}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          address: e.target.value,
                        })
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Operating Hours</FormLabel>
                    <Input
                      value={generalSettings.operatingHours}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          operatingHours: e.target.value,
                        })
                      }
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Notification Settings */}
          <TabPanel>
            <Card>
              <CardHeader>
                <HStack>
                  <FiBell />
                  <Text fontSize="lg" fontWeight="semibold">
                    Notification Preferences
                  </Text>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <VStack align="stretch" spacing={4}>
                      <Text fontWeight="medium" color="gray.600">
                        Communication
                      </Text>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0" flex="1">
                          Email Notifications
                        </FormLabel>
                        <Switch
                          isChecked={notificationSettings.emailNotifications}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              emailNotifications: e.target.checked,
                            })
                          }
                        />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0" flex="1">
                          SMS Notifications
                        </FormLabel>
                        <Switch
                          isChecked={notificationSettings.smsNotifications}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              smsNotifications: e.target.checked,
                            })
                          }
                        />
                      </FormControl>
                    </VStack>

                    <VStack align="stretch" spacing={4}>
                      <Text fontWeight="medium" color="gray.600">
                        Alerts
                      </Text>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0" flex="1">
                          Urgent Alerts
                        </FormLabel>
                        <Switch
                          isChecked={notificationSettings.urgentAlerts}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              urgentAlerts: e.target.checked,
                            })
                          }
                        />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0" flex="1">
                          Equipment Alerts
                        </FormLabel>
                        <Switch
                          isChecked={notificationSettings.equipmentAlerts}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              equipmentAlerts: e.target.checked,
                            })
                          }
                        />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0" flex="1">
                          Maintenance Reminders
                        </FormLabel>
                        <Switch
                          isChecked={notificationSettings.maintenanceReminders}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              maintenanceReminders: e.target.checked,
                            })
                          }
                        />
                      </FormControl>
                    </VStack>
                  </SimpleGrid>

                  <Divider />

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0" flex="1">
                        Report Completion Alerts
                      </FormLabel>
                      <Switch
                        isChecked={notificationSettings.reportCompletionAlerts}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            reportCompletionAlerts: e.target.checked,
                          })
                        }
                      />
                    </FormControl>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0" flex="1">
                        Appointment Reminders
                      </FormLabel>
                      <Switch
                        isChecked={notificationSettings.appointmentReminders}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            appointmentReminders: e.target.checked,
                          })
                        }
                      />
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Security Settings */}
          <TabPanel>
            <Card>
              <CardHeader>
                <HStack>
                  <FiShield />
                  <Text fontSize="lg" fontWeight="semibold">
                    Security Configuration
                  </Text>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0" flex="1">
                        Two-Factor Authentication
                      </FormLabel>
                      <Switch
                        isChecked={securitySettings.twoFactorAuth}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            twoFactorAuth: e.target.checked,
                          })
                        }
                      />
                    </FormControl>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0" flex="1">
                        Data Encryption
                      </FormLabel>
                      <Switch
                        isChecked={securitySettings.dataEncryption}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            dataEncryption: e.target.checked,
                          })
                        }
                      />
                    </FormControl>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel mb="0" flex="1">
                        Audit Logging
                      </FormLabel>
                      <Switch
                        isChecked={securitySettings.auditLogging}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            auditLogging: e.target.checked,
                          })
                        }
                      />
                    </FormControl>
                  </SimpleGrid>

                  <Divider />

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl>
                      <FormLabel>Session Timeout (minutes)</FormLabel>
                      <Select
                        value={securitySettings.sessionTimeout}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            sessionTimeout: e.target.value,
                          })
                        }
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Password Expiry (days)</FormLabel>
                      <Select
                        value={securitySettings.passwordExpiry}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            passwordExpiry: e.target.value,
                          })
                        }
                      >
                        <option value="30">30 days</option>
                        <option value="60">60 days</option>
                        <option value="90">90 days</option>
                        <option value="180">180 days</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Max Login Attempts</FormLabel>
                      <Select
                        value={securitySettings.loginAttempts}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            loginAttempts: e.target.value,
                          })
                        }
                      >
                        <option value="3">3 attempts</option>
                        <option value="5">5 attempts</option>
                        <option value="10">10 attempts</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Backup Frequency</FormLabel>
                      <Select
                        value={securitySettings.backupFrequency}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            backupFrequency: e.target.value,
                          })
                        }
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* System Settings */}
          <TabPanel>
            <Card>
              <CardHeader>
                <HStack>
                  <FiDatabase />
                  <Text fontSize="lg" fontWeight="semibold">
                    System Configuration
                  </Text>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <VStack align="stretch" spacing={4}>
                      <Text fontWeight="medium" color="gray.600">
                        System Options
                      </Text>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0" flex="1">
                          Auto Backup
                        </FormLabel>
                        <Switch
                          isChecked={systemSettings.autoBackup}
                          onChange={(e) =>
                            setSystemSettings({
                              ...systemSettings,
                              autoBackup: e.target.checked,
                            })
                          }
                        />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0" flex="1">
                          Maintenance Mode
                        </FormLabel>
                        <Switch
                          colorScheme="orange"
                          isChecked={systemSettings.maintenanceMode}
                          onChange={(e) =>
                            setSystemSettings({
                              ...systemSettings,
                              maintenanceMode: e.target.checked,
                            })
                          }
                        />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0" flex="1">
                          Debug Mode
                        </FormLabel>
                        <Switch
                          colorScheme="red"
                          isChecked={systemSettings.debugMode}
                          onChange={(e) =>
                            setSystemSettings({
                              ...systemSettings,
                              debugMode: e.target.checked,
                            })
                          }
                        />
                      </FormControl>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel mb="0" flex="1">
                          Data Compression
                        </FormLabel>
                        <Switch
                          isChecked={systemSettings.compressionEnabled}
                          onChange={(e) =>
                            setSystemSettings({
                              ...systemSettings,
                              compressionEnabled: e.target.checked,
                            })
                          }
                        />
                      </FormControl>
                    </VStack>

                    <VStack align="stretch" spacing={4}>
                      <Text fontWeight="medium" color="gray.600">
                        Resource Limits
                      </Text>
                      <FormControl>
                        <FormLabel>API Rate Limit (req/hour)</FormLabel>
                        <Input
                          value={systemSettings.apiRateLimit}
                          onChange={(e) =>
                            setSystemSettings({
                              ...systemSettings,
                              apiRateLimit: e.target.value,
                            })
                          }
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Storage Quota (GB)</FormLabel>
                        <Input
                          value={systemSettings.storageQuota}
                          onChange={(e) =>
                            setSystemSettings({
                              ...systemSettings,
                              storageQuota: e.target.value,
                            })
                          }
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Log Retention (days)</FormLabel>
                        <Input
                          value={systemSettings.retentionPeriod}
                          onChange={(e) =>
                            setSystemSettings({
                              ...systemSettings,
                              retentionPeriod: e.target.value,
                            })
                          }
                        />
                      </FormControl>
                    </VStack>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Equipment Settings */}
          <TabPanel>
            <Card>
              <CardHeader>
                <HStack>
                  <FiMonitor />
                  <Text fontSize="lg" fontWeight="semibold">
                    Equipment Configuration
                  </Text>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {equipmentConfig.map((equipment) => (
                    <Card key={equipment.id} variant="outline">
                      <CardBody>
                        <HStack justify="space-between" mb={4}>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">{equipment.name}</Text>
                            <Badge
                              colorScheme={getStatusColor(equipment.status)}
                            >
                              {equipment.status}
                            </Badge>
                          </VStack>
                          <FormControl
                            display="flex"
                            alignItems="center"
                            w="auto"
                          >
                            <FormLabel mb="0" mr={2}>
                              Auto Scheduling
                            </FormLabel>
                            <Switch
                              isChecked={equipment.autoScheduling}
                              onChange={(e) => {
                                const updated = equipmentConfig.map((eq) =>
                                  eq.id === equipment.id
                                    ? {
                                        ...eq,
                                        autoScheduling: e.target.checked,
                                      }
                                    : eq,
                                );
                                setEquipmentConfig(updated);
                              }}
                            />
                          </FormControl>
                        </HStack>

                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          <FormControl>
                            <FormLabel fontSize="sm">
                              Maintenance Interval (days)
                            </FormLabel>
                            <Input
                              size="sm"
                              value={equipment.maintenanceInterval}
                              onChange={(e) => {
                                const updated = equipmentConfig.map((eq) =>
                                  eq.id === equipment.id
                                    ? {
                                        ...eq,
                                        maintenanceInterval: e.target.value,
                                      }
                                    : eq,
                                );
                                setEquipmentConfig(updated);
                              }}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="sm">
                              Calibration Interval (days)
                            </FormLabel>
                            <Input
                              size="sm"
                              value={equipment.calibrationInterval}
                              onChange={(e) => {
                                const updated = equipmentConfig.map((eq) =>
                                  eq.id === equipment.id
                                    ? {
                                        ...eq,
                                        calibrationInterval: e.target.value,
                                      }
                                    : eq,
                                );
                                setEquipmentConfig(updated);
                              }}
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="sm">Max Daily Scans</FormLabel>
                            <Input
                              size="sm"
                              value={equipment.maxDailyScans}
                              onChange={(e) => {
                                const updated = equipmentConfig.map((eq) =>
                                  eq.id === equipment.id
                                    ? { ...eq, maxDailyScans: e.target.value }
                                    : eq,
                                );
                                setEquipmentConfig(updated);
                              }}
                            />
                          </FormControl>
                        </SimpleGrid>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Save Button */}
      <HStack justify="flex-end" spacing={3}>
        <Button
          variant="outline"
          leftIcon={<FiRefreshCw />}
          onClick={() => {
            setGeneralSettings({ ...defaultGeneralSettings });
            setNotificationSettings({ ...defaultNotificationSettings });
            setSecuritySettings({ ...defaultSecuritySettings });
            setSystemSettings({ ...defaultSystemSettings });
            toast({
              title: "Settings Reset",
              description: "All settings have been restored to defaults",
              status: "info",
              duration: 2000,
              isClosable: true,
            });
          }}
        >
          Reset to Defaults
        </Button>
        <Button
          colorScheme="teal"
          leftIcon={<FiSave />}
          isLoading={isLoading}
          loadingText="Saving..."
          onClick={handleSaveSettings}
        >
          Save All Settings
        </Button>
      </HStack>

      {/* Success Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Settings Saved</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="success">
              <AlertIcon />
              <Box>
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                  All settings have been saved successfully. Changes will take
                  effect immediately.
                </AlertDescription>
              </Box>
            </Alert>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={onClose}>
              Continue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default ScanCenterSettings;
