// API Configuration
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || "http://localhost:5002",
  ENDPOINTS: {
    ADMIN_LOGIN: "/admin/login",
    DOCTOR_LOGIN: "/doctor/login",
    NURSE_LOGIN: "/nurse/login",
    PATIENT_LOGIN: "/patient/loginforpatient",
    SCAN_CENTER_LOGIN: "/scancenter/login",
    // Dashboard stats endpoints
    COUNTS: "/counts",
  },
};

// Helper to build URL
export const buildApiUrl = (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`;

// Generic API call function
export const apiCall = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint);
  const defaultOptions = {
    headers: { "Content-Type": "application/json", ...options.headers },
  };
  const response = await fetch(url, { ...defaultOptions, ...options });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
};

// Login functions
export const adminLogin = (credentials) =>
  apiCall(API_CONFIG.ENDPOINTS.ADMIN_LOGIN, {
    method: "POST",
    body: JSON.stringify(credentials),
  });
export const doctorLogin = (credentials) =>
  apiCall(API_CONFIG.ENDPOINTS.DOCTOR_LOGIN, {
    method: "POST",
    body: JSON.stringify(credentials),
  });
export const nurseLogin = (credentials) =>
  apiCall(API_CONFIG.ENDPOINTS.NURSE_LOGIN, {
    method: "POST",
    body: JSON.stringify(credentials),
  });
export const patientLogin = (credentials) =>
  apiCall(API_CONFIG.ENDPOINTS.PATIENT_LOGIN, {
    method: "POST",
    body: JSON.stringify(credentials),
  });
export const scanCenterLogin = (credentials) =>
  apiCall(API_CONFIG.ENDPOINTS.SCAN_CENTER_LOGIN, {
    method: "POST",
    body: JSON.stringify(credentials),
  });

// Generic login API
export const loginAPI = (role, credentials) => {
  switch (role) {
    case "admin":
      return adminLogin(credentials);
    case "doctor":
      return doctorLogin(credentials);
    case "nurse":
      return nurseLogin(credentials);
    case "patient":
      return patientLogin(credentials);
    case "scancenter":
      return scanCenterLogin(credentials);
    default:
      throw new Error("Invalid role for login");
  }
};

export default API_CONFIG;
