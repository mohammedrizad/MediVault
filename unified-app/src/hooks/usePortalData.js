import { useState, useEffect, useCallback } from "react";
import dataService from "../services/DataService";

// Helper to detect if current user is Ram Hospital
const isRamHospital = () => {
  try {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const user = JSON.parse(userData);
      const name = (user.name || user.hospitalName || "").toLowerCase();
      return name.includes("ram");
    }
  } catch (e) {}
  return false;
};

// ─── Ram Hospital Mock Data ───────────────────────────────────
const ramMockDoctors = [
  {
    _id: "ram_doc_001",
    Doctor_name: "Dr. Karthik Raman",
    Email_Address: "karthik.raman@ramhospital.com",
    PhoneNo: "9944112201",
    Specialization: "Orthopedics & Joint Replacement",
    Years_of_experience: "18",
    Current_Address: "T. Nagar, Chennai",
    Qualifications: "MBBS, MS (Ortho), Fellowship in Joint Replacement",
    status: "Active",
    Date_Joined: "2019-03-10",
    Gender: "Male",
  },
  {
    _id: "ram_doc_002",
    Doctor_name: "Dr. Priya Lakshmi",
    Email_Address: "priya.lakshmi@ramhospital.com",
    PhoneNo: "9944112202",
    Specialization: "Obstetrics & Gynecology",
    Years_of_experience: "12",
    Current_Address: "Adyar, Chennai",
    Qualifications: "MBBS, MD (OB-GYN), DGO",
    status: "Active",
    Date_Joined: "2020-06-15",
    Gender: "Female",
  },
  {
    _id: "ram_doc_003",
    Doctor_name: "Dr. Venkat Subramanian",
    Email_Address: "venkat.s@ramhospital.com",
    PhoneNo: "9944112203",
    Specialization: "General Surgery & Laparoscopy",
    Years_of_experience: "22",
    Current_Address: "Velachery, Chennai",
    Qualifications: "MBBS, MS (General Surgery), FAIS",
    status: "Active",
    Date_Joined: "2017-01-20",
    Gender: "Male",
  },
  {
    _id: "ram_doc_004",
    Doctor_name: "Dr. Nithya Devi",
    Email_Address: "nithya.devi@ramhospital.com",
    PhoneNo: "9944112204",
    Specialization: "Pediatrics & Neonatology",
    Years_of_experience: "9",
    Current_Address: "Anna Nagar, Chennai",
    Qualifications: "MBBS, DCH, DNB (Pediatrics)",
    status: "Active",
    Date_Joined: "2022-08-01",
    Gender: "Female",
  },
  {
    _id: "ram_doc_005",
    Doctor_name: "Dr. Arun Prasad",
    Email_Address: "arun.prasad@ramhospital.com",
    PhoneNo: "9944112205",
    Specialization: "Interventional Cardiology",
    Years_of_experience: "15",
    Current_Address: "Mylapore, Chennai",
    Qualifications: "MBBS, MD (Medicine), DM (Cardiology)",
    status: "Active",
    Date_Joined: "2018-11-05",
    Gender: "Male",
  },
  {
    _id: "ram_doc_006",
    Doctor_name: "Dr. Sangeetha M",
    Email_Address: "sangeetha.m@ramhospital.com",
    PhoneNo: "9944112206",
    Specialization: "Dermatology & Cosmetology",
    Years_of_experience: "7",
    Current_Address: "Porur, Chennai",
    Qualifications: "MBBS, MD (Dermatology)",
    status: "On Leave",
    Date_Joined: "2023-02-14",
    Gender: "Female",
  },
];

const ramMockNurses = [
  {
    _id: "ram_nurse_001",
    Doctor_name: "Revathi Sundaram",
    Email_Address: "revathi.s@ramhospital.com",
    PhoneNo: "9955001101",
    Specialization: "ICU & Critical Care",
    Years_of_experience: "10",
    Current_Address: "Chromepet, Chennai",
    Qualifications: "BSc Nursing, CCRN Certified",
    status: "Active",
    Date_Joined: "2020-04-12",
    Gender: "Female",
  },
  {
    _id: "ram_nurse_002",
    Doctor_name: "Meenakshi Kannan",
    Email_Address: "meenakshi.k@ramhospital.com",
    PhoneNo: "9955001102",
    Specialization: "Emergency & Trauma",
    Years_of_experience: "6",
    Current_Address: "Tambaram, Chennai",
    Qualifications: "BSc Nursing, BLS & ACLS Certified",
    status: "Active",
    Date_Joined: "2021-07-20",
    Gender: "Female",
  },
  {
    _id: "ram_nurse_003",
    Doctor_name: "Kavitha Rajendran",
    Email_Address: "kavitha.r@ramhospital.com",
    PhoneNo: "9955001103",
    Specialization: "Pediatric Ward",
    Years_of_experience: "8",
    Current_Address: "Pallavaram, Chennai",
    Qualifications: "BSc Nursing, PG Diploma Pediatric Nursing",
    status: "Active",
    Date_Joined: "2019-11-01",
    Gender: "Female",
  },
  {
    _id: "ram_nurse_004",
    Doctor_name: "Janani Prakash",
    Email_Address: "janani.p@ramhospital.com",
    PhoneNo: "9955001104",
    Specialization: "Post-Operative Care",
    Years_of_experience: "5",
    Current_Address: "Guindy, Chennai",
    Qualifications: "GNM, Wound Care Specialist",
    status: "Active",
    Date_Joined: "2022-03-15",
    Gender: "Female",
  },
  {
    _id: "ram_nurse_005",
    Doctor_name: "Suresh Babu",
    Email_Address: "suresh.b@ramhospital.com",
    PhoneNo: "9955001105",
    Specialization: "Operation Theatre",
    Years_of_experience: "11",
    Current_Address: "Saidapet, Chennai",
    Qualifications: "BSc Nursing, OT Technician Certified",
    status: "Active",
    Date_Joined: "2018-09-25",
    Gender: "Male",
  },
];

const ramMockPatients = [
  {
    _id: "ram_pat_001",
    MedicalId: "RAM-2001",
    name: "Surya Kumar M",
    email: "surya.m@gmail.com",
    phone: "9988001101",
    age: "45",
    gender: "Male",
    bloodGroup: "A+",
    condition: "Lumbar Disc Herniation",
    address: "12, Bazaar Rd, T. Nagar, Chennai",
    emergencyContact: "Meena Kumar",
    emergencyPhone: "9988001102",
    allergies: "None",
    status: "Active",
    assignedDoctor: "Dr. Karthik Raman",
    history: [
      {
        disease: "L4-L5 Disc Prolapse",
        Date: "2025-10-12",
        DoctorDetails: "Dr. Karthik Raman - Orthopedics, Ram Hospital",
      },
    ],
  },
  {
    _id: "ram_pat_002",
    MedicalId: "RAM-2002",
    name: "Lakshmi Priya V",
    email: "lakshmi.v@gmail.com",
    phone: "9988001103",
    age: "32",
    gender: "Female",
    bloodGroup: "O+",
    condition: "Gestational Diabetes",
    address: "45, 2nd Cross, Adyar, Chennai",
    emergencyContact: "Venkat Raman",
    emergencyPhone: "9988001104",
    allergies: "Latex",
    status: "Active",
    assignedDoctor: "Dr. Priya Lakshmi",
    history: [
      {
        disease: "Gestational Diabetes (28 weeks)",
        Date: "2025-11-20",
        DoctorDetails: "Dr. Priya Lakshmi - OB-GYN, Ram Hospital",
      },
    ],
  },
  {
    _id: "ram_pat_003",
    MedicalId: "RAM-2003",
    name: "Rajendran K",
    email: "rajendran.k@gmail.com",
    phone: "9988001105",
    age: "68",
    gender: "Male",
    bloodGroup: "B-",
    condition: "Coronary Artery Disease, BPH",
    address: "78, Main Rd, Mylapore, Chennai",
    emergencyContact: "Kavitha Rajendran",
    emergencyPhone: "9988001106",
    allergies: "Metformin",
    status: "Active",
    assignedDoctor: "Dr. Arun Prasad",
    history: [
      {
        disease: "Triple Vessel Disease - CABG planned",
        Date: "2025-12-05",
        DoctorDetails: "Dr. Arun Prasad - Cardiology, Ram Hospital",
      },
      {
        disease: "Benign Prostatic Hyperplasia",
        Date: "2025-08-18",
        DoctorDetails: "Dr. Venkat Subramanian - Surgery, Ram Hospital",
      },
    ],
  },
  {
    _id: "ram_pat_004",
    MedicalId: "RAM-2004",
    name: "Divya Bharathi S",
    email: "divya.b@gmail.com",
    phone: "9988001107",
    age: "28",
    gender: "Female",
    bloodGroup: "AB+",
    condition: "Severe Eczema",
    address: "16, Lake View Rd, Velachery, Chennai",
    emergencyContact: "Selvam S",
    emergencyPhone: "9988001108",
    allergies: "Sulfa drugs, Shellfish",
    status: "Active",
    assignedDoctor: "Dr. Sangeetha M",
    history: [
      {
        disease: "Chronic Atopic Dermatitis",
        Date: "2025-11-02",
        DoctorDetails: "Dr. Sangeetha M - Dermatology, Ram Hospital",
      },
    ],
  },
  {
    _id: "ram_pat_005",
    MedicalId: "RAM-2005",
    name: "Murugan P",
    email: "murugan.p@gmail.com",
    phone: "9988001109",
    age: "55",
    gender: "Male",
    bloodGroup: "O-",
    condition: "Type 2 Diabetes, Gallstones",
    address: "33, Gandhi Nagar, Chromepet, Chennai",
    emergencyContact: "Selvi M",
    emergencyPhone: "9988001110",
    allergies: "Penicillin",
    status: "Active",
    assignedDoctor: "Dr. Venkat Subramanian",
    history: [
      {
        disease: "Cholecystectomy (Laparoscopic)",
        Date: "2025-09-30",
        DoctorDetails: "Dr. Venkat Subramanian - Surgery, Ram Hospital",
      },
      {
        disease: "Diabetic Foot Ulcer",
        Date: "2025-07-14",
        DoctorDetails: "Dr. Karthik Raman - Orthopedics, Ram Hospital",
      },
    ],
  },
  {
    _id: "ram_pat_006",
    MedicalId: "RAM-2006",
    name: "Anitha Kumari R",
    email: "anitha.k@gmail.com",
    phone: "9988001111",
    age: "4",
    gender: "Female",
    bloodGroup: "A-",
    condition: "Recurrent Bronchiolitis",
    address: "22, Park Street, Anna Nagar, Chennai",
    emergencyContact: "Ramesh Kumar",
    emergencyPhone: "9988001112",
    allergies: "Egg",
    status: "Active",
    assignedDoctor: "Dr. Nithya Devi",
    history: [
      {
        disease: "Acute Bronchiolitis Episode 3",
        Date: "2025-12-15",
        DoctorDetails: "Dr. Nithya Devi - Pediatrics, Ram Hospital",
      },
    ],
  },
];

const ramMockScanCenters = [
  {
    _id: "ram_scan_001",
    username: "Ram Diagnostic Imaging",
    Email_Address: "imaging@ramhospital.com",
    PhoneNo: "9966001101",
    Current_Address: "Block B, Ram Hospital, T. Nagar, Chennai",
    Qualifications: "CT Scan, Digital X-Ray, Fluoroscopy",
    Years_of_experience: "14",
    status: "Active",
    Date_Joined: "2018-05-01",
  },
  {
    _id: "ram_scan_002",
    username: "Chennai MRI & Neuroscience Hub",
    Email_Address: "mri.neuro@ramhospital.com",
    PhoneNo: "9966001102",
    Current_Address: "Block C, Ram Hospital, T. Nagar, Chennai",
    Qualifications: "3T MRI, Functional MRI, MR Angiography",
    Years_of_experience: "8",
    status: "Active",
    Date_Joined: "2021-02-10",
  },
  {
    _id: "ram_scan_003",
    username: "Ram Pathology & Lab Centre",
    Email_Address: "pathlab@ramhospital.com",
    PhoneNo: "9966001103",
    Current_Address: "Block A, Ram Hospital, T. Nagar, Chennai",
    Qualifications:
      "Histopathology, Clinical Biochemistry, Hematology, Microbiology",
    Years_of_experience: "20",
    status: "Active",
    Date_Joined: "2015-08-20",
  },
  {
    _id: "ram_scan_004",
    username: "Ram Ultrasound & Echo Lab",
    Email_Address: "ultrasound@ramhospital.com",
    PhoneNo: "9966001104",
    Current_Address: "Block D, Ram Hospital, T. Nagar, Chennai",
    Qualifications: "4D Ultrasound, Fetal Echo, Cardiac Echo, Doppler Studies",
    Years_of_experience: "10",
    status: "Active",
    Date_Joined: "2019-12-05",
  },
];

const ramMockDataMap = {
  patients: ramMockPatients,
  doctors: ramMockDoctors,
  nurses: ramMockNurses,
  scancenters: ramMockScanCenters,
};

// Custom hook for managing data with real-time synchronization
export const usePortalData = (dataType) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data fetchers
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // If Ram Hospital, return mock data instead of API data
      if (isRamHospital() && ramMockDataMap[dataType]) {
        setData(ramMockDataMap[dataType]);
        setLoading(false);
        return;
      }

      let result = [];
      switch (dataType) {
        case "patients":
          result = await dataService.getPatients();
          break;
        case "doctors":
          result = await dataService.getDoctors();
          break;
        case "nurses":
          result = await dataService.getNurses();
          break;
        case "scancenters":
          result = await dataService.getScanCenters();
          break;
        default:
          throw new Error(`Unknown data type: ${dataType}`);
      }

      setData(result);
    } catch (err) {
      console.error(`Error fetching ${dataType}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dataType]);

  // ── Ram Hospital: local-only CRUD (no backend calls) ──
  const ramAdd = useCallback((itemData) => {
    const newItem = { ...itemData, _id: `ram_local_${Date.now()}` };
    setData((prev) => [...prev, newItem]);
    return newItem;
  }, []);
  const ramUpdate = useCallback((itemId, itemData) => {
    setData((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, ...itemData } : item,
      ),
    );
    return itemData;
  }, []);
  const ramDelete = useCallback((itemId) => {
    setData((prev) => prev.filter((item) => item._id !== itemId));
    return { success: true };
  }, []);

  // CRUD operations
  const addItem = useCallback(
    async (itemData) => {
      // Ram Hospital: local-only
      if (isRamHospital()) return ramAdd(itemData);

      try {
        setLoading(true);
        setError(null);

        let response;
        switch (dataType) {
          case "patients":
            response = await dataService.addPatient(itemData);
            break;
          case "doctors":
            response = await dataService.addDoctor(itemData);
            break;
          case "nurses":
            response = await dataService.addNurse(itemData);
            break;
          case "scancenters":
            response = await dataService.addScanCenter(itemData);
            break;
          default:
            throw new Error(`Unknown data type: ${dataType}`);
        }

        // Refresh data after successful addition
        await fetchData();
        return response;
      } catch (err) {
        console.error(`Error adding ${dataType.slice(0, -1)}:`, err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [dataType, fetchData, ramAdd],
  );

  const updateItem = useCallback(
    async (itemId, itemData) => {
      // Ram Hospital: local-only
      if (isRamHospital()) return ramUpdate(itemId, itemData);

      try {
        setLoading(true);
        setError(null);

        let response;
        switch (dataType) {
          case "patients":
            response = await dataService.updatePatient(itemId, itemData);
            break;
          case "doctors":
            response = await dataService.updateDoctor(itemId, itemData);
            break;
          case "nurses":
            response = await dataService.updateNurse(itemId, itemData);
            break;
          case "scancenters":
            response = await dataService.updateScanCenter(itemId, itemData);
            break;
          default:
            throw new Error(`Unknown data type: ${dataType}`);
        }

        // Refresh data after successful update
        await fetchData();
        return response;
      } catch (err) {
        console.error(`Error updating ${dataType.slice(0, -1)}:`, err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [dataType, fetchData, ramUpdate],
  );

  const deleteItem = useCallback(
    async (itemId) => {
      // Ram Hospital: local-only
      if (isRamHospital()) return ramDelete(itemId);

      try {
        setLoading(true);
        setError(null);

        let response;
        switch (dataType) {
          case "patients":
            response = await dataService.deletePatient(itemId);
            break;
          case "doctors":
            response = await dataService.deleteDoctor(itemId);
            break;
          case "nurses":
            response = await dataService.deleteNurse(itemId);
            break;
          case "scancenters":
            response = await dataService.deleteScanCenter(itemId);
            break;
          default:
            throw new Error(`Unknown data type: ${dataType}`);
        }

        // Immediately remove from local state for instant UI update
        setData((prevData) => prevData.filter((item) => item._id !== itemId));

        return response;
      } catch (err) {
        console.error(`Error deleting ${dataType.slice(0, -1)}:`, err);
        setError(err.message);
        // Refresh data to ensure consistency
        await fetchData();
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [dataType, fetchData, ramDelete],
  );

  // Event listeners for real-time updates from other portals
  useEffect(() => {
    const handleAdded = (newItem) => {
      setData((prevData) => [...prevData, newItem]);
    };

    const handleUpdated = ({ id, data: updatedData }) => {
      setData((prevData) =>
        prevData.map((item) =>
          item._id === id ? { ...item, ...updatedData } : item,
        ),
      );
    };

    const handleDeleted = ({ id }) => {
      setData((prevData) => prevData.filter((item) => item._id !== id));
    };

    // Subscribe to events
    dataService.on(`${dataType.slice(0, -1)}:added`, handleAdded);
    dataService.on(`${dataType.slice(0, -1)}:updated`, handleUpdated);
    dataService.on(`${dataType.slice(0, -1)}:deleted`, handleDeleted);

    // Cleanup listeners
    return () => {
      dataService.off(`${dataType.slice(0, -1)}:added`, handleAdded);
      dataService.off(`${dataType.slice(0, -1)}:updated`, handleUpdated);
      dataService.off(`${dataType.slice(0, -1)}:deleted`, handleDeleted);
    };
  }, [dataType]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    addItem,
    updateItem,
    deleteItem,
  };
};

// Hook for patients specifically (with additional patient-specific methods)
export const usePatients = () => {
  const {
    data: patients,
    loading,
    error,
    refetch,
    addItem: addPatient,
    updateItem: updatePatient,
    deleteItem: deletePatient,
  } = usePortalData("patients");

  // Additional patient-specific methods can be added here
  const getPatientByMedicalId = useCallback(
    (medicalId) => {
      return patients.find((patient) => patient.MedicalId === medicalId);
    },
    [patients],
  );

  const getActivePatients = useCallback(() => {
    return patients.filter((patient) => patient.status !== "Inactive");
  }, [patients]);

  return {
    patients,
    loading,
    error,
    refetch,
    addPatient,
    updatePatient,
    deletePatient,
    getPatientByMedicalId,
    getActivePatients,
  };
};

// Hook for doctors specifically
export const useDoctors = () => {
  const {
    data: doctors,
    loading,
    error,
    refetch,
    addItem: addDoctor,
    updateItem: updateDoctor,
    deleteItem: deleteDoctor,
  } = usePortalData("doctors");

  const getDoctorsBySpecialty = useCallback(
    (specialty) => {
      return doctors.filter((doctor) =>
        doctor.specialty?.toLowerCase().includes(specialty.toLowerCase()),
      );
    },
    [doctors],
  );

  return {
    doctors,
    loading,
    error,
    refetch,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    getDoctorsBySpecialty,
  };
};

// Hook for nurses specifically
export const useNurses = () => {
  const {
    data: nurses,
    loading,
    error,
    refetch,
    addItem: addNurse,
    updateItem: updateNurse,
    deleteItem: deleteNurse,
  } = usePortalData("nurses");

  return {
    nurses,
    loading,
    error,
    refetch,
    addNurse,
    updateNurse,
    deleteNurse,
  };
};

// Hook for scan centers specifically
export const useScanCenters = () => {
  const {
    data: scanCenters,
    loading,
    error,
    refetch,
    addItem: addScanCenter,
    updateItem: updateScanCenter,
    deleteItem: deleteScanCenter,
  } = usePortalData("scancenters");

  return {
    scanCenters,
    loading,
    error,
    refetch,
    addScanCenter,
    updateScanCenter,
    deleteScanCenter,
  };
};
