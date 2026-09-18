import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Image,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiHome, FiArrowLeft } from "react-icons/fi";
import CustomButton from "../components/common/CustomButton";

const NotFound = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.600", "gray.300");

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box bg={bgColor} minH="100vh" display="flex" alignItems="center">
      <Container maxW="lg" textAlign="center">
        <VStack spacing={8}>
          {/* 404 Illustration */}
          <Box>
            <Image
              src="/404-illustration.svg"
              alt="Page not found"
              maxH="300px"
              fallback={
                <Box
                  w="300px"
                  h="200px"
                  bg="blue.100"
                  borderRadius="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mx="auto"
                >
                  <Text fontSize="6xl" fontWeight="bold" color="blue.500">
                    404
                  </Text>
                </Box>
              }
            />
          </Box>

          {/* Error Message */}
          <VStack spacing={4}>
            <Heading size="xl" color="blue.600">
              Page Not Found
            </Heading>
            <Text fontSize="lg" color={textColor} maxW="md" lineHeight="tall">
              Sorry, we couldn't find the page you're looking for. The page
              might have been removed, renamed, or doesn't exist.
            </Text>
          </VStack>

          {/* Action Buttons */}
          <VStack spacing={4} w="full" maxW="sm">
            <CustomButton
              leftIcon={<FiHome />}
              colorScheme="blue"
              size="lg"
              w="full"
              onClick={handleGoHome}
            >
              Go to Homepage
            </CustomButton>

            <CustomButton
              leftIcon={<FiArrowLeft />}
              variant="outline"
              size="lg"
              w="full"
              onClick={handleGoBack}
            >
              Go Back
            </CustomButton>
          </VStack>

          {/* Help Text */}
          <Box pt={8}>
            <Text fontSize="sm" color={textColor}>
              Need help? Contact our support team or check our{" "}
              <Text
                as="span"
                color="blue.500"
                textDecoration="underline"
                cursor="pointer"
              >
                documentation
              </Text>
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default NotFound;
