import React, { createContext, useContext, useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const toast = useToast();

  const mockUsers = {
    admin: {
      id: 1,
      name: "Admin User",
      email: "admin@medivault.com",
      role: "admin",
    },
    doctor: {
      id: 2,
      name: "Dr. Smith",
      email: "doctor@medivault.com",
      role: "doctor",
    },
    nurse: {
      id: 3,
      name: "Nurse Johnson",
      email: "nurse@medivault.com",
      role: "nurse",
    },
    patient: {
      id: 4,
      name: "John Doe",
      email: "patient@medivault.com",
      role: "patient",
    },
    scancenter: {
      id: 5,
      name: "Scan Center",
      email: "scan@medivault.com",
      role: "scancenter",
    },
  };

  const login = async (credentials, role) => {
    try {
      setLoading(true);

      // Real backend authentication for admin
      if (role === "admin") {
        const response = await fetch("http://localhost:5012/admin/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            adminuser: credentials.email,
            password: credentials.password,
          }),
        });

        const data = await response.json();

        if (data.msg === "Login successful") {
          const user = {
            id: data.ID,
            email: credentials.email,
            name: data.HospitalName || credentials.email.split("@")[0],
            role: role,
            profilePicture:
              data.Image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                credentials.email.split("@")[0]
              )}&background=4A90E2&color=fff`,
            hospitalName: data.HospitalName,
            token: data.token,
          };

          setCurrentUser(user);
          setIsAuthenticated(true);

          localStorage.setItem("authToken", data.token);
          localStorage.setItem("userData", JSON.stringify(user));
          localStorage.setItem("userRole", role);

          toast({
            title: "Login Successful",
            description: `Welcome back, ${user.name}!`,
            status: "success",
            duration: 3000,
            isClosable: true,
          });

          return {
            success: true,
            user: user,
            redirectTo: `/${role}/dashboard`,
          };
        } else {
          throw new Error(data.msg || "Invalid admin credentials");
        }
      }

  const login = async (credentials, role = "patient") => {
    try {
      if (role === "admin") {
        // Real backend authentication for admin
        const response = await fetch("http://localhost:5002/admin/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            adminuser: credentials.email,
            password: credentials.password,
          }),
        });

        const data = await response.json();

        if (data.msg === "Login successful") {
          const adminUser = {
            id: data.ID,
            email: credentials.email,
            name: data.HospitalName || credentials.email.split("@")[0],
            role: "admin",
            profilePicture: data.Image || `https://ui-avatars.com/api/?name=${encodeURIComponent(
              data.HospitalName || credentials.email.split("@")[0]
            )}&background=4A90E2&color=fff`,
            hospitalName: data.HospitalName,
            token: data.token,
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
          throw new Error(data.msg || "Invalid admin credentials");
        }
      }

      // Mock authentication for other roles (doctor, nurse, patient)
      if (credentials.email && credentials.password && credentials.password.length >= 3) {
        const mockUser = {
          id: Date.now().toString(),
          email: credentials.email,
          name: credentials.email.split("@")[0],
          role: role,
          profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            credentials.email.split("@")[0]
          )}&background=4A90E2&color=fff`,
        };

        setCurrentUser(mockUser);
        setIsAuthenticated(true);

        localStorage.setItem("authToken", "mock-token-" + Date.now());
        localStorage.setItem("userData", JSON.stringify(mockUser));
        localStorage.setItem("userRole", role);

        toast({
          title: "Login Successful",
          description: `Welcome back, ${mockUser.name}!`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        return {
          success: true,
          user: mockUser,
          redirectTo: `/${role}/dashboard`,
        };
      } else {
        throw new Error("Please enter valid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return {
        success: false,
        error: error.message,
      };
    }
  };
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            adminuser: credentials.email,
            password: credentials.password,
          }),
        });

        const data = await response.json();

        if (data.msg === "Login successful") {
          const adminUser = {
            id: data.ID,
            email: credentials.email,
            name: data.HospitalName || credentials.email.split("@")[0],
            role: "admin",
            profilePicture: data.Image || `https://ui-avatars.com/api/?name=${encodeURIComponent(
              data.HospitalName || credentials.email.split("@")[0]
            )}&background=4A90E2&color=fff`,
            hospitalName: data.HospitalName,
            token: data.token,
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
          throw new Error(data.msg || "Invalid admin credentials");
        }
      }

      // Mock authentication for other roles (doctor, nurse, patient)
      if (credentials.email && credentials.password) {
        const mockUser = {
          id: Date.now().toString(),
          email: credentials.email,
          name: credentials.email.split("@")[0],
          role: role,
          profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            credentials.email.split("@")[0]
          )}&background=4A90E2&color=fff`,
        };

        setCurrentUser(mockUser);
        setIsAuthenticated(true);

        localStorage.setItem("authToken", "mock-token-" + Date.now());
        localStorage.setItem("userData", JSON.stringify(mockUser));
        localStorage.setItem("userRole", role);

        toast({
          title: "Login Successful",
          description: `Welcome back, ${mockUser.name}!`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        return {
          success: true,
          user: mockUser,
          redirectTo: `/${role}/dashboard`,
        };
      } else {
        throw new Error("Please enter a valid email and password");
      }

        setCurrentUser(mockUser);
        setIsAuthenticated(true);

        localStorage.setItem("authToken", "mock-token-" + Date.now());
        localStorage.setItem("userData", JSON.stringify(mockUser));
        localStorage.setItem("userRole", role);

        toast({
          title: "Login Successful",
          description: `Welcome back, ${mockUser.name}!`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        return {
          success: true,
          user: mockUser,
          redirectTo: `/${role}/dashboard`,
        };
      } else {
        throw new Error("Please enter a valid email and password");
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description:
          error.message || "Please check your credentials and try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
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

  const value = {
    currentUser,
    loading,
    isAuthenticated,
    login,
    logout,
    userRole: currentUser?.role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
