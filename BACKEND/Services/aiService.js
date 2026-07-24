const { GoogleGenAI } = require("@google/genai");
const alertService = require("./alertService");

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey });

// Use stable Gemini model
const GEMINI_MODEL = "models/gemini-2.5-flash";

// Helper to extract text from Gemini response
const extractText = (response) => {
  if (
    response.candidates &&
    response.candidates[0] &&
    response.candidates[0].content &&
    response.candidates[0].content.parts &&
    response.candidates[0].content.parts[0]
  ) {
    return response.candidates[0].content.parts[0].text;
  }
  return "";
};

exports.analyzeImage = async (base64Image, mimeType = "image/png") => {
  try {
    // Validate API key
    if (!apiKey) {
      throw new Error("API_KEY not configured in environment variables");
    }

    console.log("Starting image analysis with mimeType:", mimeType);
    console.log("API Key available:", !!apiKey);

    const model = GEMINI_MODEL;
    const prompt = `
      Analyze this medical image (X-ray, CT Scan, or MRI). 
      Identify abnormalities, problem areas, or possible conditions.
      
      Strictly return a JSON object with this structure:
      {
        "summary": "One sentence summary of findings",
        "findings": ["List of specific medical observations"],
        "recommendations": ["List of next steps or tests"],
        "confidence": 0.95,
        "severity": "Normal" | "Mild" | "Moderate" | "Severe" | "Critical"
      }
    `;

    console.log("Making API call to Gemini...");
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { inlineData: { mimeType: mimeType, data: base64Image } },
            { text: prompt },
          ],
        },
      ],
      config: { responseMimeType: "application/json" },
    });

    console.log("API Response received");
    const text = extractText(response);

    if (!text) {
      console.error("Empty response from Gemini API");
      throw new Error("Empty response from AI model");
    }

    console.log("AI Raw Response:", text); // Debug log

    // Clean markdown code blocks if present
    const cleanText = text.replace(/```json\n?|```/g, "").trim();

    console.log("Parsed response:", cleanText);
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("AI Service Error (Image):", error.message);
    console.error("Full error:", error);

    return {
      summary: "Analysis failed due to server error.",
      findings: ["Error processing image: " + error.message],
      recommendations: [
        "Please try again",
        "Check image quality",
        "Retry analysis",
      ],
      confidence: 0,
      severity: "Unknown",
    };
  }
};

exports.searchPatientRecords = async (records, query) => {
  try {
    const model = GEMINI_MODEL;
    const prompt = `
      You are a medical assistant. Search the following patient medical records to answer the query: "${query}".
      
      Medical Records JSON:
      ${JSON.stringify(records)}
      
      Return a JSON object:
      {
        "summary": "A natural language summary answering the question.",
        "results": [Array of matching record objects from the input list, verbatim]
      }
    `;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });

    const text = extractText(response);
    const cleanText = text.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("AI Search Error:", error);
    return { summary: "Search failed.", results: [] };
  }
};

exports.simplifyReport = async (reportText) => {
  try {
    const model = GEMINI_MODEL;
    const prompt = `
      Explain the following medical text in simple, easy-to-understand language for a patient. 
      Avoid medical jargon. Use analogies if helpful.
      
      Text to simplify: "${reportText}"
    `;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
    });

    return extractText(response);
  } catch (error) {
    console.error("AI Simplify Error:", error);
    return "Could not simplify report.";
  }
};

exports.generateHealthInsights = async (patientData) => {
  try {
    const model = GEMINI_MODEL;
    const cleanData = JSON.stringify(patientData, (key, value) => {
      if (key === "attachments" || key === "faceToken") return undefined;
      return value;
    });

    const prompt = `
      Analyze this patient's complete medical history.
      
      Patient Data: ${cleanData}
      
      Return a JSON object:
      {
        "healthScore": (0-100 integer),
        "trendAnalysis": "Paragraph describing overall health direction.",
        "riskFactors": ["List of potential risks"],
        "actionableSteps": ["List of lifestyle or medical recommendations"]
      }
    `;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });

    const text = extractText(response);
    const cleanText = text.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("AI Insights Error:", error);
    return {
      healthScore: 50,
      trendAnalysis: "Insufficient data for analysis.",
      riskFactors: [],
      actionableSteps: [],
    };
  }
};

exports.checkDrugInteractions = async (patientHistory, newDrug) => {
  try {
    const model = GEMINI_MODEL;
    const currentMedications = patientHistory.records
      ? patientHistory.records
          .flatMap((r) => r.medications || [])
          .filter((m) => m && m.active)
          .map((m) => m.name || m)
      : [];

    const patientAllergies = patientHistory.allergies || [];

    console.log("[Drug Check] New drug:", newDrug);
    console.log("[Drug Check] Current medications:", currentMedications);
    console.log("[Drug Check] Allergies:", patientAllergies);

    const prompt = `
You are a senior clinical pharmacist and pharmacology expert. Perform a rigorous drug interaction analysis.

## Patient Context
- NEW DRUG TO PRESCRIBE: "${newDrug}"
- CURRENT MEDICATIONS: ${JSON.stringify(currentMedications)}
- KNOWN ALLERGIES: ${JSON.stringify(patientAllergies)}

## Instructions
1. Check EACH current medication against "${newDrug}" for pharmacokinetic (CYP450, protein binding, renal clearance) and pharmacodynamic (additive, synergistic, antagonistic) interactions.
2. Check for drug-allergy cross-reactivity.
3. Assign an overall safety status based on the WORST interaction found.
4. Rate your confidence based on evidence quality.
5. Suggest safer alternatives ONLY if there ARE interactions of Moderate or higher severity.

## Required JSON Response Format
{
  "safetyStatus": "Safe" | "Caution" | "Danger",
  "severity": "Minor" | "Moderate" | "Critical",
  "confidenceScore": <number 0-100>,
  "interactions": [
    {
      "drug1": "<current medication name>",
      "drug2": "${newDrug}",
      "severity": "Minor" | "Moderate" | "Critical",
      "description": "<specific mechanism, e.g. CYP3A4 inhibition leading to increased levels>",
      "clinicalEffect": "<what the patient may experience>",
      "recommendations": ["<specific action: dose adjustment, monitoring, timing separation>"]
    }
  ],
  "alerts": ["<critical warnings, contraindications, black box warnings>"],
  "recommendations": [
    "<specific dosage guidance>",
    "<monitoring labs or vitals to track>",
    "<timing instructions between medications>"
  ],
  "alternativeDrugs": [
    {
      "name": "<safer alternative>",
      "dosage": "<standard dosage>",
      "frequency": "<dosing schedule>",
      "advantage": "<why it's safer in this context>"
    }
  ]
}

Rules:
- If NO interactions exist, set safetyStatus="Safe", severity="Minor", empty interactions/alerts, and still provide general usage recommendations.
- If interactions exist, be SPECIFIC about the mechanism and clinical significance.
- Always include at least 2 practical recommendations even for safe combinations.
- confidenceScore should reflect the strength of evidence (well-documented interactions = 85-95, theoretical = 50-70).
    `;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });

    const text = extractText(response);
    const cleanText = text.replace(/```json\n?|```/g, "").trim();
    const result = JSON.parse(cleanText);

    // Ensure proper structure
    return {
      safetyStatus: result.safetyStatus || "Caution",
      severity: result.severity || "Moderate",
      confidenceScore: result.confidenceScore || 75,
      interactions: result.interactions || [],
      alerts: result.alerts || [],
      recommendations: result.recommendations || [],
      alternativeDrugs: result.alternativeDrugs || [],
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Drug Check Error:", error);
    return {
      safetyStatus: "Caution",
      severity: "Moderate",
      confidenceScore: 0,
      interactions: [],
      alerts: [
        "AI check encountered an error. Please review manually.",
        error.message || "Unknown error",
      ],
      recommendations: ["Consult a pharmacist"],
      alternativeDrugs: [],
      timestamp: new Date().toISOString(),
    };
  }
};

exports.analyzeLabResult = async (testName, value, patientContext) => {
  try {
    const model = GEMINI_MODEL;
    const prompt = `
      Analyze this lab result: ${testName} = ${value}.
      Is this critical?
      
      Return JSON:
      {
        "isCritical": boolean,
        "severity": "Normal" | "Abnormal" | "Critical",
        "analysis": "Brief clinical interpretation"
      }
    `;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });

    const text = extractText(response);
    const cleanText = text.replace(/```json\n?|```/g, "").trim();
    const result = JSON.parse(cleanText);

    if (result.isCritical) {
      const emergencyPhone = patientContext.emergencyContact?.phone;
      const doctorEmail = "dr.sharma@hospital.com";

      await alertService.sendCriticalAlert(
        patientContext.name,
        doctorEmail,
        emergencyPhone,
        `Critical Lab Result detected: ${testName} is ${value}. ${result.analysis}`,
      );
    }

    return result;
  } catch (error) {
    console.error("Lab Analysis Error:", error);
    return {
      isCritical: false,
      severity: "Unknown",
      analysis: "Error analyzing result",
    };
  }
};

exports.generalSmartSearch = async (query, patientContext) => {
  try {
    const model = GEMINI_MODEL;
    const prompt = `
      You are a medical assistant. Answer this query based on the patient's records if available, or general medical knowledge.
      ${patientContext}
      
      Query: "${query}"
      
      Return a JSON object:
      {
        "summary": "Direct answer to the question",
        "results": [] 
      }
    `;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });

    const text = extractText(response);
    const cleanText = text.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("General Smart Search Error:", error);
    return { summary: "I couldn't process that query.", results: [] };
  }
};

exports.analyzeCriticalConditions = async (patientData) => {
  try {
    const model = GEMINI_MODEL;

    // Clean patient data for AI analysis
    const cleanData = JSON.stringify(patientData, (key, value) => {
      if (key === "attachments" || key === "faceToken" || key === "Photo")
        return undefined;
      return value;
    });

    const prompt = `
      Analyze this patient's complete medical history for critical conditions that require immediate attention.
      
      Patient Data: ${cleanData}
      
      Identify any:
      1. Critical lab values or test results
      2. Dangerous drug interactions or allergies
      3. Worsening health trends
      4. High-risk conditions requiring monitoring
      5. Missing critical medications or follow-ups
      
      Return a JSON object:
      {
        "hasCriticalAlerts": boolean,
        "overallRiskLevel": "Low" | "Medium" | "High" | "Critical",
        "alerts": [
          {
            "type": "Lab Result" | "Drug Interaction" | "Health Trend" | "Missing Medication" | "Follow-up Required",
            "severity": "Low" | "Medium" | "High" | "Critical",
            "title": "Brief alert title",
            "description": "Detailed explanation of the issue",
            "actionRequired": "Recommended immediate action",
            "contactDoctor": boolean
          }
        ],
        "summary": "Overall assessment of patient's critical status"
      }
    `;

    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" },
    });

    const text = extractText(response);
    const cleanText = text.replace(/```json\n?|```/g, "").trim();
    const result = JSON.parse(cleanText);

    // If critical alerts detected, send notifications
    if (result.hasCriticalAlerts && result.alerts && result.alerts.length > 0) {
      const criticalAlerts = result.alerts.filter(
        (alert) => alert.severity === "Critical" && alert.contactDoctor,
      );

      if (criticalAlerts.length > 0 && patientData.Mobile_no) {
        const alertMessage = criticalAlerts
          .map((alert) => `${alert.title}: ${alert.description}`)
          .join(". ");

        // Send critical alert notification
        await alertService.sendCriticalAlert(
          patientData.Name || "Unknown Patient",
          "doctor@hospital.com", // Should be dynamically fetched
          patientData.Mobile_no,
          `Critical health conditions detected for patient. ${alertMessage}`,
        );
      }
    }

    return result;
  } catch (error) {
    console.error("Critical Conditions Analysis Error:", error);
    return {
      hasCriticalAlerts: false,
      overallRiskLevel: "Unknown",
      alerts: [],
      summary: "Error analyzing patient data for critical conditions.",
      error: error.message,
    };
  }
};
