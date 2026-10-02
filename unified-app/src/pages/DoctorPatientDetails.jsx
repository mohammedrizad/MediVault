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
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useParams } from "react-router-dom";
import dataService from "../services/DataService";
import { useAuth } from "../context/AuthContext";

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

const emptyVisitForm = {
  disease: "",
  bp: "",
  pulse: "",
  temp: "",
  spo2: "",
  notes: "",
};

const DoctorPatientDetails = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [visitForm, setVisitForm] = useState(emptyVisitForm);
  const [prescriptionLines, setPrescriptionLines] = useState([
    { medication: "", dosage: "", frequency: "" },
  ]);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

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

  useEffect(() => {
    loadPatient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const resetVisitForm = () => {
    setVisitForm(emptyVisitForm);
    setPrescriptionLines([{ medication: "", dosage: "", frequency: "" }]);
  };

  const authHeaders = () => {
    const authToken = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    };
  };

  const handleSubmitVisit = async () => {
    if (!visitForm.disease.trim()) {
      toast({
        title: "Diagnosis required",
        description: "Please enter a diagnosis or reason for visit.",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    setSubmitting(true);
    try {
      const entryRes = await fetch(`${API_URL}/patient/entrypatient`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          _id: patient._id,
          disease: visitForm.disease,
          vitals: {
            BP: visitForm.bp,
            Pulse: visitForm.pulse,
            Temp: visitForm.temp,
            SpO2: visitForm.spo2,
          },
        }),
      });
      const entryData = await entryRes.json();
      if (entryData.msg !== "Datas added successfully") {
        throw new Error(entryData.msg || "Failed to create visit entry");
      }

      if (visitForm.notes.trim()) {
        const notesRes = await fetch(`${API_URL}/patient/notesadded`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ _id: patient._id, notes: visitForm.notes }),
        });
        const notesData = await notesRes.json();
        if (notesData.msg !== "Notes added successfully") {
          throw new Error(notesData.msg || "Failed to save notes");
        }
      }

      const validLines = prescriptionLines.filter((l) => l.medication.trim());
      if (validLines.length > 0 && currentUser?.id) {
        const prescRes = await fetch(`${API_URL}/patient/updateprecription`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            _id: patient._id,
            preciption: validLines.map(
              (l) => `${l.medication} - ${l.dosage || "N/A"} - ${l.frequency || "N/A"}`,
            ),
            Doctor: currentUser.id,
          }),
        });
        const prescData = await prescRes.json();
        if (prescData.msg !== "Precription added successfully") {
          console.warn("Prescription save warning:", prescData.msg);
        }
      }

      toast({
        title: "Visit recorded",
        description: "New visit, notes, and prescription have been saved.",
        status: "success",
        duration: 3000,
      });
      resetVisitForm();
      onClose();
      loadPatient();
    } catch (err) {
      toast({
        title: "Failed to record visit",
        description: err.message,
        status: "error",
        duration: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

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
          <HStack>
            <Badge colorScheme={patient.status === "Active" ? "green" : "red"}>
              {patient.status || "Unknown"}
            </Badge>
            <Button colorScheme="blue" leftIcon={<FiPlus />} onClick={onOpen}>
              New Visit
            </Button>
          </HStack>
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

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Record New Visit</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Diagnosis / Reason for Visit</FormLabel>
                <Input
                  placeholder="e.g. Hypertension follow-up"
                  value={visitForm.disease}
                  onChange={(e) =>
                    setVisitForm({ ...visitForm, disease: e.target.value })
                  }
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>Blood Pressure</FormLabel>
                  <Input
                    placeholder="e.g. 120/80"
                    value={visitForm.bp}
                    onChange={(e) =>
                      setVisitForm({ ...visitForm, bp: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Pulse</FormLabel>
                  <Input
                    placeholder="e.g. 72"
                    value={visitForm.pulse}
                    onChange={(e) =>
                      setVisitForm({ ...visitForm, pulse: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Temperature</FormLabel>
                  <Input
                    placeholder="e.g. 98.6 F"
                    value={visitForm.temp}
                    onChange={(e) =>
                      setVisitForm({ ...visitForm, temp: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>SpO2</FormLabel>
                  <Input
                    placeholder="e.g. 98%"
                    value={visitForm.spo2}
                    onChange={(e) =>
                      setVisitForm({ ...visitForm, spo2: e.target.value })
                    }
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  placeholder="Clinical notes for this visit..."
                  value={visitForm.notes}
                  onChange={(e) =>
                    setVisitForm({ ...visitForm, notes: e.target.value })
                  }
                />
              </FormControl>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <FormLabel mb={0}>Prescription</FormLabel>
                  <Button
                    size="sm"
                    leftIcon={<FiPlus />}
                    variant="outline"
                    onClick={() =>
                      setPrescriptionLines([
                        ...prescriptionLines,
                        { medication: "", dosage: "", frequency: "" },
                      ])
                    }
                  >
                    Add Medication
                  </Button>
                </HStack>
                <VStack spacing={2} align="stretch">
                  {prescriptionLines.map((line, idx) => (
                    <HStack key={idx}>
                      <Input
                        placeholder="Medication"
                        value={line.medication}
                        onChange={(e) => {
                          const updated = [...prescriptionLines];
                          updated[idx].medication = e.target.value;
                          setPrescriptionLines(updated);
                        }}
                      />
                      <Input
                        placeholder="Dosage"
                        value={line.dosage}
                        onChange={(e) => {
                          const updated = [...prescriptionLines];
                          updated[idx].dosage = e.target.value;
                          setPrescriptionLines(updated);
                        }}
                      />
                      <Input
                        placeholder="Frequency"
                        value={line.frequency}
                        onChange={(e) => {
                          const updated = [...prescriptionLines];
                          updated[idx].frequency = e.target.value;
                          setPrescriptionLines(updated);
                        }}
                      />
                      <IconButton
                        aria-label="Remove medication"
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        isDisabled={prescriptionLines.length === 1}
                        onClick={() =>
                          setPrescriptionLines(
                            prescriptionLines.filter((_, i) => i !== idx),
                          )
                        }
                      />
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmitVisit}
              isLoading={submitting}
              loadingText="Saving..."
            >
              Save Visit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DoctorPatientDetails;
