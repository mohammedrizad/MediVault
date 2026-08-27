import React, { useState } from "react";
import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  HStack,
  Icon,
  useToast,
  Heading,
  InputGroup,
  InputRightElement,
  InputLeftElement,
  useColorModeValue,
  Center,
} from "@chakra-ui/react";
import {
  Pill,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Activity,
} from "lucide-react";
import { checkDrugInteraction } from "../services/geminiService";
import { MOCK_PATIENT } from "../data";

const DrugChecker = () => {
  const [drugName, setDrugName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const handleCheck = async () => {
    if (!drugName) return;
    setLoading(true);
    setResult(null);
    try {
      // Use patient ID from mock data or context
      const data = await checkDrugInteraction(MOCK_PATIENT.id, drugName);
      setResult(data);
    } catch (error) {
      toast({
        title: "Check failed",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      bg={bg}
      borderRadius="2xl"
      boxShadow="sm"
      border="1px"
      borderColor={borderColor}
      p={6}
      h="full"
      display="flex"
      flexDirection="column"
    >
      <Box mb={6}>
        <HStack mb={2}>
          <Icon as={Pill} color="blue.600" boxSize={5} />
          <Heading size="md">Drug Interaction Checker</Heading>
        </HStack>
        <Text fontSize="sm" color="gray.500">
          Real-time safety check against {MOCK_PATIENT.name}'s active
          medications and allergies.
        </Text>
      </Box>

      <Box position="relative" mb={6}>
        <InputGroup size="lg">
          <InputLeftElement pointerEvents="none">
            <Icon as={Search} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Enter medication name (e.g., Aspirin)"
            value={drugName}
            onChange={(e) => setDrugName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            bg="gray.50"
            pr="6rem"
          />
          <InputRightElement width="5.5rem">
            <Button
              h="1.75rem"
              size="sm"
              onClick={handleCheck}
              isDisabled={loading || !drugName}
              isLoading={loading}
              colorScheme="blue"
            >
              Check
            </Button>
          </InputRightElement>
        </InputGroup>
      </Box>

      <Box flex="1" overflowY="auto">
        {!result && !loading && (
          <Center py={10} flexDirection="column" color="gray.400">
            <Box
              w={16}
              h={16}
              bg="gray.50"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb={3}
            >
              <Icon as={Activity} boxSize={8} />
            </Box>
            <Text fontSize="sm">Enter a drug name to analyze risks.</Text>
          </Center>
        )}

        {result && (
          <Box
            borderRadius="xl"
            p={5}
            border="1px"
            borderColor={
              result.safetyStatus === "Safe"
                ? "green.200"
                : result.safetyStatus === "Danger"
                ? "red.200"
                : "orange.200"
            }
            bg={
              result.safetyStatus === "Safe"
                ? "green.50"
                : result.safetyStatus === "Danger"
                ? "red.50"
                : "orange.50"
            }
          >
            <HStack align="start" spacing={3} mb={4}>
              <Icon
                as={
                  result.safetyStatus === "Safe"
                    ? CheckCircle
                    : result.safetyStatus === "Danger"
                    ? XCircle
                    : AlertTriangle
                }
                color={
                  result.safetyStatus === "Safe"
                    ? "green.600"
                    : result.safetyStatus === "Danger"
                    ? "red.600"
                    : "orange.600"
                }
                boxSize={8}
              />

              <Box>
                <Heading
                  size="md"
                  color={
                    result.safetyStatus === "Safe"
                      ? "green.800"
                      : result.safetyStatus === "Danger"
                      ? "red.800"
                      : "orange.800"
                  }
                >
                  {result.safetyStatus.toUpperCase()}
                </Heading>
                <Text
                  fontSize="sm"
                  color={
                    result.safetyStatus === "Safe"
                      ? "green.700"
                      : result.safetyStatus === "Danger"
                      ? "red.700"
                      : "orange.700"
                  }
                >
                  Analysis for {drugName}
                </Text>
              </Box>
            </HStack>

            {result.alerts.length > 0 && (
              <Box mb={4}>
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  textTransform="uppercase"
                  mb={2}
                  opacity={0.6}
                >
                  Warnings
                </Text>
                <VStack align="stretch" spacing={2}>
                  {result.alerts.map((alert, idx) => (
                    <HStack
                      key={idx}
                      align="start"
                      spacing={2}
                      fontSize="sm"
                      fontWeight="medium"
                      p={2}
                      bg="whiteAlpha.600"
                      borderRadius="lg"
                    >
                      <Icon as={AlertTriangle} boxSize={3.5} mt={0.5} />
                      <Text>{alert}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DrugChecker;
