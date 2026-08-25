import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@chakra-ui/react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");
    const userRole = localStorage.getItem("userRole");

    if (token && userData && userRole) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials, role = "patient", userOverride = null) => {
    try {
      if (role === "admin") {
        // 🔧 Fixed API URL and correct JSON keys
        const API_URL =
          process.env.REACT_APP_API_URL || "http://localhost:5002";

        const response = await fetch(`${API_URL}/admin/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: credentials.email.trim(),
            password: credentials.password.trim(),
          }),
        });

        const data = await response.json();
        console.log("📥 Backend response:", data);

        // Backend returns { msg: "Login successful", token: "...", ID: "...", HospitalName: "..." }
        if (data.msg === "Login successful") {
          const adminUser = {
            id: data.ID,
            email: credentials.email, // Backend doesn't return email, use input
            name: data.HospitalName || "Admin",
            role: "admin",
            username: data.HospitalName,
            isVerified: data.isVerified, // Capture verification status
            profilePicture:
              data.Image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                data.HospitalName || "Admin"
              )}&background=4A90E2&color=fff`,
          };

          setCurrentUser(adminUser);
          setIsAuthenticated(true);

          localStorage.setItem("authToken", data.token);
          localStorage.setItem("userData", JSON.stringify(adminUser));
          localStorage.setItem("userRole", "admin");

          toast({
            title: "Login Successful",
            description: `Welcome back, ${adminUser.name}!`,
            status: "success",
            duration: 3000,
            isClosable: true,
          });

          return {
            success: true,
            user: adminUser,
            redirectTo: "/admin/dashboard",
          };
        } else {
          // Use data.msg from backend if available
          throw new Error(
            data.msg || data.message || "Invalid admin credentials"
          );
        }
      }

      // Patient role: caller (FacialAuth / OTP flow) already authenticated
      // against the backend and hands us the real patient record + JWT via
      // userOverride — just persist it, no further network call needed.
      if (role === "patient" && userOverride) {
        const patientUser = { ...userOverride, role: "patient" };
        setCurrentUser(patientUser);
        setIsAuthenticated(true);
        localStorage.setItem(
          "authToken",
          userOverride.token || "mock-token-" + Date.now()
        );
        localStorage.setItem("userData", JSON.stringify(patientUser));
        localStorage.setItem("userRole", "patient");

        toast({
          title: "Login Successful",
          description: `Welcome back, ${patientUser.name || patientUser.Name}!`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        return {
          success: true,
          user: patientUser,
          redirectTo: "/patient/dashboard",
        };
      }

      // Doctor / Nurse / Scan Center: authenticate against the real backend.
      const PORTAL_LOGIN_ENDPOINTS = {
        doctor: "/doctor/login",
        nurse: "/nurse/login",
        scancenter: "/scan/login",
      };

      if (PORTAL_LOGIN_ENDPOINTS[role]) {
        const API_URL =
          process.env.REACT_APP_API_URL || "http://localhost:5002";

        const response = await fetch(
          `${API_URL}${PORTAL_LOGIN_ENDPOINTS[role]}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials.email.trim(),
              password: credentials.password.trim(),
            }),
          }
        );

        const data = await response.json();

        if (data.msg === "Username Found" && data.jwt) {
          const portalUser = {
            id: data.objectID,
            email: credentials.email,
            name: data.DoctorName || credentials.email.split("@")[0],
            role,
            profilePicture:
              data.photo ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                data.DoctorName || credentials.email.split("@")[0]
              )}&background=4A90E2&color=fff`,
            hospitalName: data.HospitalName,
            hospitalLogo: data.HospitalLogo,
          };

          setCurrentUser(portalUser);
          setIsAuthenticated(true);
          localStorage.setItem("authToken", data.jwt);
          localStorage.setItem("userData", JSON.stringify(portalUser));
          localStorage.setItem("userRole", role);

          toast({
            title: "Login Successful",
            description: `Welcome back, ${portalUser.name}!`,
            status: "success",
            duration: 3000,
            isClosable: true,
          });

          return {
            success: true,
            user: portalUser,
            redirectTo: `/${role}/dashboard`,
          };
        }

        throw new Error(data.msg || "Invalid credentials");
      }

      throw new Error("Please enter valid credentials");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        loading,
        login,
        logout,
        setCurrentUser,
        setIsAuthenticated,
        userRole: currentUser?.role || localStorage.getItem("userRole"),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
