/**
 * Drug Service - API calls for drug interaction checking
 */

import axios from "axios";
import {
  DrugCheckRequest,
  DrugInteractionResult,
  DrugCheckResponse,
} from "../types/drugChecker.types";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5002/api";

const drugAPI = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Check drug interactions for a patient
 * @param request - Contains patientId, medications, and newDrug to check
 * @returns Drug interaction analysis result
 */
export const checkDrugInteractions = async (
  request: DrugCheckRequest,
): Promise<DrugInteractionResult> => {
  try {
    const response = await drugAPI.post<DrugCheckResponse>("/ai/check-drugs", {
      patientId: request.patientId,
      drugName: request.newDrug,
      currentMedications: request.medications,
    });

    const data = response.data;

    // Normalize the response structure
    return {
      safetyStatus: data.safetyStatus || "Caution",
      severity: data.severity || inferSeverity(data.safetyStatus),
      interactions: data.interactions || [],
      alerts: data.alerts || [],
      recommendations: data.recommendations || [],
      alternativeDrugs: data.alternativeDrugs,
      confidenceScore: data.confidenceScore,
      timestamp: data.timestamp || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error checking drug interactions:", error);

    // Return a safe default response with error message
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to check drug interactions";

    throw new Error(errorMessage);
  }
};

/**
 * Get common drug alternatives
 * @param drugName - Drug to find alternatives for
 * @returns List of alternative drugs
 */
export const getDrugAlternatives = async (drugName: string) => {
  try {
    const response = await drugAPI.get(`/ai/drug-alternatives/${drugName}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching drug alternatives:", error);
    return { alternatives: [] };
  }
};

/**
 * Check specific drug-drug interactions
 * @param drug1 - First drug
 * @param drug2 - Second drug
 * @returns Interaction details
 */
export const checkDrugDrugInteraction = async (
  drug1: string,
  drug2: string,
) => {
  try {
    const response = await drugAPI.post("/ai/check-drug-pair", {
      drug1,
      drug2,
    });
    return response.data;
  } catch (error) {
    console.error("Error checking drug pair:", error);
    throw error;
  }
};

/**
 * Get drug information
 * @param drugName - Name of the drug
 * @returns Drug details
 */
export const getDrugInfo = async (drugName: string) => {
  try {
    const response = await drugAPI.get(`/ai/drug-info/${drugName}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching drug info:", error);
    throw error;
  }
};

/**
 * Infer severity level from safety status
 */
function inferSeverity(
  safetyStatus: string,
): "Critical" | "Moderate" | "Minor" {
  switch (safetyStatus) {
    case "Danger":
      return "Critical";
    case "Caution":
      return "Moderate";
    case "Safe":
      return "Minor"; // No interaction severity
    default:
      return "Moderate";
  }
}

export default drugAPI;
