import axios from "axios";

// Configure axios defaults for cross-origin requests
axios.defaults.withCredentials = true;

// Dynamically determine the backend URL based on the current window location
const getBackendUrl = () => {
  const hostname = window.location.hostname;
  return `http://${hostname}:5002/ai`;
};

const API_URL = getBackendUrl();

export const analyzeImage = async (imageData, patientId = "") => {
  try {
    console.log(
      "Sending image analysis request to:",
      `${API_URL}/analyze-image`,
    );

    const response = await axios.post(
      `${API_URL}/analyze-image`,
      {
        image: imageData,
        patientId: patientId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 60000, // 60 second timeout for large image processing
      },
    );

    console.log("Analysis response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error analyzing image:", error);

    // Provide detailed error messages
    if (error.response) {
      console.error("Error response:", error.response.data);
      throw new Error(
        error.response.data?.msg ||
          `Server error: ${error.response.status} - ${error.response.statusText}`,
      );
    } else if (error.request) {
      console.error("No response received:", error.request);
      throw new Error(
        "No response from server. Check backend is running on port 5002",
      );
    } else {
      throw new Error(error.message || "Error analyzing image");
    }
  }
};

export const analyzeLabResult = async (testName, value) => {
  try {
    const response = await axios.post(`${API_URL}/analyze-lab`, {
      testName,
      value,
    });
    return response.data;
  } catch (error) {
    console.error("Error analyzing lab result:", error);
    throw error;
  }
};

export const checkDrugInteraction = async (patientId, drugName) => {
  try {
    const response = await axios.post(`${API_URL}/check-drugs`, {
      patientId,
      drugName,
    });
    return response.data;
  } catch (error) {
    console.error("Error checking drug interactions:", error);
    throw error;
  }
};

export const smartSearch = async (query, patientId) => {
  try {
    const response = await axios.post(`${API_URL}/smart-search`, {
      query,
      patientId,
    });
    return response.data;
  } catch (error) {
    console.error("Error performing smart search:", error);
    throw error;
  }
};
