/**
 * Drug Interaction Checker Types
 */

export interface Drug {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
}

export interface Interaction {
  drug1: string;
  drug2: string;
  severity: "Critical" | "Moderate" | "Minor";
  description: string;
  recommendations: string[];
}

export interface DrugInteractionResult {
  safetyStatus: "Safe" | "Caution" | "Danger";
  severity?: "Critical" | "Moderate" | "Minor";
  interactions: Interaction[];
  alerts: string[];
  recommendations: string[];
  alternativeDrugs?: Drug[];
  confidenceScore?: number;
  timestamp?: string;
}

export interface DrugCheckRequest {
  patientId: string;
  medications: string[];
  newDrug: string;
}

export interface DrugCheckResponse extends DrugInteractionResult {
  message?: string;
  error?: string;
}

export interface DrugOption {
  value: string;
  label: string;
}

export interface SeverityConfig {
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: React.ReactNode;
}
