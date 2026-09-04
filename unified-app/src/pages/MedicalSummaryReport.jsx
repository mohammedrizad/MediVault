import React, { useState, useCallback } from "react";
import jsPDF from "jspdf";
import {
  Box,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  Icon,
  Input,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
  FormControl,
  FormLabel,
  Divider,
  Progress,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  List,
  ListItem,
  ListIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
} from "@chakra-ui/react";
import {
  FiUpload,
  FiFileText,
  FiEye,
  FiDownload,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiActivity,
  FiHeart,
  FiTrendingUp,
  FiSearch,
} from "react-icons/fi";

const MedicalSummaryReport = () => {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isUploadOpen,
    onOpen: onUploadOpen,
    onClose: onUploadClose,
  } = useDisclosure();
  const [selectedReport, setSelectedReport] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPatient, setFilterPatient] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const toast = useToast();

  // Mock medical summary reports data
  const [reports, setReports] = useState([
    {
      id: 1,
      patientId: 1,
      patientName: "John Smith",
      uploadDate: "2024-11-01",
      fileName: "Lab_Results_Comprehensive_Panel.pdf",
      fileSize: "2.4 MB",
      originalFileUrl: null, // Will be set for newly uploaded files
      originalFileType: "application/pdf",
      processingStatus: "Completed",
      urgencyLevel: "High",
      summary: {
        keyFindings: [
          "Elevated glucose levels (220 mg/dL) - Critical",
          "HbA1c at 9.2% indicating poor diabetes control",
          "Microalbumin positive - kidney involvement",
          "LDL cholesterol elevated at 165 mg/dL",
        ],
        criticalValues: [
          {
            parameter: "Glucose",
            value: "220 mg/dL",
            normal: "70-100 mg/dL",
            status: "Critical",
          },
          { parameter: "HbA1c", value: "9.2%", normal: "<7%", status: "High" },
          {
            parameter: "Microalbumin",
            value: "Positive",
            normal: "Negative",
            status: "Abnormal",
          },
        ],
        recommendations: [
          "Immediate insulin adjustment required",
          "Nephrology consultation recommended",
          "Dietary counseling urgently needed",
          "Follow-up in 1 week for glucose monitoring",
        ],
        treatmentContinuity: {
          currentMedications: ["Metformin 1000mg BID", "Lisinopril 10mg daily"],
          suggestedChanges: [
            "Consider insulin therapy initiation",
            "Increase Lisinopril to 20mg daily",
            "Add statin therapy for cholesterol",
          ],
          contraindications: ["None identified"],
          drugInteractions: ["Monitor for hypoglycemia if insulin added"],
        },
      },
    },
    {
      id: 2,
      patientId: 2,
      patientName: "Sarah Johnson",
      uploadDate: "2024-10-30",
      fileName: "Chest_CT_Scan_Report.pdf",
      fileSize: "5.8 MB",
      originalFileUrl: null, // Will be set for newly uploaded files
      originalFileType: "application/pdf",
      processingStatus: "Completed",
      urgencyLevel: "Medium",
      summary: {
        keyFindings: [
          "Bilateral lower lobe infiltrates",
          "No pleural effusion",
          "Heart size within normal limits",
          "No pulmonary embolism",
        ],
        criticalValues: [
          {
            parameter: "Lung Infiltrates",
            value: "Bilateral",
            normal: "Clear",
            status: "Abnormal",
          },
          {
            parameter: "Heart Size",
            value: "Normal",
            normal: "Normal",
            status: "Normal",
          },
        ],
        recommendations: [
          "Continue current antibiotic therapy",
          "Bronchodilator therapy optimization",
          "Pulmonary function tests in 2 weeks",
          "Follow-up chest imaging in 4 weeks",
        ],
        treatmentContinuity: {
          currentMedications: [
            "Albuterol inhaler PRN",
            "Fluticasone 250mcg BID",
          ],
          suggestedChanges: [
            "Add azithromycin 250mg daily x 5 days",
            "Continue current inhaler regimen",
          ],
          contraindications: ["No macrolide allergy documented"],
          drugInteractions: ["None significant"],
        },
      },
    },
    {
      id: 3,
      patientId: 3,
      patientName: "Michael Brown",
      uploadDate: "2024-10-28",
      fileName: "Cardiac_Stress_Test_Results.pdf",
      fileSize: "3.1 MB",
      originalFileUrl: null, // Will be set for newly uploaded files
      originalFileType: "application/pdf",
      processingStatus: "Completed",
      urgencyLevel: "Low",
      summary: {
        keyFindings: [
          "Exercise tolerance within normal limits",
          "No chest pain during test",
          "Blood pressure response appropriate",
          "No significant ST changes",
        ],
        criticalValues: [
          {
            parameter: "Max Heart Rate",
            value: "165 bpm",
            normal: "162 bpm (target)",
            status: "Normal",
          },
          {
            parameter: "BP Response",
            value: "180/95",
            normal: "<200/100",
            status: "Normal",
          },
        ],
        recommendations: [
          "Continue current cardiac medications",
          "Regular exercise program encouraged",
          "Annual stress test recommended",
          "Lipid management optimization",
        ],
        treatmentContinuity: {
          currentMedications: [
            "Atenolol 50mg daily",
            "Atorvastatin 40mg daily",
          ],
          suggestedChanges: ["No immediate changes needed"],
          contraindications: ["None identified"],
          drugInteractions: ["None significant"],
        },
      },
    },
  ]);

  // Enhanced AI processing simulation with better content analysis
  const simulateAIProcessing = useCallback(
    async (file) => {
      setIsProcessing(true);
      setUploadProgress(0);

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Simulate AI analysis delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Enhanced AI analysis based on filename patterns
      const fileName = file.name.toLowerCase();
      let mockAnalysis = {
        id: Date.now(),
        patientId: Math.floor(Math.random() * 5) + 1,
        patientName: "New Patient",
        uploadDate: new Date().toISOString().split("T")[0],
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        originalFileUrl: URL.createObjectURL(file), // Store original PDF
        originalFileType: file.type, // Store file type
        processingStatus: "Completed",
        urgencyLevel: "Medium",
        summary: {
          keyFindings: [],
          criticalValues: [],
          recommendations: [],
          treatmentContinuity: {
            currentMedications: [],
            suggestedChanges: [],
            contraindications: [],
            drugInteractions: [],
          },
        },
      };

      // Analyze content based on filename patterns for more realistic results
      if (
        fileName.includes("blood") ||
        fileName.includes("lab") ||
        fileName.includes("test")
      ) {
        mockAnalysis.urgencyLevel = Math.random() > 0.3 ? "High" : "Medium";
        mockAnalysis.summary = {
          keyFindings: [
            "Complete Blood Count analysis shows elevated white cell count (12,500/μL)",
            "Glucose levels elevated at 145 mg/dL (fasting)",
            "Hemoglobin slightly low at 11.2 g/dL",
            "Cholesterol levels: Total 240 mg/dL, LDL 165 mg/dL",
          ],
          criticalValues: [
            {
              parameter: "White Blood Cell Count",
              value: "12,500/μL",
              normal: "4,000-11,000/μL",
              status: "High",
            },
            {
              parameter: "Fasting Glucose",
              value: "145 mg/dL",
              normal: "70-100 mg/dL",
              status: "Elevated",
            },
            {
              parameter: "Hemoglobin",
              value: "11.2 g/dL",
              normal: "12-16 g/dL",
              status: "Low",
            },
          ],
          recommendations: [
            "Further investigation of elevated WBC count - consider infection or inflammation",
            "Dietary counseling for glucose management",
            "Iron supplementation for low hemoglobin",
            "Lipid management discussion with patient",
            "Follow-up labs in 4-6 weeks",
          ],
          treatmentContinuity: {
            currentMedications: [
              "Metformin 500mg BID",
              "Lisinopril 10mg daily",
            ],
            suggestedChanges: [
              "Consider iron supplement",
              "Dietary consultation",
            ],
            contraindications: ["Monitor kidney function with metformin"],
            drugInteractions: ["No significant interactions identified"],
          },
        };
      } else if (
        fileName.includes("x-ray") ||
        fileName.includes("chest") ||
        fileName.includes("imaging")
      ) {
        mockAnalysis.urgencyLevel = "Medium";
        mockAnalysis.summary = {
          keyFindings: [
            "Chest X-ray shows clear lung fields bilaterally",
            "Heart size within normal limits",
            "No acute cardiopulmonary abnormalities",
            "Mild degenerative changes in thoracic spine",
          ],
          criticalValues: [
            {
              parameter: "Lung Fields",
              value: "Clear",
              normal: "Clear",
              status: "Normal",
            },
            {
              parameter: "Heart Size",
              value: "Normal",
              normal: "Normal",
              status: "Normal",
            },
          ],
          recommendations: [
            "No immediate intervention required",
            "Continue current medications",
            "Routine follow-up as scheduled",
            "Monitor for any respiratory symptoms",
          ],
          treatmentContinuity: {
            currentMedications: ["Continue current regimen"],
            suggestedChanges: ["No changes needed"],
            contraindications: ["None identified"],
            drugInteractions: ["None"],
          },
        };
      } else if (
        fileName.includes("cardiac") ||
        fileName.includes("heart") ||
        fileName.includes("ekg") ||
        fileName.includes("ecg")
      ) {
        mockAnalysis.urgencyLevel = Math.random() > 0.4 ? "High" : "Medium";
        mockAnalysis.summary = {
          keyFindings: [
            "EKG shows normal sinus rhythm at 72 bpm",
            "PR interval 0.16 seconds (normal)",
            "QRS duration 0.08 seconds (normal)",
            "No ST-segment elevation or depression",
          ],
          criticalValues: [
            {
              parameter: "Heart Rate",
              value: "72 bpm",
              normal: "60-100 bpm",
              status: "Normal",
            },
            {
              parameter: "QT Interval",
              value: "0.42 seconds",
              normal: "<0.44 seconds",
              status: "Normal",
            },
          ],
          recommendations: [
            "Continue current cardiac medications",
            "Regular cardiology follow-up",
            "Monitor blood pressure",
            "Lifestyle modifications as discussed",
          ],
          treatmentContinuity: {
            currentMedications: [
              "Metoprolol 25mg BID",
              "Atorvastatin 20mg daily",
            ],
            suggestedChanges: ["Continue current regimen"],
            contraindications: ["Monitor for bradycardia"],
            drugInteractions: ["None significant"],
          },
        };
      } else {
        // Enhanced AI analysis for general medical reports
        // Randomly select a medical scenario to simulate realistic analysis
        const scenarios = [
          {
            urgency: "High",
            type: "laboratory",
            findings: [
              "Comprehensive Metabolic Panel shows several abnormalities",
              "Fasting glucose elevated at 185 mg/dL indicating poor glycemic control",
              "Total cholesterol elevated at 265 mg/dL with LDL 175 mg/dL",
              "Hemoglobin A1c at 8.9% indicating diabetes management needed",
              "Kidney function shows early signs of compromise (eGFR 55)",
            ],
            criticalValues: [
              {
                parameter: "Fasting Glucose",
                value: "185 mg/dL",
                normal: "70-100 mg/dL",
                status: "High",
              },
              {
                parameter: "HbA1c",
                value: "8.9%",
                normal: "<7.0%",
                status: "Elevated",
              },
              {
                parameter: "Total Cholesterol",
                value: "265 mg/dL",
                normal: "<200 mg/dL",
                status: "High",
              },
              {
                parameter: "eGFR",
                value: "55 mL/min",
                normal: ">90 mL/min",
                status: "Decreased",
              },
            ],
            recommendations: [
              "Immediate diabetes management optimization required",
              "Endocrinology referral for insulin therapy consideration",
              "Statin therapy initiation for cardiovascular protection",
              "Nephrology consultation for kidney function assessment",
              "Dietary counseling and diabetes education",
              "Home glucose monitoring with daily logs",
              "Follow-up labs in 6-8 weeks",
            ],
            medications: [
              "Metformin 1000mg BID",
              "Lisinopril 10mg daily",
              "Aspirin 81mg daily",
            ],
            changes: [
              "Add insulin therapy",
              "Initiate atorvastatin 20mg",
              "Increase ACE inhibitor",
            ],
            contraindications: [
              "Monitor kidney function closely",
              "Watch for hypoglycemia",
            ],
            interactions: ["Monitor potassium with ACE inhibitor combination"],
          },
          {
            urgency: "Medium",
            type: "imaging",
            findings: [
              "Chest CT scan reveals bilateral pulmonary nodules",
              "Largest nodule measures 8mm in right upper lobe",
              "No mediastinal lymphadenopathy",
              "Heart size within normal limits",
              "No pleural effusion or pneumothorax",
            ],
            criticalValues: [
              {
                parameter: "Pulmonary Nodules",
                value: "Multiple",
                normal: "None",
                status: "Abnormal",
              },
              {
                parameter: "Largest Nodule Size",
                value: "8mm",
                normal: "None",
                status: "Requires Follow-up",
              },
              {
                parameter: "Lymph Nodes",
                value: "Normal",
                normal: "Normal",
                status: "Normal",
              },
            ],
            recommendations: [
              "Follow-up CT chest in 6 months per Fleischner guidelines",
              "Consider PET scan if nodules show growth",
              "Pulmonology consultation recommended",
              "Smoking cessation counseling if applicable",
              "Annual lung cancer screening going forward",
            ],
            medications: ["Continue current medications"],
            changes: ["No immediate medication changes"],
            contraindications: ["Avoid nephrotoxic contrast if kidney disease"],
            interactions: ["None related to current findings"],
          },
          {
            urgency: "High",
            type: "cardiology",
            findings: [
              "EKG shows new onset atrial fibrillation with rapid ventricular response",
              "Heart rate 145-160 bpm irregular rhythm",
              "No acute ST-segment changes",
              "Echocardiogram shows mild left atrial enlargement",
              "Ejection fraction preserved at 55%",
            ],
            criticalValues: [
              {
                parameter: "Heart Rhythm",
                value: "Atrial Fibrillation",
                normal: "Sinus Rhythm",
                status: "Abnormal",
              },
              {
                parameter: "Heart Rate",
                value: "145-160 bpm",
                normal: "60-100 bpm",
                status: "Elevated",
              },
              {
                parameter: "Left Atrium",
                value: "Mildly Enlarged",
                normal: "Normal",
                status: "Abnormal",
              },
            ],
            recommendations: [
              "Immediate rate control with beta-blocker or calcium channel blocker",
              "Anticoagulation assessment using CHA2DS2-VASc score",
              "Cardiology consultation within 24-48 hours",
              "Consider cardioversion if recent onset",
              "Thyroid function tests to rule out hyperthyroidism",
              "Monitor for signs of heart failure",
            ],
            medications: [
              "Metoprolol 25mg BID",
              "Apixaban 5mg BID if indicated",
            ],
            changes: [
              "Start rate control medication",
              "Initiate anticoagulation if appropriate",
            ],
            contraindications: [
              "Avoid if severe heart failure",
              "Monitor for bleeding with anticoagulation",
            ],
            interactions: ["Monitor digoxin levels if used"],
          },
        ];

        // Randomly select a scenario
        const selectedScenario =
          scenarios[Math.floor(Math.random() * scenarios.length)];

        mockAnalysis.urgencyLevel = selectedScenario.urgency;
        mockAnalysis.summary = {
          keyFindings: selectedScenario.findings,
          criticalValues: selectedScenario.criticalValues,
          recommendations: selectedScenario.recommendations,
          treatmentContinuity: {
            currentMedications: selectedScenario.medications,
            suggestedChanges: selectedScenario.changes,
            contraindications: selectedScenario.contraindications,
            drugInteractions: selectedScenario.interactions,
          },
        };
      }

      setReports((prev) => [mockAnalysis, ...prev]);
      setIsProcessing(false);
      setUploadProgress(0);
      onUploadClose();

      toast({
        title: "AI Analysis Complete",
        description: `${file.name} has been analyzed. Check the detailed summary below.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
    [onUploadClose, toast]
  );

  const handleFileUpload = useCallback(
    async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF file only.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      await simulateAIProcessing(file);
    },
    [simulateAIProcessing, toast]
  );

  const handleViewReport = (report) => {
    setSelectedReport(report);
    onOpen();
  };

  const handleDownloadReport = (report) => {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 10; // Increased from 8 to 10 for better spacing
      let yPosition = margin;

      // Helper function to add text with wrapping and page breaks
      const addTextWithWrap = (
        text,
        fontSize = 10,
        fontStyle = "normal",
        maxWidth = pageWidth - 2 * margin
      ) => {
        doc.setFontSize(fontSize);
        doc.setFont(undefined, fontStyle);

        const lines = doc.splitTextToSize(text, maxWidth);

        // Check if we need a new page
        if (yPosition + lines.length * lineHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }

        lines.forEach((line) => {
          doc.text(line, margin, yPosition);
          yPosition += lineHeight;
        });

        return yPosition;
      };

      // Helper function to add section spacing
      const addSectionSpacing = () => {
        yPosition += lineHeight + 3; // Increased spacing between sections
      };

      // Helper function to add text without wrapping (for simple single lines)
      const addSimpleText = (
        text,
        fontSize = 10,
        fontStyle = "normal",
        textColor = [0, 0, 0]
      ) => {
        // Check if we need a new page
        if (yPosition + lineHeight > pageHeight - 40) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFontSize(fontSize);
        doc.setFont(undefined, fontStyle);
        doc.setTextColor(...textColor);
        doc.text(text, margin, yPosition);
        yPosition += lineHeight;
      };

      // PDF Header
      doc.setFillColor(41, 128, 185); // Blue background
      doc.rect(0, 0, pageWidth, 35, "F");

      doc.setTextColor(255, 255, 255); // White text
      doc.setFontSize(20);
      doc.setFont(undefined, "bold");
      doc.text("AI MEDICAL SUMMARY REPORT", pageWidth / 2, 22, {
        align: "center",
      });

      // Reset text color and position
      doc.setTextColor(0, 0, 0);
      yPosition = 50;

      // Patient Information Section
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("PATIENT INFORMATION", margin, yPosition);
      yPosition += lineHeight + 3;

      doc.setDrawColor(41, 128, 185);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      addTextWithWrap(`Patient Name: ${report.patientName}`, 12, "bold");
      addTextWithWrap(`Report Date: ${report.uploadDate}`, 11);
      addTextWithWrap(`Source File: ${report.fileName}`, 11);
      addTextWithWrap(`File Size: ${report.fileSize}`, 11);
      addTextWithWrap(`Priority Level: ${report.urgencyLevel}`, 11, "bold");

      addSectionSpacing();

      // Key Findings Section
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("KEY CLINICAL FINDINGS", margin, yPosition);
      yPosition += lineHeight + 3;

      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      report.summary.keyFindings.forEach((finding, index) => {
        addTextWithWrap(`${index + 1}. ${finding}`, 10, "normal");
      });

      addSectionSpacing();

      // Critical Values Section
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("CRITICAL VALUES ANALYSIS", margin, yPosition);
      yPosition += lineHeight + 3;

      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      report.summary.criticalValues.forEach((value) => {
        const status = value.status;
        const statusColor =
          status === "Critical"
            ? [255, 0, 0]
            : status === "High" || status === "Abnormal"
            ? [255, 165, 0]
            : [0, 128, 0];

        // Parameter name and value using helper function
        addSimpleText(
          `• ${value.parameter}: ${value.value}`,
          10,
          "bold",
          [0, 0, 0]
        );

        // Normal range and status with color
        addSimpleText(
          `  Normal Range: ${value.normal} | Status: ${value.status}`,
          9,
          "normal",
          statusColor
        );

        // Add extra spacing between critical value entries
        yPosition += 4;
      });

      // Reset text color to black for next sections
      doc.setTextColor(0, 0, 0);

      addSectionSpacing();

      // AI Recommendations Section
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("AI CLINICAL RECOMMENDATIONS", margin, yPosition);
      yPosition += lineHeight + 3;

      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      report.summary.recommendations.forEach((rec, index) => {
        addTextWithWrap(`${index + 1}. ${rec}`, 10);
      });

      addSectionSpacing();

      // Treatment Continuity Section
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("TREATMENT CONTINUITY ANALYSIS", margin, yPosition);
      yPosition += lineHeight + 3;

      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      // Current Medications
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      addTextWithWrap("Current Medications:");
      report.summary.treatmentContinuity.currentMedications.forEach((med) => {
        addTextWithWrap(`• ${med}`, 10);
      });

      addSectionSpacing();

      // Suggested Changes
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      addTextWithWrap("Suggested Treatment Changes:");
      report.summary.treatmentContinuity.suggestedChanges.forEach((change) => {
        addTextWithWrap(`• ${change}`, 10);
      });

      addSectionSpacing();

      // Contraindications
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      addTextWithWrap("Contraindications & Warnings:");
      report.summary.treatmentContinuity.contraindications.forEach((contra) => {
        addTextWithWrap(`• ${contra}`, 10);
      });

      addSectionSpacing();

      // Drug Interactions
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      addTextWithWrap("Drug Interactions:");
      report.summary.treatmentContinuity.drugInteractions.forEach(
        (interaction) => {
          addTextWithWrap(`• ${interaction}`, 10);
        }
      );

      // Footer Section - Ensure enough space
      const footerY = pageHeight - 30;

      // If content is too close to footer, add a new page
      if (yPosition > footerY - 20) {
        doc.addPage();
        yPosition = margin;
      }

      // Add footer on the last page
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, footerY, pageWidth - margin, footerY);

      doc.setFontSize(8);
      doc.setFont(undefined, "italic");
      doc.text(
        "Generated by MediVault AI Analysis System",
        margin,
        footerY + 10
      );
      doc.text(
        `Report ID: ${report.id} | Generated: ${new Date().toLocaleString()}`,
        margin,
        footerY + 17
      );
      doc.text(
        "This report is for medical professional use only",
        pageWidth - margin,
        footerY + 10,
        { align: "right" }
      );

      // Save the PDF
      const fileName = `AI_Medical_Summary_${report.patientName.replace(
        /\s+/g,
        "_"
      )}_${report.uploadDate}.pdf`;
      doc.save(fileName);

      // Success notification
      toast({
        title: "PDF Download Started",
        description: `Medical summary report for ${report.patientName} has been generated and downloaded.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (error) {
      console.error("PDF generation error:", error);

      // Error notification
      toast({
        title: "PDF Generation Failed",
        description:
          "There was an error generating the PDF report. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Function to download the original uploaded PDF
  const handleDownloadOriginalPDF = (report) => {
    try {
      if (!report.originalFileUrl) {
        toast({
          title: "Original File Not Available",
          description:
            "The original PDF file is no longer available for download.",
          status: "warning",
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      // Create download link for original file
      const link = document.createElement("a");
      link.href = report.originalFileUrl;
      link.download = report.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Success notification
      toast({
        title: "Original PDF Download Started",
        description: `Downloading original file: ${report.fileName}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Original PDF download error:", error);

      // Error notification
      toast({
        title: "Download Failed",
        description: "There was an error downloading the original PDF file.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency.toLowerCase()) {
      case "high":
        return "red";
      case "medium":
        return "yellow";
      case "low":
        return "green";
      default:
        return "gray";
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "green";
      case "processing":
        return "blue";
      case "error":
        return "red";
      default:
        return "gray";
    }
  };

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPatient =
      filterPatient === "all" || report.patientName === filterPatient;
    const matchesUrgency =
      filterUrgency === "all" ||
      report.urgencyLevel.toLowerCase() === filterUrgency.toLowerCase();
    return matchesSearch && matchesPatient && matchesUrgency;
  });

  // Get unique patients for filter
  const uniquePatients = [...new Set(reports.map((r) => r.patientName))];

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="lg" mb={2}>
              Medical Summary Reports
            </Heading>
            <Text color="gray.600">
              AI-powered medical document analysis for treatment continuity
            </Text>
          </Box>
          <Button
            leftIcon={<FiUpload />}
            colorScheme="blue"
            onClick={onUploadOpen}
            isDisabled={isProcessing}
          >
            Upload Medical Report
          </Button>
        </Flex>

        {/* Stats Cards */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6}>
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack>
                <Icon as={FiFileText} w={8} h={8} color="blue.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold">
                    {reports.length}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Total Reports
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack>
                <Icon as={FiAlertTriangle} w={8} h={8} color="red.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold">
                    {reports.filter((r) => r.urgencyLevel === "High").length}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    High Priority
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack>
                <Icon as={FiActivity} w={8} h={8} color="orange.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold">
                    {reports.filter((r) => r.urgencyLevel === "Medium").length}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Medium Priority
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <HStack>
                <Icon as={FiCheckCircle} w={8} h={8} color="green.500" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold">
                    {
                      reports.filter((r) => r.processingStatus === "Completed")
                        .length
                    }
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Processed
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        </Grid>

        {/* Processing Status */}
        {isProcessing && (
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4}>
                <HStack>
                  <Spinner size="sm" />
                  <Text fontWeight="medium">
                    Processing medical document with AI...
                  </Text>
                </HStack>
                <Progress w="100%" value={uploadProgress} colorScheme="blue" />
                <Text fontSize="sm" color="gray.500">
                  Analyzing document structure, extracting key findings, and
                  generating treatment recommendations
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Search and Filter */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }} gap={4}>
              <FormControl>
                <Input
                  placeholder="Search by patient name or file name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftElement={<Icon as={FiSearch} color="gray.400" />}
                />
              </FormControl>
              <FormControl>
                <Select
                  placeholder="All Patients"
                  value={filterPatient}
                  onChange={(e) => setFilterPatient(e.target.value)}
                >
                  <option value="all">All Patients</option>
                  {uniquePatients.map((patient) => (
                    <option key={patient} value={patient}>
                      {patient}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <Select
                  placeholder="All Priority"
                  value={filterUrgency}
                  onChange={(e) => setFilterUrgency(e.target.value)}
                >
                  <option value="all">All Priority</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </Select>
              </FormControl>
            </Grid>
          </CardBody>
        </Card>

        {/* Reports Table */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">AI Analysis Results</Heading>
          </CardHeader>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Patient & File</Th>
                  <Th>Upload Date</Th>
                  <Th>Status</Th>
                  <Th>Priority</Th>
                  <Th>Key Findings</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredReports.map((report) => (
                  <Tr key={report.id}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">{report.patientName}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {report.fileName}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          {report.fileSize}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>{report.uploadDate}</Td>
                    <Td>
                      <Badge
                        colorScheme={getStatusColor(report.processingStatus)}
                      >
                        {report.processingStatus}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={getUrgencyColor(report.urgencyLevel)}>
                        {report.urgencyLevel}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm" maxW="200px" isTruncated>
                        {report.summary.keyFindings[0]}
                      </Text>
                      {report.summary.keyFindings.length > 1 && (
                        <Text fontSize="xs" color="gray.500">
                          +{report.summary.keyFindings.length - 1} more
                        </Text>
                      )}
                    </Td>
                    <Td>
                      <VStack spacing={2} align="stretch">
                        <Button
                          size="sm"
                          leftIcon={<FiEye />}
                          onClick={() => handleViewReport(report)}
                          w="full"
                        >
                          View Summary
                        </Button>
                        <HStack spacing={1}>
                          <Button
                            size="xs"
                            variant="outline"
                            leftIcon={<FiDownload />}
                            onClick={() => handleDownloadOriginalPDF(report)}
                            flex="1"
                          >
                            Original
                          </Button>
                          <Button
                            size="xs"
                            colorScheme="blue"
                            leftIcon={<FiDownload />}
                            onClick={() => handleDownloadReport(report)}
                            flex="1"
                          >
                            AI Report
                          </Button>
                        </HStack>
                      </VStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </VStack>

      {/* Upload Modal */}
      <Modal isOpen={isUploadOpen} onClose={onUploadClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Medical Report</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6}>
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>AI-Powered Analysis</AlertTitle>
                  <AlertDescription>
                    Our AI will extract key medical findings, identify critical
                    values, and provide treatment recommendations for optimal
                    care continuity.
                  </AlertDescription>
                </Box>
              </Alert>

              <FormControl>
                <FormLabel>Select Patient</FormLabel>
                <Select placeholder="Choose patient">
                  <option value="john-smith">John Smith</option>
                  <option value="sarah-johnson">Sarah Johnson</option>
                  <option value="michael-brown">Michael Brown</option>
                  <option value="emily-davis">Emily Davis</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Upload PDF Report</FormLabel>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                />
                <Text fontSize="sm" color="gray.500" mt={2}>
                  Supported format: PDF (Max 10MB)
                </Text>
              </FormControl>

              <Box w="100%" p={4} bg="gray.50" borderRadius="md">
                <Text fontWeight="medium" mb={2}>
                  AI Analysis Features:
                </Text>
                <List spacing={1}>
                  <ListItem>
                    <ListIcon as={FiCheckCircle} color="green.500" />
                    Extract critical lab values and vital signs
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FiCheckCircle} color="green.500" />
                    Identify urgent findings requiring immediate attention
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FiCheckCircle} color="green.500" />
                    Generate treatment continuity recommendations
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FiCheckCircle} color="green.500" />
                    Detect medication interactions and contraindications
                  </ListItem>
                </List>
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* View Report Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>AI Medical Summary Report</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedReport && (
              <VStack spacing={6} align="stretch">
                {/* Header Info */}
                <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                  <Box>
                    <Text fontWeight="bold" mb={1}>
                      Patient
                    </Text>
                    <Text>{selectedReport.patientName}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={1}>
                      Report Date
                    </Text>
                    <Text>{selectedReport.uploadDate}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={1}>
                      Priority Level
                    </Text>
                    <Badge
                      colorScheme={getUrgencyColor(selectedReport.urgencyLevel)}
                      size="lg"
                    >
                      {selectedReport.urgencyLevel}
                    </Badge>
                  </Box>
                </Grid>

                <Divider />

                {/* Key Findings */}
                <Card>
                  <CardHeader>
                    <HStack>
                      <Icon as={FiAlertTriangle} color="orange.500" />
                      <Heading size="md">Key Findings</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <List spacing={2}>
                      {selectedReport.summary.keyFindings.map(
                        (finding, idx) => (
                          <ListItem key={idx}>
                            <ListIcon as={FiTrendingUp} color="blue.500" />
                            {finding}
                          </ListItem>
                        )
                      )}
                    </List>
                  </CardBody>
                </Card>

                {/* Critical Values */}
                <Card>
                  <CardHeader>
                    <HStack>
                      <Icon as={FiHeart} color="red.500" />
                      <Heading size="md">Critical Values Analysis</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Parameter</Th>
                          <Th>Current Value</Th>
                          <Th>Normal Range</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {selectedReport.summary.criticalValues.map(
                          (value, idx) => (
                            <Tr key={idx}>
                              <Td fontWeight="medium">{value.parameter}</Td>
                              <Td>{value.value}</Td>
                              <Td>{value.normal}</Td>
                              <Td>
                                <Badge
                                  colorScheme={
                                    value.status === "Normal" ? "green" : "red"
                                  }
                                >
                                  {value.status}
                                </Badge>
                              </Td>
                            </Tr>
                          )
                        )}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <HStack>
                      <Icon as={FiCheckCircle} color="green.500" />
                      <Heading size="md">AI Recommendations</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <List spacing={2}>
                      {selectedReport.summary.recommendations.map(
                        (rec, idx) => (
                          <ListItem key={idx}>
                            <ListIcon as={FiActivity} color="green.500" />
                            {rec}
                          </ListItem>
                        )
                      )}
                    </List>
                  </CardBody>
                </Card>

                {/* Treatment Continuity */}
                <Card>
                  <CardHeader>
                    <HStack>
                      <Icon as={FiClock} color="purple.500" />
                      <Heading size="md">Treatment Continuity Analysis</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <Accordion allowToggle>
                      <AccordionItem>
                        <AccordionButton>
                          <Box flex="1" textAlign="left" fontWeight="medium">
                            Current Medications
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel>
                          <List spacing={1}>
                            {selectedReport.summary.treatmentContinuity.currentMedications.map(
                              (med, idx) => (
                                <ListItem key={idx}>• {med}</ListItem>
                              )
                            )}
                          </List>
                        </AccordionPanel>
                      </AccordionItem>

                      <AccordionItem>
                        <AccordionButton>
                          <Box flex="1" textAlign="left" fontWeight="medium">
                            Suggested Changes
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel>
                          <List spacing={1}>
                            {selectedReport.summary.treatmentContinuity.suggestedChanges.map(
                              (change, idx) => (
                                <ListItem key={idx}>• {change}</ListItem>
                              )
                            )}
                          </List>
                        </AccordionPanel>
                      </AccordionItem>

                      <AccordionItem>
                        <AccordionButton>
                          <Box flex="1" textAlign="left" fontWeight="medium">
                            Drug Interactions & Contraindications
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel>
                          <VStack align="start" spacing={3}>
                            <Box>
                              <Text fontWeight="medium" fontSize="sm">
                                Contraindications:
                              </Text>
                              <List spacing={1}>
                                {selectedReport.summary.treatmentContinuity.contraindications.map(
                                  (contra, idx) => (
                                    <ListItem key={idx} fontSize="sm">
                                      • {contra}
                                    </ListItem>
                                  )
                                )}
                              </List>
                            </Box>
                            <Box>
                              <Text fontWeight="medium" fontSize="sm">
                                Drug Interactions:
                              </Text>
                              <List spacing={1}>
                                {selectedReport.summary.treatmentContinuity.drugInteractions.map(
                                  (interaction, idx) => (
                                    <ListItem key={idx} fontSize="sm">
                                      • {interaction}
                                    </ListItem>
                                  )
                                )}
                              </List>
                            </Box>
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  </CardBody>
                </Card>

                <HStack justify="flex-end" spacing={3}>
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                  <Button
                    leftIcon={<FiDownload />}
                    variant="outline"
                    onClick={() => handleDownloadOriginalPDF(selectedReport)}
                  >
                    Download Original PDF
                  </Button>
                  <Button
                    leftIcon={<FiDownload />}
                    colorScheme="blue"
                    onClick={() => handleDownloadReport(selectedReport)}
                  >
                    Download AI Summary
                  </Button>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MedicalSummaryReport;
