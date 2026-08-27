const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5002";

export const adminAPI = {
  getDashboardStats: async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_URL}/admin/getdashboardstats`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      return {
        data: {
          totalDoctors: data.totalDoctors || 0,
          totalNurses: data.totalNurses || 0,
          totalPatients: data.totalPatients || 0,
          totalScanCenters: data.totalScanCenters || 0,
        },
      };
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      return {
        data: {
          totalDoctors: 0,
          totalNurses: 0,
          totalPatients: 0,
          totalScanCenters: 0,
        },
      };
    }
  },
};

export const doctorAPI = {
  getDashboardStats: () =>
    Promise.resolve({
      data: {
        totalPatients: 156,
        appointmentsToday: 8,
      },
    }),
};

export const nurseAPI = {
  getDashboardStats: () =>
    Promise.resolve({
      data: {
        patientsRegistered: 45,
        todayAdmissions: 12,
      },
    }),
};

export const patientAPI = {
  getDashboardStats: () =>
    Promise.resolve({
      data: {
        totalRecords: 23,
        upcomingAppointments: 2,
      },
    }),
};

export const scanCenterAPI = {
  getDashboardStats: () =>
    Promise.resolve({
      data: {
        totalScans: 234,
        pendingResults: 12,
      },
    }),
};

export const aiAPI = {
  summarizeMedicalData: (data) =>
    Promise.resolve({
      data: {
        summary: "AI-generated medical summary",
        insights: ["Key insight 1", "Key insight 2"],
      },
    }),
};

export const faceAPI = {
  authenticateWithFace: (imageUrl) =>
    Promise.resolve({
      data: {
        authenticated: true,
        confidence: 95.2,
        userId: "test-user-123",
      },
    }),
};

export const userAPI = {
  getProfile: (userId) =>
    Promise.resolve({
      data: {
        id: userId,
        name: "John Doe",
        email: "user@medivault.com",
        phone: "+1 (555) 123-4567",
        address: "123 Main St, City, State 12345",
        bio: "Healthcare professional dedicated to providing quality care.",
        avatar: null,
        createdAt: "2024-01-01",
        lastLogin: "2024-11-01",
      },
    }),

  updateProfile: (userId, profileData) =>
    Promise.resolve({
      data: {
        ...profileData,
        id: userId,
        updatedAt: new Date().toISOString(),
      },
    }),
};
