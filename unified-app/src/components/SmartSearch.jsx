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
  useColorModeValue,
  Center,
} from "@chakra-ui/react";
import { Sparkles, FileText, Calendar, ArrowRight } from "lucide-react";
import { smartSearch } from "../services/geminiService";
import { MOCK_PATIENT } from "../data";

const SmartSearch = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const toast = useToast();
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      // Pass patient ID for context-aware search
      const res = await smartSearch(query, MOCK_PATIENT.id);
      setResponse(res);
    } catch (e) {
      toast({
        title: "Search failed",
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
    >
      <Box mb={6}>
        <HStack mb={2}>
          <Icon as={Sparkles} color="indigo.500" boxSize={5} />
          <Heading size="md">Smart Medical Search</Heading>
        </HStack>
        <Text fontSize="sm" color="gray.500">
          Ask questions like "When was the last chest pain?" or "Show diabetes
          meds"
        </Text>
      </Box>

      <HStack mb={6}>
        <InputGroup size="lg">
          <Input
            placeholder="Ask a question about the patient's history..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            bg="gray.50"
          />
          <InputRightElement width="6rem">
            <Button
              h="1.75rem"
              size="sm"
              onClick={handleSearch}
              isDisabled={loading || !query}
              isLoading={loading}
              colorScheme="indigo"
            >
              Search
            </Button>
          </InputRightElement>
        </InputGroup>
      </HStack>

      {response && (
        <VStack spacing={6} align="stretch" animation="fade-in 0.5s">
          <Box
            bg="indigo.50"
            p={5}
            borderRadius="xl"
            border="1px"
            borderColor="indigo.100"
          >
            <HStack mb={2} color="indigo.800">
              <Icon as={Sparkles} boxSize={3.5} />
              <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
                AI Summary
              </Text>
            </HStack>
            <Text color="gray.800" lineHeight="relaxed">
              {response.summary}
            </Text>
          </Box>

          <Box>
            <Heading
              size="xs"
              textTransform="uppercase"
              color="gray.400"
              mb={3}
            >
              Evidence Found
            </Heading>
            <VStack spacing={3} align="stretch">
              {response.results.length === 0 ? (
                <Text fontSize="sm" color="gray.500" fontStyle="italic">
                  No specific records cited.
                </Text>
              ) : (
                response.results.map((rec, i) => (
                  <Box
                    key={i}
                    p={4}
                    borderRadius="xl"
                    border="1px"
                    borderColor="gray.200"
                    _hover={{
                      borderColor: "indigo.300",
                      boxShadow: "md",
                    }}
                    transition="all 0.2s"
                    cursor="pointer"
                    bg="white"
                  >
                    <HStack align="start" spacing={4}>
                      <Center
                        w={10}
                        h={10}
                        bg="gray.100"
                        borderRadius="lg"
                        color="gray.500"
                        _groupHover={{ bg: "indigo.50", color: "indigo.600" }}
                      >
                        <Icon as={FileText} boxSize={5} />
                      </Center>
                      <Box flex="1">
                        <HStack justify="space-between" align="start">
                          <Heading size="sm" color="gray.900">
                            {rec.diagnosis || "Medical Visit"}
                          </Heading>
                          <HStack color="gray.400" fontSize="xs">
                            <Icon as={Calendar} boxSize={3} />
                            <Text>{rec.date}</Text>
                          </HStack>
                        </HStack>
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          mt={1}
                          noOfLines={2}
                        >
                          {rec.notes ||
                            (rec.symptoms && rec.symptoms.join(", "))}
                        </Text>
                        <HStack
                          mt={2}
                          color="indigo.600"
                          fontSize="xs"
                          fontWeight="medium"
                        >
                          <Text>View Details</Text>
                          <Icon as={ArrowRight} boxSize={3} />
                        </HStack>
                      </Box>
                    </HStack>
                  </Box>
                ))
              )}
            </VStack>
          </Box>
        </VStack>
      )}
    </Box>
  );
};

export default SmartSearch;
