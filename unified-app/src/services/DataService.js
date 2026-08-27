// Central Data Service - Manages all data operations and synchronization across portals
class DataService {
  constructor() {
    this.API_BASE_URL =
      process.env.REACT_APP_API_URL || "http://localhost:5002";
    this.eventListeners = new Map();
  }

  // Event system for real-time updates across portals
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const callbacks = this.eventListeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Helper method for API calls
  async apiCall(endpoint, method = "GET", data = null) {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include", // ✅ Enable cookies/sessions for cross-origin requests
      };

      if (data) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.API_BASE_URL}${endpoint}`, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // PATIENT OPERATIONS
  async getPatients() {
    try {
      const data = await this.apiCall("/patient/getall");
      const rawPatients = data.result || [];

      // Map backend fields to frontend expected format
      return rawPatients.map((p) => ({
        _id: p._id,
        id: p._id, // Frontend uses both
        MedicalId: p.MedicalId,
        name: p.Name || "",
        email: p.Email || "",
        phone: p.Mobile_no || "",
        age: p.Age || "",
        gender: p.Gender || "",
        bloodGroup: p.BloodGroup || "",
        condition: p.ChronicConditions || "",
        address: p.Address || "",
        emergencyContact: p.EmergencyContactName || "",
        emergencyPhone: p.EmergencyContactNumber || "",
        allergies: p.Allergies || "",
        photo: p.Photo || "",
        status: p.status || "Active",
        doctor: p.assignedDoctor || "Unassigned",
        doctorId: p.doctorId || "",
        admissionDate: p.createdAt
          ? new Date(p.createdAt).toLocaleDateString()
          : new Date().toLocaleDateString(),
      }));
    } catch (error) {
      console.error("Error fetching patients:", error);
      return [];
    }
  }

  async searchPatient(medicalId) {
    try {
      const response = await this.apiCall(`/patient/search/${medicalId}`);
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error searching patient:", error);
      return null;
    }
  }

  async addPatient(patientData) {
    try {
      const response = await this.apiCall(
        "/patient/register",
        "POST",
        patientData
      );
      if (response.msg === "Registration Successfully Done") {
        this.emit("patient:added", response.patient);
        return response;
      }
      throw new Error(response.msg || "Failed to add patient");
    } catch (error) {
      console.error("Error adding patient:", error);
      throw error;
    }
  }

  async updatePatient(patientId, patientData) {
    try {
      // Map frontend fields back to backend format
      const backendData = {
        Name: patientData.name,
        Email: patientData.email,
        Mobile_no: patientData.phone,
        Age: patientData.age,
        Gender: patientData.gender,
        BloodGroup: patientData.bloodGroup,
        ChronicConditions: patientData.condition,
        Address: patientData.address,
        EmergencyContactName: patientData.emergencyContact,
        EmergencyContactNumber: patientData.emergencyPhone,
        Allergies: patientData.allergies,
        Photo: patientData.photo,
        status: patientData.status,
        assignedDoctor: patientData.assignedDoctor,
        doctorId: patientData.doctorId,
      };

      const response = await this.apiCall(
        `/patient/update/${patientId}`,
        "PUT",
        backendData
      );
      if (response.msg === "Patient updated successfully") {
        this.emit("patient:updated", { id: patientId, data: patientData });
        return response;
      }
      throw new Error(response.msg || "Failed to update patient");
    } catch (error) {
      console.error("Error updating patient:", error);
      throw error;
    }
  }

  async deletePatient(patientId) {
    try {
      const response = await this.apiCall(
        `/patient/delete/${patientId}`,
        "DELETE"
      );
      if (response.msg === "Patient deleted successfully from all portals") {
        this.emit("patient:deleted", {
          id: patientId,
          patient: response.deletedPatient,
        });
        return response;
      }
      throw new Error(response.msg || "Failed to delete patient");
    } catch (error) {
      console.error("Error deleting patient:", error);
      throw error;
    }
  }

  // DOCTOR OPERATIONS
  async getDoctors() {
    try {
      console.log("[DataService] Fetching doctors...");
      const data = await this.apiCall("/doctor/getall");
      console.log(
        "[DataService] Doctors fetched:",
        (data.doctors || data.result || []).length,
        "records"
      );
      return data.doctors || data.result || [];
    } catch (error) {
      console.error("Error fetching doctors:", error);
      return [];
    }
  }

  async addDoctor(doctorData) {
    try {
      // Get AdminID from localStorage
      let adminId = null;
      try {
        const userData = localStorage.getItem("userData");
        if (userData) {
          const user = JSON.parse(userData);
          adminId = user.id || user.AdminId || user._id;
        }
      } catch (e) {
        console.error("Error parsing user data for AdminID:", e);
      }

      // Transform frontend data to backend format
      const transformedData = {
        AdminID: adminId,
        Doctor_name: doctorData.name,
        Email_Address: doctorData.email,
        PhoneNo: doctorData.phone,
        Specialization: doctorData.specialization,
        Years_of_experience: doctorData.experience,
        Current_Address: doctorData.address,
        Qualifications: doctorData.qualifications,
        // Add other required fields with defaults
        DOB: doctorData.dob || new Date().toISOString().split("T")[0],
        Gender: doctorData.gender || "Not Specified",
        Medical_License_Number: doctorData.licenseNumber || `ML${Date.now()}`,
        Medical_Council_Registration_Number:
          doctorData.councilNumber || `MC${Date.now()}`,
        Contract_type: doctorData.contractType || "Full-time",
        Date_Joined: new Date().toISOString().split("T")[0],
        Day_Joined: new Date().toLocaleDateString("en-US", { weekday: "long" }),
        Time_Joined: new Date().toLocaleTimeString(),
      };

      console.log("[DataService] Original form data:", doctorData);
      console.log(
        "[DataService] Transformed data being sent:",
        transformedData
      );
      const response = await this.apiCall(
        "/doctor/register",
        "POST",
        transformedData
      );
      console.log("[DataService] Doctor add response:", response);
      if (response.msg === "Doctor registered successfully") {
        this.emit("doctor:added", response.doctor);
        return response;
      }
      throw new Error(response.msg || "Failed to add doctor");
    } catch (error) {
      console.error("Error adding doctor:", error);
      throw error;
    }
  }

  async updateDoctor(doctorId, doctorData) {
    try {
      // Transform frontend data to backend format
      const transformedData = {
        Doctor_name: doctorData.name,
        Email_Address: doctorData.email,
        PhoneNo: doctorData.phone,
        Specialization: doctorData.specialization,
        Years_of_experience: doctorData.experience,
        Current_Address: doctorData.address,
        Qualifications: doctorData.qualifications,
        // Preserve existing fields if not provided
        DOB: doctorData.dob,
        Gender: doctorData.gender,
        Medical_License_Number: doctorData.licenseNumber,
        Medical_Council_Registration_Number: doctorData.councilNumber,
        Contract_type: doctorData.contractType,
      };

      // Remove undefined fields to preserve existing data
      Object.keys(transformedData).forEach((key) => {
        if (transformedData[key] === undefined) {
          delete transformedData[key];
        }
      });

      const response = await this.apiCall(
        `/doctor/update/${doctorId}`,
        "PUT",
        transformedData
      );
      if (response.msg === "Doctor updated successfully") {
        this.emit("doctor:updated", { id: doctorId, data: transformedData });
        return response;
      }
      throw new Error(response.msg || "Failed to update doctor");
    } catch (error) {
      console.error("Error updating doctor:", error);
      throw error;
    }
  }

  async deleteDoctor(doctorId) {
    try {
      const response = await this.apiCall(
        `/doctor/delete/${doctorId}`,
        "DELETE"
      );
      if (response.msg === "Doctor deleted successfully from all portals") {
        this.emit("doctor:deleted", {
          id: doctorId,
          doctor: response.deletedDoctor,
        });
        return response;
      }
      throw new Error(response.msg || "Failed to delete doctor");
    } catch (error) {
      console.error("Error deleting doctor:", error);
      throw error;
    }
  }

  // NURSE OPERATIONS
  async getNurses() {
    try {
      const data = await this.apiCall("/nurse/getall");
      return data.nurses || data.result || [];
    } catch (error) {
      console.error("Error fetching nurses:", error);
      return [];
    }
  }

  async addNurse(nurseData) {
    try {
      // Transform frontend data to backend format
      const transformedData = {
        Doctor_name: nurseData.name, // Note: Schema uses Doctor_name for nurses too
        Email_Address: nurseData.email,
        PhoneNo: nurseData.phone,
        Specialization: nurseData.department, // Map department to specialization
        Years_of_experience: nurseData.experience,
        Current_Address: nurseData.address,
        Qualifications: nurseData.qualifications,
        // Add other required fields with defaults
        DOB: nurseData.dob || new Date().toISOString().split("T")[0],
        Gender: nurseData.gender || "Not Specified",
        Medical_License_Number: nurseData.licenseNumber || `NL${Date.now()}`,
        Medical_Council_Registration_Number:
          nurseData.councilNumber || `NC${Date.now()}`,
        Date_Joined: new Date().toISOString().split("T")[0],
        Day_Joined: new Date().toLocaleDateString("en-US", { weekday: "long" }),
        Time_Joined: new Date().toLocaleTimeString(),
      };

      const response = await this.apiCall(
        "/nurse/register",
        "POST",
        transformedData
      );
      if (response.msg === "Nurse registered successfully") {
        this.emit("nurse:added", response.nurse);
        return response;
      }
      throw new Error(response.msg || "Failed to add nurse");
    } catch (error) {
      console.error("Error adding nurse:", error);
      throw error;
    }
  }

  async updateNurse(nurseId, nurseData) {
    try {
      // Transform frontend data to backend format
      const transformedData = {
        Doctor_name: nurseData.name, // Note: Schema uses Doctor_name for nurses too
        Email_Address: nurseData.email,
        PhoneNo: nurseData.phone,
        Specialization: nurseData.department, // Map department to specialization
        Years_of_experience: nurseData.experience,
        Current_Address: nurseData.address,
        Qualifications: nurseData.qualifications,
        // Preserve existing fields if not provided
        DOB: nurseData.dob,
        Gender: nurseData.gender,
        Medical_License_Number: nurseData.licenseNumber,
        Medical_Council_Registration_Number: nurseData.councilNumber,
      };

      // Remove undefined fields to preserve existing data
      Object.keys(transformedData).forEach((key) => {
        if (transformedData[key] === undefined) {
          delete transformedData[key];
        }
      });

      const response = await this.apiCall(
        `/nurse/update/${nurseId}`,
        "PUT",
        transformedData
      );
      if (response.msg === "Nurse updated successfully") {
        this.emit("nurse:updated", { id: nurseId, data: transformedData });
        return response;
      }
      throw new Error(response.msg || "Failed to update nurse");
    } catch (error) {
      console.error("Error updating nurse:", error);
      throw error;
    }
  }

  async deleteNurse(nurseId) {
    try {
      const response = await this.apiCall(`/nurse/delete/${nurseId}`, "DELETE");
      if (response.msg === "Nurse deleted successfully from all portals") {
        this.emit("nurse:deleted", {
          id: nurseId,
          nurse: response.deletedNurse,
        });
        return response;
      }
      throw new Error(response.msg || "Failed to delete nurse");
    } catch (error) {
      console.error("Error deleting nurse:", error);
      throw error;
    }
  }

  // SCAN CENTER OPERATIONS
  async getScanCenters() {
    try {
      const data = await this.apiCall("/scan/getall");
      return data.result || [];
    } catch (error) {
      console.error("Error fetching scan centers:", error);
      return [];
    }
  }

  async addScanCenter(scanCenterData) {
    try {
      // Transform frontend data to backend format
      const transformedData = {
        username: scanCenterData.name,
        Email_Address: scanCenterData.email,
        PhoneNo: scanCenterData.phone,
        Current_Address: scanCenterData.location,
        Qualifications:
          scanCenterData.specifications || scanCenterData.equipment,
        Years_of_experience: scanCenterData.experience || "1",
        // Add other required fields with defaults
        DOB: scanCenterData.dob || new Date().toISOString().split("T")[0],
        Gender: scanCenterData.gender || "Not Specified",
        Medical_License_Number:
          scanCenterData.licenseNumber || `SC${Date.now()}`,
        Medical_Council_Registration_Number:
          scanCenterData.councilNumber || `SCC${Date.now()}`,
        Date_Joined: new Date().toISOString().split("T")[0],
        Day_Joined: new Date().toLocaleDateString("en-US", { weekday: "long" }),
        Time_Joined: new Date().toLocaleTimeString(),
      };

      const response = await this.apiCall(
        "/scan/register",
        "POST",
        transformedData
      );
      if (response.msg === "Scan center registered successfully") {
        this.emit("scancenter:added", response.scanCenter);
        return response;
      }
      throw new Error(response.msg || "Failed to add scan center");
    } catch (error) {
      console.error("Error adding scan center:", error);
      throw error;
    }
  }

  async updateScanCenter(scanCenterId, scanCenterData) {
    try {
      // Transform frontend data to backend format
      const transformedData = {
        username: scanCenterData.name,
        Email_Address: scanCenterData.email,
        PhoneNo: scanCenterData.phone,
        Current_Address: scanCenterData.location,
        Qualifications:
          scanCenterData.specifications || scanCenterData.equipment,
        Years_of_experience: scanCenterData.experience,
        // Preserve existing fields if not provided
        DOB: scanCenterData.dob,
        Gender: scanCenterData.gender,
        Medical_License_Number: scanCenterData.licenseNumber,
        Medical_Council_Registration_Number: scanCenterData.councilNumber,
      };

      // Remove undefined fields to preserve existing data
      Object.keys(transformedData).forEach((key) => {
        if (transformedData[key] === undefined) {
          delete transformedData[key];
        }
      });

      const response = await this.apiCall(
        `/scan/update/${scanCenterId}`,
        "PUT",
        transformedData
      );
      if (response.msg === "Scan center updated successfully") {
        this.emit("scancenter:updated", {
          id: scanCenterId,
          data: transformedData,
        });
        return response;
      }
      throw new Error(response.msg || "Failed to update scan center");
    } catch (error) {
      console.error("Error updating scan center:", error);
      throw error;
    }
  }

  async deleteScanCenter(scanCenterId) {
    try {
      const response = await this.apiCall(
        `/scan/delete/${scanCenterId}`,
        "DELETE"
      );
      if (
        response.msg === "Scan center deleted successfully from all portals"
      ) {
        this.emit("scancenter:deleted", {
          id: scanCenterId,
          scanCenter: response.deletedScanCenter,
        });
        return response;
      }
      throw new Error(response.msg || "Failed to delete scan center");
    } catch (error) {
      console.error("Error deleting scan center:", error);
      throw error;
    }
  }

  // APPOINTMENT OPERATIONS
  async getAppointments(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await this.apiCall(
        `/appointments${params ? `?${params}` : ""}`
      );
      return response.appointments || [];
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return [];
    }
  }

  async addAppointment(appointmentData) {
    try {
      const response = await this.apiCall("/appointments", "POST", appointmentData);
      if (response.success) {
        this.emit("appointment:added", response.appointment);
        return response;
      }
      throw new Error(response.msg || "Failed to create appointment");
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  }

  async updateAppointment(appointmentId, appointmentData) {
    try {
      const response = await this.apiCall(
        `/appointments/${appointmentId}`,
        "PUT",
        appointmentData
      );
      if (response.success) {
        this.emit("appointment:updated", { id: appointmentId, data: appointmentData });
        return response;
      }
      throw new Error(response.msg || "Failed to update appointment");
    } catch (error) {
      console.error("Error updating appointment:", error);
      throw error;
    }
  }

  async deleteAppointment(appointmentId) {
    try {
      const response = await this.apiCall(`/appointments/${appointmentId}`, "DELETE");
      if (response.success) {
        this.emit("appointment:deleted", { id: appointmentId });
        return response;
      }
      throw new Error(response.msg || "Failed to delete appointment");
    } catch (error) {
      console.error("Error deleting appointment:", error);
      throw error;
    }
  }

  // MEDICATION OPERATIONS
  async getMedications(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await this.apiCall(
        `/medications${params ? `?${params}` : ""}`
      );
      return response.medications || [];
    } catch (error) {
      console.error("Error fetching medications:", error);
      return [];
    }
  }

  async addMedication(medicationData) {
    try {
      const response = await this.apiCall("/medications", "POST", medicationData);
      if (response.success) {
        this.emit("medication:added", response.medication);
        return response;
      }
      throw new Error(response.msg || "Failed to add medication");
    } catch (error) {
      console.error("Error adding medication:", error);
      throw error;
    }
  }

  async updateMedication(medicationId, medicationData) {
    try {
      const response = await this.apiCall(
        `/medications/${medicationId}`,
        "PUT",
        medicationData
      );
      if (response.success) {
        this.emit("medication:updated", { id: medicationId, data: medicationData });
        return response;
      }
      throw new Error(response.msg || "Failed to update medication");
    } catch (error) {
      console.error("Error updating medication:", error);
      throw error;
    }
  }

  async deleteMedication(medicationId) {
    try {
      const response = await this.apiCall(`/medications/${medicationId}`, "DELETE");
      if (response.success) {
        this.emit("medication:deleted", { id: medicationId });
        return response;
      }
      throw new Error(response.msg || "Failed to delete medication");
    } catch (error) {
      console.error("Error deleting medication:", error);
      throw error;
    }
  }

  // Clear all event listeners (useful for cleanup)
  clearAllListeners() {
    this.eventListeners.clear();
  }
}

// Create and export singleton instance
const dataService = new DataService();
export default dataService;
