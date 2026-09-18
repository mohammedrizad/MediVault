import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Avatar,
  Badge,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import CustomButton from "../components/common/CustomButton";
import DataCard from "../components/common/DataCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import dataService from "../services/DataService";

const ROLE_ENDPOINTS = {
  nurse: { list: "/nurse/getall", key: "nurses" },
  scancenter: { list: "/scan/getall", key: "scanCenters" },
};

const Profile = () => {
  const { currentUser, userRole } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    address: currentUser?.address || "",
    bio: currentUser?.bio || "",
  });

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    const loadProfile = async () => {
      const config = ROLE_ENDPOINTS[userRole];
      if (!config || !currentUser?.id) {
        setLoading(false);
        return;
      }
      try {
        const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";
        const res = await fetch(`${API_URL}${config.list}`);
        const data = await res.json();
        const list = data[config.key] || data.result || [];
        const record = list.find((r) => r._id === currentUser.id);
        if (record) {
          setFormData({
            name: record.Doctor_name || record.username || "",
            email: record.Email_Address || "",
            phone: record.PhoneNo || "",
            address: record.Current_Address || "",
            bio: record.Qualifications || "",
          });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, userRole]);

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        qualifications: formData.bio,
      };
      if (userRole === "nurse") {
        await dataService.updateNurse(currentUser.id, payload);
      } else if (userRole === "scancenter") {
        await dataService.updateScanCenter(currentUser.id, payload);
      }
      setEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
      address: currentUser?.address || "",
      bio: currentUser?.bio || "",
    });
    setEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            My Profile
          </Heading>
          <Text color="gray.600">
            Manage your personal information and account settings.
          </Text>
        </Box>

        {/* Profile Overview */}
        <DataCard title="Profile Information" variant="detailed">
          <VStack spacing={6} align="stretch">
            {/* Avatar and Basic Info */}
            <HStack spacing={6} align="start">
              <Avatar
                size="2xl"
                name={formData.name}
                src={currentUser?.avatar}
              />
              <VStack align="start" spacing={2} flex={1}>
                <HStack>
                  <Heading size="md">{formData.name}</Heading>
                  <Badge colorScheme="blue" variant="subtle">
                    {currentUser?.role?.charAt(0).toUpperCase() +
                      currentUser?.role?.slice(1)}
                  </Badge>
                </HStack>
                <Text color="gray.600">{formData.email}</Text>
                <Text fontSize="sm" color="gray.500">
                  Member since{" "}
                  {new Date(
                    currentUser?.createdAt || Date.now()
                  ).toLocaleDateString()}
                </Text>
              </VStack>
              <CustomButton
                colorScheme={editing ? "gray" : "blue"}
                variant={editing ? "outline" : "solid"}
                onClick={() => setEditing(!editing)}
              >
                {editing ? "Cancel" : "Edit Profile"}
              </CustomButton>
            </HStack>

            <Divider />

            {/* Profile Form */}
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Full Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  isReadOnly={!editing}
                  bg={editing ? "inherit" : "gray.50"}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Email Address</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  isReadOnly={!editing}
                  bg={editing ? "inherit" : "gray.50"}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  isReadOnly={!editing}
                  bg={editing ? "inherit" : "gray.50"}
                  placeholder="Enter phone number"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Address</FormLabel>
                <Textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  isReadOnly={!editing}
                  bg={editing ? "inherit" : "gray.50"}
                  placeholder="Enter your address"
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Bio</FormLabel>
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  isReadOnly={!editing}
                  bg={editing ? "inherit" : "gray.50"}
                  placeholder="Tell us about yourself"
                  rows={4}
                />
              </FormControl>

              {editing && (
                <HStack spacing={4} pt={4}>
                  <CustomButton colorScheme="blue" onClick={handleSave}>
                    Save Changes
                  </CustomButton>
                  <CustomButton variant="outline" onClick={handleCancel}>
                    Cancel
                  </CustomButton>
                </HStack>
              )}
            </VStack>
          </VStack>
        </DataCard>

        {/* Account Security */}
        <DataCard
          title="Account Security"
          subtitle="Manage your account security settings"
        >
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Box>
                <Text fontWeight="medium">Password</Text>
                <Text fontSize="sm" color="gray.600">
                  Last changed 30 days ago
                </Text>
              </Box>
              <CustomButton variant="outline" size="sm">
                Change Password
              </CustomButton>
            </HStack>

            <Divider />

            <HStack justify="space-between">
              <Box>
                <Text fontWeight="medium">Two-Factor Authentication</Text>
                <Text fontSize="sm" color="gray.600">
                  Add an extra layer of security
                </Text>
              </Box>
              <CustomButton variant="outline" size="sm">
                Enable 2FA
              </CustomButton>
            </HStack>
          </VStack>
        </DataCard>
      </VStack>
    </Container>
  );
};

export default Profile;
