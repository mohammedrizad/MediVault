import React from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  useToast,
  useColorModeValue,
  Card,
  CardBody,
  SimpleGrid,
  Badge,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiUser, FiCalendar, FiFileText } from "react-icons/fi";
import dataService from "../services/DataService";

const DoctorSearch = () => {
  const [uhid, setUhid] = useState("");
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();
  const bg = useColorModeValue("gray.50", "gray.900");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!uhid.trim()) {
      toast({
        title: "Error",
        description: "Please enter a UHID",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    setPatient(null);
    try {
      const result = await dataService.searchPatient(uhid);

      if (result) {
        setPatient({
          id: result._id,
          name: result.Name,
          uhid: result.MedicalId,
          age: result.Age,
          gender: result.Gender,
          phone: result.Mobile_no,
          email: result.Email,
          bloodGroup: result.BloodGroup || "N/A",
          address: result.Address || "N/A",
          allergies: result.Allergies || "None",
          chronicConditions: result.ChronicConditions || "None",
          assignedDoctor: result.assignedDoctor || "Unassigned",
          status: result.status || "Active",
          history: result.History || [],
        });
      } else {
        toast({
          title: "Not Found",
          description: "No patient found with this UHID",
          status: "warning",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: error.message || "Error searching for patient",
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
        <Text fontSize="2xl" fontWeight="bold">
          Patient Search
        </Text>

        <Card>
          <CardBody>
            <form onSubmit={handleSearch}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Enter Patient UHID / Name / Phone</FormLabel>
                  <HStack>
                    <Input
                      value={uhid}
                      onChange={(e) => setUhid(e.target.value)}
                      placeholder="Search by UHID, name, phone, or email"
                      size="lg"
                    />
                    <Button
                      type="submit"
                      colorScheme="blue"
                      leftIcon={<FiSearch />}
                      isLoading={loading}
                      loadingText="Searching..."
                      minW="120px"
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
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="xl" fontWeight="semibold">
                    Patient Information
                  </Text>
                  <Badge
                    colorScheme={patient.status === "Active" ? "green" : "red"}
                    fontSize="sm"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {patient.status}
                  </Badge>
                </HStack>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <HStack>
                    <FiUser />
                    <Text fontWeight="medium">Name:</Text>
                    <Text>{patient.name}</Text>
                  </HStack>
                  <HStack>
                    <FiFileText />
                    <Text fontWeight="medium">UHID:</Text>
                    <Text>{patient.uhid}</Text>
                  </HStack>
                  <HStack>
                    <FiCalendar />
                    <Text fontWeight="medium">Age:</Text>
                    <Text>{patient.age} years</Text>
                  </HStack>
                  <HStack>
                    <FiUser />
                    <Text fontWeight="medium">Gender:</Text>
                    <Text>{patient.gender}</Text>
                  </HStack>
                  <HStack>
                    <FiFileText />
                    <Text fontWeight="medium">Blood Group:</Text>
                    <Text>{patient.bloodGroup}</Text>
                  </HStack>
                  <HStack>
                    <FiFileText />
                    <Text fontWeight="medium">Phone:</Text>
                    <Text>{patient.phone}</Text>
                  </HStack>
                  <HStack>
                    <FiFileText />
                    <Text fontWeight="medium">Email:</Text>
                    <Text>{patient.email}</Text>
                  </HStack>
                  <HStack>
                    <FiUser />
                    <Text fontWeight="medium">Assigned Doctor:</Text>
                    <Text>{patient.assignedDoctor}</Text>
                  </HStack>
                  <HStack>
                    <FiFileText />
                    <Text fontWeight="medium">Allergies:</Text>
                    <Text>{patient.allergies}</Text>
                  </HStack>
                  <HStack>
                    <FiFileText />
                    <Text fontWeight="medium">Chronic Conditions:</Text>
                    <Text>{patient.chronicConditions}</Text>
                  </HStack>
                </SimpleGrid>

                {/* Medical History */}
                {patient.history && patient.history.length > 0 && (
                  <Box mt={2}>
                    <Text fontSize="lg" fontWeight="semibold" mb={2}>
                      Medical History
                    </Text>
                    <VStack spacing={2} align="stretch">
                      {patient.history.map((record, idx) => (
                        <Box
                          key={idx}
                          p={3}
                          bg="gray.50"
                          borderRadius="md"
                          border="1px solid"
                          borderColor="gray.200"
                        >
                          <HStack justify="space-between">
                            <Text fontWeight="medium">{record.disease}</Text>
                            <Badge colorScheme="blue">{record.Date}</Badge>
                          </HStack>
                          {record.notes && (
                            <Text fontSize="sm" color="gray.600" mt={1}>
                              {record.notes}
                            </Text>
                          )}
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                )}

                <Button
                  colorScheme="green"
                  size="lg"
                  onClick={() => navigate(`/doctor/patient/${patient.uhid}`)}
                >
                  View Full Medical Record
                </Button>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
};

export default DoctorSearch;
