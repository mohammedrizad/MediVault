import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Icon,
  useColorModeValue,
  VStack,
  HStack,
  Badge,
  Divider,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import {
  Brain,
  Microscope,
  Pill,
  Search,
  Activity,
  Sparkles,
  User,
  AlertTriangle,
  HeartPulse,
} from "lucide-react";
import ImageAnalyzer from "../components/ImageAnalyzer";
import LabAnalyzer from "../components/LabAnalyzer";
import DrugChecker from "../components/DrugChecker";
import SmartSearch from "../components/SmartSearch";
import { MOCK_PATIENT } from "../data";

const AIFeaturesPage = () => {
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");

  return (
    <Box minH="100vh" bg={bg} py={12}>
      <Container maxW="7xl">
        <VStack spacing={4} textAlign="center" mb={12}>
          <Heading
            as="h1"
            size="2xl"
            bgGradient="linear(to-r, blue.600, teal.500)"
            bgClip="text"
            fontWeight="extrabold"
          >
            MediVault AI Suite
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            Advanced clinical decision support powered by Gemini 2.5 Flash.
            Analyze scans, check interactions, and interpret lab data instantly.
          </Text>
        </VStack>

        <Tabs variant="soft-rounded" colorScheme="blue" align="center" isLazy>
          <TabList mb={8} flexWrap="wrap" gap={2} justifyContent="center">
            <Tab py={3} px={6}>
              <HStack spacing={2}>
                <Icon as={Brain} />
                <Text>X-Ray Analysis</Text>
              </HStack>
            </Tab>
            <Tab py={3} px={6}>
              <HStack spacing={2}>
                <Icon as={Microscope} />
                <Text>Lab Results</Text>
              </HStack>
            </Tab>
            <Tab py={3} px={6}>
              <HStack spacing={2}>
                <Icon as={Pill} />
                <Text>Drug Interactions</Text>
              </HStack>
            </Tab>
            <Tab py={3} px={6}>
              <HStack spacing={2}>
                <Icon as={Search} />
                <Text>Smart Search</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Image Analysis Panel */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                <VStack spacing={6} align="stretch">
                  <Box
                    bg="blue.50"
                    p={6}
                    borderRadius="xl"
                    border="1px"
                    borderColor="blue.100"
                  >
                    <HStack mb={2}>
                      <Icon as={Brain} color="blue.600" boxSize={5} />
                      <Heading size="md" color="blue.900">
                        Radiology Assistant
                      </Heading>
                    </HStack>
                    <Text color="blue.800" fontSize="sm">
                      Upload X-rays, CT scans, or MRIs. The AI will identify
                      potential abnormalities, generate a summary, and suggest
                      next steps.
                    </Text>
                  </Box>
                  <ImageAnalyzer />
                </VStack>

                <Box
                  bg={cardBg}
                  p={6}
                  borderRadius="2xl"
                  boxShadow="sm"
                  border="1px"
                  borderColor="gray.200"
                >
                  <HStack mb={4} spacing={3}>
                    <Box p={2} bg="blue.50" borderRadius="lg" color="blue.600">
                      <Icon as={User} boxSize={5} />
                    </Box>
                    <Box>
                      <Heading size="sm" color="gray.900">
                        Clinical Context
                      </Heading>
                      <Text fontSize="xs" color="gray.500">
                        Active Patient Record
                      </Text>
                    </Box>
                  </HStack>

                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        textTransform="uppercase"
                        color="gray.400"
                        mb={1}
                      >
                        Patient Details
                      </Text>
                      <Text fontWeight="bold" fontSize="lg">
                        {MOCK_PATIENT.name}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {MOCK_PATIENT.age} Years • {MOCK_PATIENT.gender} •{" "}
                        {MOCK_PATIENT.bloodGroup}
                      </Text>
                    </Box>

                    <Divider />

                    <Box>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        textTransform="uppercase"
                        color="gray.400"
                        mb={2}
                      >
                        Chronic Conditions
                      </Text>
                      <HStack flexWrap="wrap" spacing={2}>
                        {MOCK_PATIENT.chronicConditions.map((condition, i) => (
                          <Badge
                            key={i}
                            colorScheme="blue"
                            variant="subtle"
                            px={2}
                            py={1}
                            borderRadius="md"
                          >
                            {condition}
                          </Badge>
                        ))}
                      </HStack>
                    </Box>

                    <Box>
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        textTransform="uppercase"
                        color="gray.400"
                        mb={2}
                      >
                        Active Medications
                      </Text>
                      <List spacing={2}>
                        {MOCK_PATIENT.records
                          .flatMap((r) => r.medications)
                          .filter((m) => m.active)
                          .map((med, i) => (
                            <ListItem
                              key={i}
                              fontSize="sm"
                              display="flex"
                              alignItems="center"
                            >
                              <ListIcon as={Pill} color="green.500" />
                              {med.name} ({med.dosage})
                            </ListItem>
                          ))}
                      </List>
                    </Box>

                    {MOCK_PATIENT.allergies.length > 0 && (
                      <Box
                        bg="red.50"
                        p={3}
                        borderRadius="lg"
                        border="1px"
                        borderColor="red.100"
                      >
                        <HStack mb={1}>
                          <Icon as={AlertTriangle} color="red.500" size={14} />
                          <Text
                            fontSize="xs"
                            fontWeight="bold"
                            color="red.800"
                            textTransform="uppercase"
                          >
                            Allergies
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="red.700">
                          {MOCK_PATIENT.allergies
                            .map((a) => a.allergen)
                            .join(", ")}
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </Box>
              </SimpleGrid>
            </TabPanel>

            {/* Lab Analysis Panel */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                <LabAnalyzer />
                <Box
                  bg={cardBg}
                  p={6}
                  borderRadius="2xl"
                  boxShadow="sm"
                  border="1px"
                  borderColor="gray.200"
                >
                  <Heading size="md" mb={4}>
                    Critical Alert System
                  </Heading>
                  <VStack align="stretch" spacing={4}>
                    <Box
                      p={4}
                      bg="red.50"
                      borderRadius="lg"
                      border="1px"
                      borderColor="red.100"
                    >
                      <HStack>
                        <Badge colorScheme="red">CRITICAL</Badge>
                        <Text fontSize="sm" fontWeight="bold" color="red.800">
                          Immediate Attention
                        </Text>
                      </HStack>
                      <Text fontSize="sm" mt={1} color="red.700">
                        Values significantly outside normal ranges trigger
                        immediate alerts.
                      </Text>
                    </Box>
                    <Box
                      p={4}
                      bg="orange.50"
                      borderRadius="lg"
                      border="1px"
                      borderColor="orange.100"
                    >
                      <HStack>
                        <Badge colorScheme="orange">ABNORMAL</Badge>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color="orange.800"
                        >
                          Monitor Closely
                        </Text>
                      </HStack>
                      <Text fontSize="sm" mt={1} color="orange.700">
                        Slight deviations that may require follow-up testing.
                      </Text>
                    </Box>
                    <Box
                      p={4}
                      bg="green.50"
                      borderRadius="lg"
                      border="1px"
                      borderColor="green.100"
                    >
                      <HStack>
                        <Badge colorScheme="green">NORMAL</Badge>
                        <Text fontSize="sm" fontWeight="bold" color="green.800">
                          Within Range
                        </Text>
                      </HStack>
                      <Text fontSize="sm" mt={1} color="green.700">
                        Results are within standard reference intervals.
                      </Text>
                    </Box>
                  </VStack>
                </Box>
              </SimpleGrid>
            </TabPanel>

            {/* Drug Checker Panel */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                <DrugChecker />
                <Box
                  bg={cardBg}
                  p={6}
                  borderRadius="2xl"
                  boxShadow="sm"
                  border="1px"
                  borderColor="gray.200"
                >
                  <Heading size="md" mb={4}>
                    Safety Protocols
                  </Heading>
                  <Text color="gray.600" mb={4}>
                    The interaction checker analyzes:
                  </Text>
                  <VStack align="stretch" spacing={3}>
                    {[
                      "Drug-Drug Interactions",
                      "Drug-Allergy Conflicts",
                      "Contraindications",
                      "Side Effect Overlap",
                    ].map((item, i) => (
                      <HStack key={i} p={3} bg="gray.50" borderRadius="md">
                        <Icon as={Sparkles} color="blue.500" />
                        <Text fontSize="sm" fontWeight="medium">
                          {item}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              </SimpleGrid>
            </TabPanel>

            {/* Smart Search Panel */}
            <TabPanel>
              <SmartSearch />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};

export default AIFeaturesPage;
