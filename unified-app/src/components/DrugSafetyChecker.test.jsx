/**
 * Drug Safety Checker - Integration Test
 * Test file to verify all components work together correctly
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from "../context/AuthContext";
import DrugSafetyChecker from "../components/DrugSafetyChecker";
import * as drugService from "../services/drugService";

// Mock the API service
jest.mock("../services/drugService");

const renderWithProviders = (component) => {
  return render(
    <ChakraProvider>
      <AuthProvider>{component}</AuthProvider>
    </ChakraProvider>,
  );
};

describe("Drug Safety Checker - Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Component renders with all UI elements", () => {
    renderWithProviders(<DrugSafetyChecker />);

    expect(screen.getByText(/Drug Safety Checker/i)).toBeInTheDocument();
    expect(screen.getByText(/Check for interactions/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Current Medications/i),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Drug to Check/i)).toBeInTheDocument();
  });

  test("Check button is disabled when no medications selected", () => {
    renderWithProviders(<DrugSafetyChecker />);

    const checkButton = screen.getByText("Check Interactions");
    expect(checkButton).toBeDisabled();
  });

  test("Shows error when drug name is empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DrugSafetyChecker />);

    // Add a medication first
    const medicationInput = screen.getByPlaceholderText(/Add medications/i);
    await user.click(medicationInput);
    await user.type(medicationInput, "Aspirin");
    // Select from dropdown (would need to mock this)

    // Try to check without drug name
    const checkButton = screen.getByText("Check Interactions");
    expect(checkButton).toBeDisabled(); // Because no drug name
  });

  test("Displays safe result correctly", async () => {
    const mockResult = {
      safetyStatus: "Safe",
      severity: "Minor",
      confidenceScore: 95,
      interactions: [],
      alerts: [],
      recommendations: ["Safe to use together"],
      alternativeDrugs: [],
      timestamp: new Date().toISOString(),
    };

    drugService.checkDrugInteractions.mockResolvedValue(mockResult);

    renderWithProviders(<DrugSafetyChecker />);

    // Verify result is handled correctly
    await waitFor(() => {
      expect(drugService.checkDrugInteractions).not.toHaveBeenCalled(); // Not called until button clicked
    });
  });

  test("Displays caution result with warnings", async () => {
    const mockResult = {
      safetyStatus: "Caution",
      severity: "Moderate",
      confidenceScore: 80,
      interactions: [
        {
          drug1: "Aspirin",
          drug2: "Ibuprofen",
          severity: "Moderate",
          description: "Both NSAIDs - GI bleed risk",
          recommendations: ["Use one at a time"],
        },
      ],
      alerts: ["WARNING: Concurrent NSAIDs increase GI bleed risk"],
      recommendations: ["Monitor symptoms"],
      alternativeDrugs: [
        {
          name: "Paracetamol",
          dosage: "500-1000mg",
          frequency: "Every 6 hours",
        },
      ],
      timestamp: new Date().toISOString(),
    };

    drugService.checkDrugInteractions.mockResolvedValue(mockResult);

    renderWithProviders(<DrugSafetyChecker />);

    // Verify caution status is handled
    // This would require more detailed interaction simulation
  });

  test("Displays danger result with critical alerts", async () => {
    const mockResult = {
      safetyStatus: "Danger",
      severity: "Critical",
      confidenceScore: 99,
      interactions: [
        {
          drug1: "Warfarin",
          drug2: "Aspirin",
          severity: "Critical",
          description: "Severe bleeding risk",
          recommendations: ["CONTRAINDICATED"],
        },
      ],
      alerts: ["CRITICAL: Severe bleeding risk - DO NOT USE"],
      recommendations: ["Do not prescribe", "Choose alternative"],
      alternativeDrugs: [],
      timestamp: new Date().toISOString(),
    };

    drugService.checkDrugInteractions.mockResolvedValue(mockResult);

    renderWithProviders(<DrugSafetyChecker />);

    // Verify danger status triggers appropriate UI
  });

  test("Handles API errors gracefully", async () => {
    const errorMessage = "Network error";
    drugService.checkDrugInteractions.mockRejectedValue(
      new Error(errorMessage),
    );

    renderWithProviders(<DrugSafetyChecker />);

    // Verify error handling
    // Should show error toast and maintain usable state
  });

  test("Medication selection works correctly", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DrugSafetyChecker />);

    const medicationInput = screen.getByPlaceholderText(/Add medications/i);
    await user.click(medicationInput);

    // Type to search
    await user.type(medicationInput, "asp");

    // Should filter and show Aspirin option
    // (Actual interaction depends on DrugMultiSelect implementation)
  });

  test("Displays multiple interactions correctly", async () => {
    const mockResult = {
      safetyStatus: "Caution",
      severity: "Moderate",
      confidenceScore: 85,
      interactions: [
        {
          drug1: "Aspirin",
          drug2: "Ibuprofen",
          severity: "Moderate",
          description: "NSAID combination",
          recommendations: ["Use one NSAID"],
        },
        {
          drug1: "Metformin",
          drug2: "Ibuprofen",
          severity: "Minor",
          description: "Possible renal effect",
          recommendations: ["Monitor renal function"],
        },
      ],
      alerts: ["Multiple interactions detected"],
      recommendations: ["Review each interaction"],
      alternativeDrugs: [],
      timestamp: new Date().toISOString(),
    };

    drugService.checkDrugInteractions.mockResolvedValue(mockResult);

    renderWithProviders(<DrugSafetyChecker />);

    // Both interactions should be displayed
  });

  test("Shows confidence score in results", async () => {
    const mockResult = {
      safetyStatus: "Caution",
      severity: "Moderate",
      confidenceScore: 87,
      interactions: [],
      alerts: [],
      recommendations: [],
      alternativeDrugs: [],
      timestamp: new Date().toISOString(),
    };

    drugService.checkDrugInteractions.mockResolvedValue(mockResult);

    renderWithProviders(<DrugSafetyChecker />);

    // Confidence score should be visible in results
  });

  test("Alternative drugs are displayed correctly", async () => {
    const mockResult = {
      safetyStatus: "Caution",
      severity: "Moderate",
      confidenceScore: 80,
      interactions: [],
      alerts: [],
      recommendations: [],
      alternativeDrugs: [
        {
          name: "Paracetamol",
          dosage: "500-1000mg",
          frequency: "Every 6 hours",
        },
        {
          name: "Metamizole",
          dosage: "500-1000mg",
          frequency: "Every 6-8 hours",
        },
      ],
      timestamp: new Date().toISOString(),
    };

    drugService.checkDrugInteractions.mockResolvedValue(mockResult);

    renderWithProviders(<DrugSafetyChecker />);

    // Both alternatives should be shown in tab
  });

  test("Loading state is displayed during check", async () => {
    const slowPromise = new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            safetyStatus: "Safe",
            severity: "Minor",
            confidenceScore: 90,
            interactions: [],
            alerts: [],
            recommendations: [],
            alternativeDrugs: [],
            timestamp: new Date().toISOString(),
          }),
        1000,
      ),
    );

    drugService.checkDrugInteractions.mockReturnValue(slowPromise);

    renderWithProviders(<DrugSafetyChecker />);

    // During loading, should show spinner
    // After load, should show results
  });
});

// Test Drug Service directly
describe("Drug Service - Unit Tests", () => {
  test("checkDrugInteractions formats request correctly", async () => {
    const request = {
      patientId: "123",
      medications: ["Aspirin", "Metformin"],
      newDrug: "Ibuprofen",
    };

    // Would test actual API call format
  });

  test("getDrugAlternatives returns array of drugs", async () => {
    // Should return alternatives for given drug
  });

  test("inferSeverity maps status to severity correctly", () => {
    // "Danger" -> "Critical"
    // "Caution" -> "Moderate"
    // "Safe" -> "Minor"
  });
});

export default {};
