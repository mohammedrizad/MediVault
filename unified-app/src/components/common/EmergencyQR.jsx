import React, { useState } from "react";
import {
  Box,
  Button,
  VStack,
  Text,
  Image,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { FiDownload, FiEye } from "react-icons/fi";

const EmergencyQR = ({ medicalId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchQRCode = async () => {
    if (qrCode) {
      onOpen();
      return;
    }

    setLoading(true);
    try {
      const API_BASE_URL =
        process.env.REACT_APP_API_BASE_URL || "http://localhost:5002";
      const response = await fetch(
        `${API_BASE_URL}/emergency/generate-qr/${medicalId}`
      );

      if (!response.ok) {
        throw new Error("Failed to generate QR code");
      }

      const data = await response.json();
      setQrCode(data.qrCode);
      onOpen();
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not generate Emergency QR Code",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `Emergency_QR_${medicalId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Button
        leftIcon={<FiEye />}
        colorScheme="red"
        variant="outline"
        onClick={fetchQRCode}
        isLoading={loading}
        loadingText="Generating..."
      >
        Emergency QR
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center" color="red.600">
            Emergency Access QR Code
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Text textAlign="center" fontSize="sm" color="gray.600">
                In case of emergency, medical personnel can scan this code to
                access your critical health information instantly.
              </Text>

              {qrCode ? (
                <Box
                  p={4}
                  bg="white"
                  border="4px solid"
                  borderColor="red.500"
                  borderRadius="lg"
                >
                  <Image src={qrCode} alt="Emergency QR Code" boxSize="250px" />
                </Box>
              ) : (
                <Center h="250px">
                  <Spinner color="red.500" />
                </Center>
              )}

              <Button
                leftIcon={<FiDownload />}
                colorScheme="red"
                onClick={downloadQR}
                w="full"
              >
                Download & Save
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EmergencyQR;
