import React, { useState, useCallback } from "react";
import {
  Box,
  Button,
  VStack,
  HStack,
  Icon,
  useToast,
  Heading,
  Text,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Spinner,
  Center,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  CloseButton,
  useColorModeValue,
  SimpleGrid,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Pill,
  TrendingUp,
  Info,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DrugMultiSelect from "./DrugMultiSelect";
import { checkDrugInteractions } from "../services/drugService.js";

const DrugSafetyChecker = () => {
  const { currentUser } = useAuth();
  const toast = useToast();
  const [selectedMedications, setSelectedMedications] = useState([]);
  const [newDrug, setNewDrug] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const pillBg = useColorModeValue("blue.50", "blue.900");
  const pillBorder = useColorModeValue("blue.200", "blue.700");

  // Severity Configuration
  const severityConfig = {
    Critical: {
      color: "red.600",
      bgColor: "red.50",
      textColor: "red.800",
      borderColor: "red.300",
      icon: AlertTriangle,
    },
    Moderate: {
      color: "orange.600",
      bgColor: "orange.50",
      textColor: "orange.800",
      borderColor: "orange.300",
      icon: AlertCircle,
    },
    Minor: {
      color: "yellow.600",
      bgColor: "yellow.50",
      textColor: "yellow.800",
      borderColor: "yellow.300",
      icon: Info,
    },
    Safe: {
      color: "green.600",
      bgColor: "green.50",
      textColor: "green.800",
      borderColor: "green.300",
      icon: CheckCircle,
    },
  };

  const handleRemoveMedication = (drugId) => {
    setSelectedMedications((prev) => prev.filter((drug) => drug.id !== drugId));
  };

  const handleAddMedication = (drug) => {
    const isDuplicate = selectedMedications.some((m) => m.id === drug.id);
    if (isDuplicate) {
      toast({
        title: "Already added",
        description: `${drug.name} is already in your list`,
        status: "warning",
        duration: 2000,
      });
      return;
    }
    setSelectedMedications((prev) => [...prev, drug]);
  };

  const handleCheckInteractions = useCallback(async () => {
    if (!newDrug.trim()) {
      toast({
        title: "Error",
        description: "Please enter a drug name to check",
        status: "error",
        duration: 2000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const medicationNames = selectedMedications.map((m) => m.name);
      const interactionResult = await checkDrugInteractions({
        patientId: currentUser?.id || "unknown",
        medications: medicationNames,
        newDrug: newDrug.trim(),
      });

      setResult(interactionResult);

      const statusMap = {
        Safe: { status: "success", title: "Drug is Safe" },
        Caution: { status: "warning", title: "Caution Required" },
        Danger: { status: "error", title: "Drug is Dangerous" },
      };

      const notification = statusMap[interactionResult.safetyStatus] || {
        status: "info",
        title: "Check Complete",
      };

      toast({
        title: notification.title,
        description: `Analysis complete for ${newDrug}`,
        status: notification.status,
        duration: 3000,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to check drug interactions";
      toast({
        title: "Check Failed",
        description: errorMessage,
        status: "error",
        duration: 3000,
      });
      console.error("Drug interaction check error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [newDrug, selectedMedications, currentUser, toast]);

  const getSeverityBadgeColor = (status) => {
    switch (status) {
      case "Danger":
        return "red";
      case "Caution":
        return "orange";
      case "Safe":
        return "green";
      default:
        return "gray";
    }
  };

  const getInteractionBg = (severity) => {
    if (severity === "Critical") return "red.50";
    if (severity === "Moderate") return "orange.50";
    return "yellow.50";
  };

  const getInteractionBorder = (severity) => {
    if (severity === "Critical") return "red.200";
    if (severity === "Moderate") return "orange.200";
    return "yellow.200";
  };

  const getInteractionBadge = (severity) => {
    if (severity === "Critical") return "red";
    if (severity === "Moderate") return "orange";
    return "yellow";
  };

  const currentConfig = result
    ? severityConfig[result.safetyStatus] || severityConfig.Safe
    : null;

  return (
    <Card
      bg={bg}
      borderRadius="2xl"
      boxShadow="sm"
      display="flex"
      flexDirection="column"
      w="100%"
    >
      <CardHeader
        bg={headerBg}
        borderBottomWidth="1px"
        borderColor={borderColor}
        p={6}
      >
        <HStack spacing={3} mb={2}>
          <Icon as={Pill} color="blue.600" boxSize={6} />
          <Heading size="md">Drug Safety Checker</Heading>
        </HStack>
        <Text fontSize="sm" color="gray.500">
          Check for interactions between drugs before prescribing
        </Text>
      </CardHeader>

      <CardBody
        p={6}
        display="flex"
        flexDirection="column"
        gap={6}
        flex="1"
        overflowY="auto"
      >
        {/* Current Medications Section */}
        <Box>
          <HStack justify="space-between" mb={3}>
            <Heading size="sm">Current Medications</Heading>
            <Text fontSize="xs" color="gray.500">
              {selectedMedications.length} selected
            </Text>
          </HStack>

          <DrugMultiSelect onSelectDrug={handleAddMedication} />

          {selectedMedications.length > 0 && (
            <Box mt={4}>
              <SimpleGrid columns={[2, 3]} spacing={2}>
                {selectedMedications.map((drug) => (
                  <Box
                    key={drug.id}
                    bg={pillBg}
                    p={3}
                    borderRadius="lg"
                    border="1px"
                    borderColor={pillBorder}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <VStack align="start" spacing={0} flex="1">
                      <Text fontSize="sm" fontWeight="600">
                        {drug.name}
                      </Text>
                      {drug.dosage && (
                        <Text fontSize="xs" color="gray.600">
                          {drug.dosage}
                        </Text>
                      )}
                    </VStack>
                    <CloseButton
                      size="sm"
                      onClick={() => handleRemoveMedication(drug.id)}
                    />
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          )}
        </Box>

        <Divider />

        {/* New Drug to Check Section */}
        <Box>
          <Heading size="sm" mb={3}>
            Drug to Check
          </Heading>
          <VStack spacing={3} align="stretch">
            <DrugMultiSelect
              onSelectDrug={(drug) => setNewDrug(drug.name)}
              isSingleSelect={true}
            />
            {newDrug && (
              <HStack>
                <Badge
                  colorScheme="purple"
                  px={3}
                  py={1}
                  borderRadius="md"
                  fontSize="sm"
                >
                  Checking: {newDrug}
                </Badge>
                <CloseButton size="sm" onClick={() => setNewDrug("")} />
              </HStack>
            )}
            <Button
              colorScheme="blue"
              onClick={handleCheckInteractions}
              isLoading={isLoading}
              loadingText="Analyzing interactions..."
              isDisabled={
                isLoading || !newDrug || selectedMedications.length === 0
              }
              size="lg"
              w="full"
              mt={1}
            >
              Check Interactions
            </Button>
          </VStack>
        </Box>

        {/* Results Section */}
        {result && currentConfig && (
          <Box>
            <Divider mb={6} />
            <Heading size="sm" mb={4}>
              Analysis Results
            </Heading>

            <Tabs colorScheme={getSeverityBadgeColor(result.safetyStatus)}>
              <TabList>
                <Tab>
                  <HStack spacing={2}>
                    <Icon as={currentConfig.icon} boxSize={4} />
                    <Text>Safety Status</Text>
                  </HStack>
                </Tab>
                {result.alerts && result.alerts.length > 0 && (
                  <Tab>
                    <HStack spacing={2}>
                      <Badge colorScheme="red">{result.alerts.length}</Badge>
                      <Text>Alerts</Text>
                    </HStack>
                  </Tab>
                )}
                {result.recommendations &&
                  result.recommendations.length > 0 && (
                    <Tab>
                      <HStack spacing={2}>
                        <Icon as={TrendingUp} boxSize={4} />
                        <Text>Recommendations</Text>
                      </HStack>
                    </Tab>
                  )}
                {result.alternativeDrugs &&
                  result.alternativeDrugs.length > 0 && (
                    <Tab>
                      <HStack spacing={2}>
                        <Badge colorScheme="green">
                          {result.alternativeDrugs.length}
                        </Badge>
                        <Text>Alternatives</Text>
                      </HStack>
                    </Tab>
                  )}
              </TabList>

              <TabPanels>
                {/* Safety Status Tab */}
                <TabPanel>
                  <VStack align="stretch" spacing={4}>
                    <Box
                      p={6}
                      borderRadius="xl"
                      border="2px"
                      borderColor={currentConfig.borderColor}
                      bg={currentConfig.bgColor}
                    >
                      <HStack spacing={4} mb={3}>
                        <Icon
                          as={currentConfig.icon}
                          color={currentConfig.color}
                          boxSize={8}
                        />
                        <VStack align="start" spacing={1}>
                          <Badge
                            colorScheme={getSeverityBadgeColor(
                              result.safetyStatus,
                            )}
                            fontSize="lg"
                            px={3}
                            py={1}
                          >
                            {result.safetyStatus.toUpperCase()}
                          </Badge>
                          <Text fontSize="sm" color={currentConfig.textColor}>
                            Drug: <strong>{newDrug}</strong>
                          </Text>
                        </VStack>
                      </HStack>

                      {result.severity && (
                        <HStack spacing={2} mt={3}>
                          <Text fontSize="sm" fontWeight="600">
                            Severity Level:
                          </Text>
                          <Badge
                            colorScheme={getInteractionBadge(result.severity)}
                          >
                            {result.severity}
                          </Badge>
                        </HStack>
                      )}

                      {result.confidenceScore !== undefined && (
                        <HStack spacing={2} mt={2}>
                          <Text fontSize="sm" fontWeight="600">
                            Confidence:
                          </Text>
                          <Badge>{Math.round(result.confidenceScore)}%</Badge>
                        </HStack>
                      )}
                    </Box>

                    {result.interactions && result.interactions.length > 0 && (
                      <Box>
                        <Heading size="xs" mb={3}>
                          Detected Interactions
                        </Heading>
                        <VStack align="stretch" spacing={2}>
                          {result.interactions.map((interaction, idx) => (
                            <Box
                              key={idx}
                              p={3}
                              borderRadius="lg"
                              bg={getInteractionBg(interaction.severity)}
                              border="1px"
                              borderColor={getInteractionBorder(
                                interaction.severity,
                              )}
                            >
                              <HStack justify="space-between" mb={1}>
                                <Text fontWeight="600" fontSize="sm">
                                  {interaction.drug1} + {interaction.drug2}
                                </Text>
                                <Badge
                                  colorScheme={getInteractionBadge(
                                    interaction.severity,
                                  )}
                                  fontSize="xs"
                                >
                                  {interaction.severity}
                                </Badge>
                              </HStack>
                              <Text fontSize="xs" color="gray.600">
                                {interaction.description}
                              </Text>
                            </Box>
                          ))}
                        </VStack>
                      </Box>
                    )}
                  </VStack>
                </TabPanel>

                {/* Alerts Tab */}
                {result.alerts && result.alerts.length > 0 && (
                  <TabPanel>
                    <VStack align="stretch" spacing={3}>
                      {result.alerts.map((alert, idx) => (
                        <Box
                          key={idx}
                          p={4}
                          borderRadius="lg"
                          bg="red.50"
                          border="1px"
                          borderColor="red.200"
                          display="flex"
                          gap={3}
                        >
                          <Icon as={AlertTriangle} color="red.600" mt={0.5} />
                          <Text fontSize="sm" color="red.800">
                            {alert}
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  </TabPanel>
                )}

                {/* Recommendations Tab */}
                {result.recommendations &&
                  result.recommendations.length > 0 && (
                    <TabPanel>
                      <List spacing={3}>
                        {result.recommendations.map((rec, idx) => (
                          <ListItem
                            key={idx}
                            p={3}
                            borderRadius="lg"
                            bg="green.50"
                            border="1px"
                            borderColor="green.200"
                          >
                            <HStack align="start" spacing={3}>
                              <ListIcon
                                as={CheckCircle}
                                color="green.600"
                                mt={0.5}
                              />
                              <Text fontSize="sm">{rec}</Text>
                            </HStack>
                          </ListItem>
                        ))}
                      </List>
                    </TabPanel>
                  )}

                {/* Alternative Drugs Tab */}
                {result.alternativeDrugs &&
                  result.alternativeDrugs.length > 0 && (
                    <TabPanel>
                      <VStack align="stretch" spacing={3}>
                        {result.alternativeDrugs.map((drug, idx) => (
                          <Box
                            key={idx}
                            p={4}
                            borderRadius="lg"
                            bg="green.50"
                            border="1px"
                            borderColor="green.200"
                          >
                            <HStack justify="space-between" mb={1}>
                              <Text fontWeight="600">{drug.name}</Text>
                              <Badge colorScheme="green">Alternative</Badge>
                            </HStack>
                            {drug.dosage && (
                              <Text fontSize="sm" color="gray.600">
                                Dosage: {drug.dosage}
                              </Text>
                            )}
                            {drug.frequency && (
                              <Text fontSize="sm" color="gray.600">
                                Frequency: {drug.frequency}
                              </Text>
                            )}
                          </Box>
                        ))}
                      </VStack>
                    </TabPanel>
                  )}
              </TabPanels>
            </Tabs>
          </Box>
        )}

        {/* Empty State */}
        {!result && !isLoading && selectedMedications.length === 0 && (
          <Center py={10} flexDirection="column" color="gray.400">
            <Icon as={Pill} boxSize={10} mb={3} opacity={0.4} />
            <Text fontSize="sm">
              Add medications and select a drug to check
            </Text>
          </Center>
        )}

        {/* Loading State */}
        {isLoading && (
          <Center py={10}>
            <VStack spacing={3}>
              <Spinner color="blue.600" size="lg" />
              <Text color="gray.600">Analyzing drug interactions...</Text>
            </VStack>
          </Center>
        )}
      </CardBody>
    </Card>
  );
};

export default DrugSafetyChecker;
