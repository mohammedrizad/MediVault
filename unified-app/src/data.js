export const getInitialPatient = () => ({
  id: "507f1f77bcf86cd799439011",
  name: "Ramesh Kumar",
  age: 45,
  gender: "Male",
  bloodGroup: "O+",
  allergies: [
    { allergen: "Penicillin", severity: "Severe", reaction: "Anaphylaxis" },
    { allergen: "Peanuts", severity: "Moderate", reaction: "Hives" },
  ],
  chronicConditions: ["Type 2 Diabetes", "Hypertension"],
  emergencyContact: {
    name: "Priya Kumar",
    relation: "Wife",
    phone: "+91-9876543210",
  },
  records: [
    {
      id: "REC-101",
      date: "2024-01-15",
      hospital: "City General Hospital",
      doctor: "Dr. Sharma",
      diagnosis: "Bronchitis",
      symptoms: ["Cough", "Fever", "Shortness of breath"],
      medications: [
        {
          name: "Azithromycin",
          dosage: "500mg",
          frequency: "Daily",
          startDate: "2024-01-15",
          active: false,
        },
        {
          name: "Paracetamol",
          dosage: "650mg",
          frequency: "SOS",
          startDate: "2024-01-15",
          active: false,
        },
      ],
      labResults: [
        {
          testName: "WBC Count",
          value: "12000",
          unit: "/mcL",
          normalRange: "4500-11000",
          date: "2024-01-15",
        },
      ],
      notes: "Patient advised rest and hydration.",
      attachments: [],
    },
    {
      id: "REC-102",
      date: "2023-11-20",
      hospital: "Apollo Clinics",
      doctor: "Dr. Verma",
      diagnosis: "Hypertension Review",
      symptoms: ["Headache"],
      medications: [
        {
          name: "Amlodipine",
          dosage: "5mg",
          frequency: "Daily",
          startDate: "2023-11-20",
          active: true,
        },
        {
          name: "Metformin",
          dosage: "500mg",
          frequency: "Twice Daily",
          startDate: "2020-05-10",
          active: true,
        },
      ],
      labResults: [
        {
          testName: "BP",
          value: "140/90",
          unit: "mmHg",
          normalRange: "120/80",
          date: "2023-11-20",
        },
        {
          testName: "HbA1c",
          value: "7.2",
          unit: "%",
          normalRange: "< 5.7",
          date: "2023-11-20",
        },
      ],
      notes: "BP slightly elevated. Continuing current medication.",
      attachments: [],
    },
  ],
});

export const MOCK_PATIENT = getInitialPatient();
