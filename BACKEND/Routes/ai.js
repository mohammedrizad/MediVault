const express = require("express");
const route = express.Router();
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const Patient = require("../Models/PatientsSchema");

route.post("/summarize", async (req, res) => {
  console.log("AI Summarize Request Body:", req.body);

  try {
    if (!req.body.id) {
      console.log("Missing patient ID in request");
      return res.status(400).json({ error: "Missing patient ID in request" });
    }

    const patientId = req.body.id.trim();
    console.log("Looking up patient with ID:", patientId);
    
    // Use the findById method and check for potential MongoDB ObjectId issues
    const patientRecords = await Patient.findById(patientId).select("History");
      
      // Check if patient was found
      if (!patientRecords) {
        console.log("Patient not found with ID:", patientId);
        return res.status(404).json({ error: `Patient not found with ID: ${patientId}` });
      }
      
      // Check if patientRecords has History field with data
      if (!Array.isArray(patientRecords.History) || patientRecords.History.length === 0) {
        console.log("Patient found but has no history records");
        return res.status(400).json({ error: "Patient has no medical history records." });
      }
      
      console.log(`Found ${patientRecords.History.length} history records for patient`);
      
      // Format records into a readable string for better summarization
      const formattedRecords = patientRecords.History
      .map((record, index) => 
        `#${index + 1}:\nDate: ${record.Date}\nDiagnosis: ${record.disease}\nPrescription: ${record.preciption}\nNotes: ${record.notes}`
      )
      .join("\n\n");

      const chatCompletion = await groq.chat.completions.create({
      model: "llama3-8b-8192", // Use a Groq-supported model
      messages: [
        {
          role: "system",
          content: `You are a medical records analyst specializing in extracting and prioritizing diseases based on severity and duration.
          
          **Task:** 
          - **Ignore minor conditions** (e.g., fever, cough, cold, mild infections).
          - **Identify serious and chronic diseases** (e.g., heart disease, diabetes, hypertension, stroke, cancer).
          - **Categorize diseases** into groups:
            - **Life-threatening Diseases** (e.g., heart attack, stroke, cancer)
            - **Chronic Conditions** (e.g., diabetes, hypertension, kidney disease)
            - **Infectious Diseases** (e.g., tuberculosis, pneumonia)
            - **Surgical History** (if any surgeries are recorded)
          - **Sort by priority:** Long-term diseases with multiple occurrences should be listed first.
          - Provide the report in this structured format:
          
          **Patient’s Major Medical History:**
          - **Life-threatening Diseases:**
            - [Disease] (Dates:[Date 1,Date 2,...,Date n])
          - **Chronic Conditions:**
            - [Disease] (Dates:[Date 1,Date 2,...,Date n])
          - **Infectious Diseases:**
            - [Disease] (Dates:[Date 1,Date 2,...,Date n])
          - **Surgical History:**
            - [Procedure] (Dates:[Date 1,Date 2,...,Date n])
          
          If no major issues exist, return: "No significant past health issues detected."`,
        },
        {
          role: "user",
          content: `Here are the patient's past medical records:\n\n${formattedRecords}\n\nSummarize the key issues and suggest possible treatments.`,
        },
      ],
    });

    console.log(chatCompletion.choices[0].message.content);

    res.json({ summary: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error("Error calling Groq API:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate summaries" });
  }
});

module.exports = route;