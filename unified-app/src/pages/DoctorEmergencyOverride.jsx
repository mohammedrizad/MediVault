import React, { useState } from "react";
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiAlertTriangle, FiSearch, FiExternalLink } from "react-icons/fi";
import dataService from "../services/DataService";

const DoctorEmergencyOverride = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  const onSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      toast({
        title: "Enter patient details",
        description: "Use UHID, name, phone, or email to search.",
        status: "warning",
        duration: 2500,
      });
      return;
    }

    setLoading(true);
    setPatient(null);
    try {
      const result = await dataService.searchPatient(query.trim());
      if (!result) {
        toast({
          title: "Patient not found",
          description: "No matching patient found for emergency override.",
          status: "error",
          duration: 3000,
        });
        return;
      }

      setPatient(result);
    } catch (err) {
      toast({
        title: "Search failed",
        description: err.message || "Unable to search patient",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <HStack>
          <FiAlertTriangle color="#dc2626" />
          <Heading size="lg">Emergency Override</Heading>
          <Badge colorScheme="red" variant="subtle">
            Authorized Officials Only
          </Badge>
        </HStack>

        <Text color="gray.600">
          Use this flow when a patient is unconscious or cannot authenticate.
          Search patient, verify identity at bedside, then open emergency
          record.
        </Text>

        <Card>
          <CardBody>
            <form onSubmit={onSearch}>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Find Patient</FormLabel>
                  <HStack>
                    <Input
                      placeholder="UHID, name, phone, or email"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <Button
                      type="submit"
                      colorScheme="red"
                      leftIcon={<FiSearch />}
                      isLoading={loading}
                    >
                      Search
                    </Button>
                  </HStack>
                </FormControl>
              </VStack>
            </form>
          </CardBody>
        </Card>

        {patient && (
          <Card border="1px solid" borderColor="red.200">
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <Heading size="md">Patient Match</Heading>
                <Text>
                  <strong>Name:</strong> {patient.Name || "N/A"}
                </Text>
                <Text>
                  <strong>UHID:</strong> {patient.MedicalId || "N/A"}
                </Text>
                <Text>
                  <strong>Blood Group:</strong> {patient.BloodGroup || "N/A"}
                </Text>
                <Button
                  colorScheme="red"
                  leftIcon={<FiExternalLink />}
                  onClick={() =>
                    navigate(`/emergency-access/${patient.MedicalId}`)
                  }
                  isDisabled={!patient.MedicalId}
                >
                  Open Emergency Override Record
                </Button>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
};

export default DoctorEmergencyOverride;
