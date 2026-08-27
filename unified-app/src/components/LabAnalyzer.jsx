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
  FormControl,
  FormLabel,
  useColorModeValue,
} from "@chakra-ui/react";
import { Microscope, AlertCircle, CheckCircle } from "lucide-react";
import { analyzeLabResult } from "../services/geminiService";

const LabAnalyzer = () => {
  const [testName, setTestName] = useState("");
  const [testValue, setTestValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const handleAnalyze = async () => {
    if (!testName || !testValue) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await analyzeLabResult(testName, testValue);
      setResult(data);
    } catch (e) {
      toast({
        title: "Analysis failed",
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
          <Icon as={Microscope} color="teal.600" boxSize={5} />
          <Heading size="md">Quick Lab Analysis</Heading>
        </HStack>
        <Text fontSize="sm" color="gray.500">
          Instantly check if lab values are within critical ranges using AI.
        </Text>
      </Box>

      <VStack spacing={4} mb={6} align="stretch">
        <FormControl>
          <FormLabel
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
            color="gray.500"
          >
            Test Name
          </FormLabel>
          <Input
            placeholder="e.g. Serum Potassium"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            bg="gray.50"
          />
        </FormControl>
        <FormControl>
          <FormLabel
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
            color="gray.500"
          >
            Value & Units
          </FormLabel>
          <Input
            placeholder="e.g. 7.2 mEq/L"
            value={testValue}
            onChange={(e) => setTestValue(e.target.value)}
            bg="gray.50"
          />
        </FormControl>
        <Button
          onClick={handleAnalyze}
          isDisabled={loading || !testName || !testValue}
          isLoading={loading}
          colorScheme="teal"
          w="full"
        >
          Check Value
        </Button>
      </VStack>

      <Box flex="1">
        {!result && !loading && (
          <Box
            border="2px dashed"
            borderColor="gray.100"
            borderRadius="xl"
            h="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="gray.400"
            fontSize="sm"
            p={4}
            textAlign="center"
          >
            Enter values to detect critical levels instantly.
          </Box>
        )}

        {result && (
          <Box
            borderRadius="xl"
            p={5}
            bg={
              result.isCritical
                ? "red.50"
                : result.severity === "Abnormal"
                ? "orange.50"
                : "green.50"
            }
            border="1px"
            borderColor={
              result.isCritical
                ? "red.200"
                : result.severity === "Abnormal"
                ? "orange.200"
                : "green.200"
            }
            animation="fade-in 0.5s"
          >
            <HStack mb={3}>
              <Icon
                as={
                  result.isCritical
                    ? AlertCircle
                    : result.severity === "Abnormal"
                    ? AlertCircle
                    : CheckCircle
                }
                color={
                  result.isCritical
                    ? "red.600"
                    : result.severity === "Abnormal"
                    ? "orange.600"
                    : "green.600"
                }
              />
              <Text
                fontWeight="bold"
                textTransform="uppercase"
                fontSize="sm"
                color={
                  result.isCritical
                    ? "red.700"
                    : result.severity === "Abnormal"
                    ? "orange.700"
                    : "green.700"
                }
              >
                {result.severity}
              </Text>
            </HStack>

            <Text fontSize="sm" color="gray.800" lineHeight="relaxed">
              {result.analysis}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default LabAnalyzer;
