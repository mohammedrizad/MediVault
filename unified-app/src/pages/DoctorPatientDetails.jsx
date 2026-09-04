import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  HStack,
  List,
  ListItem,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import dataService from "../services/DataService";

const formatDisplayValue = (value) => {
  if (value === null || value === undefined || value === "") return "N/A";
  if (typeof value === "object") {
    const entries = Object.entries(value).filter(([, v]) => v !== null && v !== undefined && v !== "");
    return entries.length
      ? entries.map(([k, v]) => `${k}: ${v}`).join(", ")
      : "N/A";
  }
  return value;
};

const Value = ({ label, value }) => (
  <Box>
    <Text fontSize="xs" color="gray.500" mb={1}>
      {label}
    </Text>
    <Text fontWeight="medium">{formatDisplayValue(value)}</Text>
  </Box>
);

const DoctorPatientDetails = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPatient = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await dataService.searchPatient(id);
        if (!result) {
          setError("Patient not found");
          return;
        }
        setPatient(result);
      } catch (err) {
        setError(err.message || "Failed to load patient details");
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [id]);

  if (loading) {
    return (
      <Box p={6}>
        <Spinner />
      </Box>
    );
  }

  if (error || !patient) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          {error || "Unable to load patient details"}
        </Alert>
      </Box>
    );
  }

  const history = patient.History || [];

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between" wrap="wrap">
          <Heading size="lg">Full Patient Details</Heading>
          <Badge colorScheme={patient.status === "Active" ? "green" : "red"}>
            {patient.status || "Unknown"}
          </Badge>
        </HStack>

        <Card>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Core Identity</Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Value label="Name" value={patient.Name} />
                <Value label="UHID" value={patient.MedicalId} />
                <Value label="Patient ID" value={patient._id} />
                <Value label="Age" value={patient.Age} />
                <Value label="Gender" value={patient.Gender} />
                <Value label="DOB" value={patient.DOB} />
                <Value label="Aadhar" value={patient.Aadhar} />
                <Value label="Blood Group" value={patient.BloodGroup} />
                <Value label="Status" value={patient.status} />
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Contact & Assignment</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Value label="Phone" value={patient.Mobile_no} />
                <Value label="Email" value={patient.Email} />
                <Value label="Address" value={patient.Address} />
                <Value label="Assigned Doctor" value={patient.assignedDoctor} />
                <Value
                  label="Emergency Contact Name"
                  value={
                    patient.EmergencyContactName || patient.EmergencyContact
                  }
                />
                <Value
                  label="Emergency Contact Number"
                  value={patient.EmergencyContactNumber}
                />
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Heading size="md">Clinical Summary</Heading>
              <Value label="Allergies" value={patient.Allergies} />
              <Value
                label="Chronic Conditions"
                value={patient.ChronicConditions}
              />
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack align="stretch" spacing={3}>
              <Heading size="md">Medical History ({history.length})</Heading>
              {history.length === 0 ? (
                <Text color="gray.500">No history records available.</Text>
              ) : (
                <VStack align="stretch" spacing={3}>
                  {history.map((item, idx) => (
                    <Box
                      key={idx}
                      p={3}
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="md"
                    >
                      <HStack justify="space-between" mb={2}>
                        <Text fontWeight="semibold">
                          {item.disease || "Clinical Entry"}
                        </Text>
                        <Badge colorScheme="blue">{item.Date || "N/A"}</Badge>
                      </HStack>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                        <Value label="Notes" value={item.notes} />
                        <Value label="Vitals" value={item.vitals} />
                      </SimpleGrid>
                      {Array.isArray(item.preciption) &&
                        item.preciption.length > 0 && (
                          <>
                            <Divider my={2} />
                            <Text fontSize="sm" fontWeight="medium">
                              Prescriptions
                            </Text>
                            <List spacing={1}>
                              {item.preciption.map((p, pIdx) => (
                                <ListItem key={pIdx}>- {String(p)}</ListItem>
                              ))}
                            </List>
                          </>
                        )}
                    </Box>
                  ))}
                </VStack>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default DoctorPatientDetails;
