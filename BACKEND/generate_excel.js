// Generate color-coded Excel files from CSV datasets
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

// ─── Helpers ───
function parseCSV(text) {
  const lines = text.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map(parseCSVLine);
  return { headers, rows };
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function autoVal(v) {
  if (v === "") return "";
  const n = Number(v);
  return isNaN(n) ? v : n;
}

// ─── Styles ───
const headerFill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1F4E79" },
};
const headerFont = {
  bold: true,
  color: { argb: "FFFFFFFF" },
  size: 11,
  name: "Calibri",
};
const headerBorder = {
  top: { style: "thin" },
  bottom: { style: "thin" },
  left: { style: "thin" },
  right: { style: "thin" },
};
const cellBorder = {
  top: { style: "thin", color: { argb: "FFD9D9D9" } },
  bottom: { style: "thin", color: { argb: "FFD9D9D9" } },
  left: { style: "thin", color: { argb: "FFD9D9D9" } },
  right: { style: "thin", color: { argb: "FFD9D9D9" } },
};

const RED_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFF4444" },
};
const RED_FONT = { color: { argb: "FFFFFFFF" }, bold: true };
const ORANGE_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFF8C00" },
};
const ORANGE_FONT = { color: { argb: "FFFFFFFF" }, bold: true };
const YELLOW_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFFF176" },
};
const YELLOW_FONT = { color: { argb: "FF333333" }, bold: true };
const GREEN_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF4CAF50" },
};
const GREEN_FONT = { color: { argb: "FFFFFFFF" }, bold: true };
const LIGHTGREEN_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFC8E6C9" },
};
const LIGHTRED_FILL = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFFCDD2" },
};

// ─── 1. DIABETES.XLSX ───
async function generateDiabetesExcel() {
  const csvText = fs.readFileSync(path.join(ROOT, "diabetes.csv"), "utf-8");
  const { headers, rows } = parseCSV(csvText);

  const wb = new ExcelJS.Workbook();
  wb.creator = "MediVault";
  wb.created = new Date();

  const ws = wb.addWorksheet("PIMA Diabetes Dataset", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  // Headers
  const headerRow = ws.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.border = headerBorder;
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });
  ws.getRow(1).height = 22;

  // Column indices (1-based)
  const glucoseCol = headers.indexOf("Glucose") + 1;
  const outcomeCol = headers.indexOf("Outcome") + 1;
  const bmiCol = headers.indexOf("BMI") + 1;
  const bpCol = headers.indexOf("BloodPressure") + 1;
  const ageCol = headers.indexOf("Age") + 1;
  const insulinCol = headers.indexOf("Insulin") + 1;

  // Data rows
  rows.forEach((row, ri) => {
    const dataRow = ws.addRow(row.map(autoVal));
    const rowNum = ri + 2;

    dataRow.eachCell((cell) => {
      cell.border = cellBorder;
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    // Alternating row color
    if (ri % 2 === 1) {
      dataRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF5F5F5" },
        };
      });
    }

    // ── Glucose color coding ──
    const glucoseVal = Number(row[glucoseCol - 1]);
    if (glucoseVal > 0) {
      const gCell = dataRow.getCell(glucoseCol);
      if (glucoseVal > 180) {
        gCell.fill = RED_FILL;
        gCell.font = RED_FONT;
      } else if (glucoseVal >= 140) {
        gCell.fill = ORANGE_FILL;
        gCell.font = ORANGE_FONT;
      } else if (glucoseVal >= 100) {
        gCell.fill = YELLOW_FILL;
        gCell.font = YELLOW_FONT;
      } else {
        gCell.fill = GREEN_FILL;
        gCell.font = GREEN_FONT;
      }
    }

    // ── Outcome color coding ──
    const outcomeVal = Number(row[outcomeCol - 1]);
    const oCell = dataRow.getCell(outcomeCol);
    if (outcomeVal === 1) {
      oCell.fill = LIGHTRED_FILL;
      oCell.font = { color: { argb: "FFC62828" }, bold: true };
      oCell.value = "1 (Diabetic)";
    } else {
      oCell.fill = LIGHTGREEN_FILL;
      oCell.font = { color: { argb: "FF2E7D32" }, bold: true };
      oCell.value = "0 (Normal)";
    }

    // ── BMI color coding ──
    const bmiVal = Number(row[bmiCol - 1]);
    if (bmiVal > 0) {
      const bCell = dataRow.getCell(bmiCol);
      if (bmiVal >= 40) {
        bCell.fill = RED_FILL;
        bCell.font = RED_FONT;
      } else if (bmiVal >= 30) {
        bCell.fill = ORANGE_FILL;
        bCell.font = ORANGE_FONT;
      } else if (bmiVal >= 25) {
        bCell.fill = YELLOW_FILL;
        bCell.font = YELLOW_FONT;
      } else {
        bCell.fill = GREEN_FILL;
        bCell.font = GREEN_FONT;
      }
    }

    // ── Blood Pressure color coding ──
    const bpVal = Number(row[bpCol - 1]);
    if (bpVal > 0) {
      const bpCell = dataRow.getCell(bpCol);
      if (bpVal >= 100) {
        bpCell.fill = RED_FILL;
        bpCell.font = RED_FONT;
      } else if (bpVal >= 85) {
        bpCell.fill = ORANGE_FILL;
        bpCell.font = ORANGE_FONT;
      } else if (bpVal >= 70) {
        bpCell.fill = YELLOW_FILL;
        bpCell.font = YELLOW_FONT;
      } else {
        bpCell.fill = GREEN_FILL;
        bpCell.font = GREEN_FONT;
      }
    }
  });

  // Auto-fit columns
  ws.columns.forEach((col, i) => {
    col.width = Math.max(headers[i].length + 4, 14);
  });

  // Add Legend sheet
  const legend = wb.addWorksheet("Legend");
  legend.addRow(["PIMA Indian Diabetes Dataset - Color Coding Legend"]);
  legend.getRow(1).font = { bold: true, size: 14 };
  legend.addRow([]);
  legend.addRow(["GLUCOSE (mg/dL)"]);
  legend.getRow(3).font = { bold: true, size: 12 };

  const glucoseLegend = [
    ["🔴 RED", "> 180 mg/dL", "CRITICAL - Severe hyperglycemia"],
    ["🟠 ORANGE", "140-180 mg/dL", "HIGH - Pre-diabetic / Diabetic range"],
    ["🟡 YELLOW", "100-139 mg/dL", "MEDIUM - Borderline / Pre-diabetic"],
    ["🟢 GREEN", "< 100 mg/dL", "NORMAL - Healthy fasting glucose"],
  ];
  glucoseLegend.forEach((r) => {
    const row = legend.addRow(r);
    row.getCell(1).font = { bold: true };
  });
  legend.addRow([]);
  legend.addRow(["OUTCOME"]);
  legend.getRow(legend.rowCount).font = { bold: true, size: 12 };
  legend.addRow(["🔴 1 (Diabetic)", "Patient has diabetes"]);
  legend.addRow(["🟢 0 (Normal)", "Patient does not have diabetes"]);
  legend.addRow([]);
  legend.addRow(["BMI"]);
  legend.getRow(legend.rowCount).font = { bold: true, size: 12 };
  legend.addRow(["🔴 RED", "≥ 40", "Morbidly Obese"]);
  legend.addRow(["🟠 ORANGE", "30-39.9", "Obese"]);
  legend.addRow(["🟡 YELLOW", "25-29.9", "Overweight"]);
  legend.addRow(["🟢 GREEN", "< 25", "Normal"]);
  legend.addRow([]);
  legend.addRow(["BLOOD PRESSURE (mmHg)"]);
  legend.getRow(legend.rowCount).font = { bold: true, size: 12 };
  legend.addRow(["🔴 RED", "≥ 100", "Hypertensive Crisis"]);
  legend.addRow(["🟠 ORANGE", "85-99", "High"]);
  legend.addRow(["🟡 YELLOW", "70-84", "Normal-High"]);
  legend.addRow(["🟢 GREEN", "< 70", "Normal"]);

  legend.columns = [{ width: 20 }, { width: 20 }, { width: 40 }];

  const outPath = path.join(ROOT, "diabetes.xlsx");
  await wb.xlsx.writeFile(outPath);
  console.log(`✅ diabetes.xlsx generated (${rows.length} records)`);
}

// ─── 2. PATIENT_MEDICAL_RECORDS.XLSX ───
async function generatePatientExcel() {
  const csvText = fs.readFileSync(
    path.join(ROOT, "patient_medical_records.csv"),
    "utf-8",
  );
  const { headers, rows } = parseCSV(csvText);

  const wb = new ExcelJS.Workbook();
  wb.creator = "MediVault";
  wb.created = new Date();

  const ws = wb.addWorksheet("Patient Records", {
    views: [{ state: "frozen", ySplit: 1, xSplit: 2 }],
  });

  // Headers
  const headerRow = ws.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.border = headerBorder;
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
  });
  ws.getRow(1).height = 28;

  // Key column indices
  const ewsCol = headers.indexOf("EarlyWarningScore") + 1;
  const diabRiskCol = headers.indexOf("DiabetesRiskLevel") + 1;
  const cardRiskCol = headers.indexOf("CardiacRiskLevel") + 1;
  const severityCol = headers.indexOf("Severity") + 1;
  const spo2Col = headers.indexOf("OxygenSaturation") + 1;
  const hrCol = headers.indexOf("HeartRate") + 1;
  const sysBPCol = headers.indexOf("SystolicBP") + 1;
  const tempCol = headers.indexOf("Temperature") + 1;
  const hba1cCol = headers.indexOf("HemoglobinA1C") + 1;
  const glucoseCol = headers.indexOf("FastingGlucose") + 1;
  const statusCol = headers.indexOf("RecordStatus") + 1;
  const bmiCol = headers.indexOf("BMI") + 1;

  // Data rows
  rows.forEach((row, ri) => {
    const dataRow = ws.addRow(row.map(autoVal));
    dataRow.eachCell((cell) => {
      cell.border = cellBorder;
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
    if (ri % 2 === 1) {
      dataRow.eachCell((cell) => {
        if (!cell.fill || cell.fill.fgColor?.argb === undefined) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8F9FA" },
          };
        }
      });
    }

    // ── Early Warning Score ──
    if (ewsCol > 0) {
      const ews = Number(row[ewsCol - 1]);
      const cell = dataRow.getCell(ewsCol);
      if (ews >= 10) {
        cell.fill = RED_FILL;
        cell.font = RED_FONT;
      } else if (ews >= 6) {
        cell.fill = ORANGE_FILL;
        cell.font = ORANGE_FONT;
      } else if (ews >= 3) {
        cell.fill = YELLOW_FILL;
        cell.font = YELLOW_FONT;
      } else {
        cell.fill = GREEN_FILL;
        cell.font = GREEN_FONT;
      }
    }

    // ── Diabetes Risk Level ──
    if (diabRiskCol > 0) {
      const val = row[diabRiskCol - 1];
      const cell = dataRow.getCell(diabRiskCol);
      if (val === "High") {
        cell.fill = RED_FILL;
        cell.font = RED_FONT;
      } else if (val === "Medium") {
        cell.fill = ORANGE_FILL;
        cell.font = ORANGE_FONT;
      } else {
        cell.fill = GREEN_FILL;
        cell.font = GREEN_FONT;
      }
    }

    // ── Cardiac Risk Level ──
    if (cardRiskCol > 0) {
      const val = row[cardRiskCol - 1];
      const cell = dataRow.getCell(cardRiskCol);
      if (val === "High") {
        cell.fill = RED_FILL;
        cell.font = RED_FONT;
      } else if (val === "Medium") {
        cell.fill = ORANGE_FILL;
        cell.font = ORANGE_FONT;
      } else {
        cell.fill = GREEN_FILL;
        cell.font = GREEN_FONT;
      }
    }

    // ── Severity ──
    if (severityCol > 0) {
      const val = row[severityCol - 1];
      const cell = dataRow.getCell(severityCol);
      if (val === "Severe") {
        cell.fill = RED_FILL;
        cell.font = RED_FONT;
      } else if (val === "Moderate") {
        cell.fill = ORANGE_FILL;
        cell.font = ORANGE_FONT;
      } else {
        cell.fill = GREEN_FILL;
        cell.font = GREEN_FONT;
      }
    }

    // ── SpO2 ──
    if (spo2Col > 0) {
      const val = Number(row[spo2Col - 1]);
      const cell = dataRow.getCell(spo2Col);
      if (val < 90) {
        cell.fill = RED_FILL;
        cell.font = RED_FONT;
      } else if (val < 94) {
        cell.fill = ORANGE_FILL;
        cell.font = ORANGE_FONT;
      } else if (val < 96) {
        cell.fill = YELLOW_FILL;
        cell.font = YELLOW_FONT;
      } else {
        cell.fill = GREEN_FILL;
        cell.font = GREEN_FONT;
      }
    }

    // ── Heart Rate ──
    if (hrCol > 0) {
      const val = Number(row[hrCol - 1]);
      const cell = dataRow.getCell(hrCol);
      if (val < 50 || val > 120) {
        cell.fill = RED_FILL;
        cell.font = RED_FONT;
      } else if (val < 60 || val > 100) {
        cell.fill = ORANGE_FILL;
        cell.font = ORANGE_FONT;
      } else {
        cell.fill = GREEN_FILL;
        cell.font = GREEN_FONT;
      }
    }

    // ── Systolic BP ──
    if (sysBPCol > 0) {
      const val = Number(row[sysBPCol - 1]);
      const cell = dataRow.getCell(sysBPCol);
      if (val < 90 || val > 180) {
        cell.fill = RED_FILL;
        cell.font = RED_FONT;
      } else if (val > 150) {
        cell.fill = ORANGE_FILL;
        cell.font = ORANGE_FONT;
      } else if (val > 140) {
        cell.fill = YELLOW_FILL;
        cell.font = YELLOW_FONT;
      } else {
        cell.fill = GREEN_FILL;
        cell.font = GREEN_FONT;
      }
    }

    // ── Temperature ──
    if (tempCol > 0) {
      const val = Number(row[tempCol - 1]);
      const cell = dataRow.getCell(tempCol);
      if (val < 35.5 || val > 39.0) {
        cell.fill = RED_FILL;
        cell.font = RED_FONT;
      } else if (val > 38.0) {
        cell.fill = ORANGE_FILL;
        cell.font = ORANGE_FONT;
      } else if (val > 37.5) {
        cell.fill = YELLOW_FILL;
        cell.font = YELLOW_FONT;
      } else {
        cell.fill = GREEN_FILL;
        cell.font = GREEN_FONT;
      }
    }

    // ── HbA1c ──
    if (hba1cCol > 0) {
      const val = Number(row[hba1cCol - 1]);
      const cell = dataRow.getCell(hba1cCol);
      if (val >= 9.0) {
        cell.fill = RED_FILL;
        cell.font = RED_FONT;
      } else if (val >= 6.5) {
        cell.fill = ORANGE_FILL;
        cell.font = ORANGE_FONT;
      } else if (val >= 5.7) {
        cell.fill = YELLOW_FILL;
        cell.font = YELLOW_FONT;
      } else {
        cell.fill = GREEN_FILL;
        cell.font = GREEN_FONT;
      }
    }

    // ── Fasting Glucose ──
    if (glucoseCol > 0) {
      const val = Number(row[glucoseCol - 1]);
      const cell = dataRow.getCell(glucoseCol);
      if (val > 180) {
        cell.fill = RED_FILL;
        cell.font = RED_FONT;
      } else if (val >= 126) {
        cell.fill = ORANGE_FILL;
        cell.font = ORANGE_FONT;
      } else if (val >= 100) {
        cell.fill = YELLOW_FILL;
        cell.font = YELLOW_FONT;
      } else {
        cell.fill = GREEN_FILL;
        cell.font = GREEN_FONT;
      }
    }

    // ── BMI ──
    if (bmiCol > 0) {
      const val = Number(row[bmiCol - 1]);
      const cell = dataRow.getCell(bmiCol);
      if (val >= 40) {
        cell.fill = RED_FILL;
        cell.font = RED_FONT;
      } else if (val >= 30) {
        cell.fill = ORANGE_FILL;
        cell.font = ORANGE_FONT;
      } else if (val >= 25) {
        cell.fill = YELLOW_FILL;
        cell.font = YELLOW_FONT;
      } else {
        cell.fill = GREEN_FILL;
        cell.font = GREEN_FONT;
      }
    }

    // ── Record Status ──
    if (statusCol > 0) {
      const val = row[statusCol - 1];
      const cell = dataRow.getCell(statusCol);
      if (val === "Active") {
        cell.fill = LIGHTGREEN_FILL;
        cell.font = { color: { argb: "FF2E7D32" }, bold: true };
      } else {
        cell.fill = LIGHTRED_FILL;
        cell.font = { color: { argb: "FFC62828" }, bold: true };
      }
    }
  });

  // Auto-fit columns
  ws.columns.forEach((col, i) => {
    const hLen = headers[i] ? headers[i].length : 10;
    col.width = Math.max(Math.min(hLen + 3, 25), 12);
  });

  // Legend sheet
  const legend = wb.addWorksheet("Color Legend");
  legend.addRow(["Patient Medical Records - Color Coding Legend"]);
  legend.getRow(1).font = { bold: true, size: 14 };
  legend.addRow([]);

  const sections = [
    {
      title: "EARLY WARNING SCORE (EWS)",
      items: [
        ["🔴 RED", "≥ 10", "CRITICAL - Immediate intervention required"],
        ["🟠 ORANGE", "6-9", "HIGH - Urgent clinical review needed"],
        ["🟡 YELLOW", "3-5", "MEDIUM - Increased monitoring"],
        ["🟢 GREEN", "0-2", "LOW - Normal, routine care"],
      ],
    },
    {
      title: "DIABETES & CARDIAC RISK LEVEL",
      items: [
        ["🔴 RED", "High", "High risk - Active monitoring & treatment"],
        ["🟠 ORANGE", "Medium", "Medium risk - Regular screening"],
        ["🟢 GREEN", "Low", "Low risk - Routine follow-up"],
      ],
    },
    {
      title: "OXYGEN SATURATION (SpO2)",
      items: [
        ["🔴 RED", "< 90%", "CRITICAL - Supplemental oxygen needed"],
        ["🟠 ORANGE", "90-93%", "LOW - Close monitoring"],
        ["🟡 YELLOW", "94-95%", "BORDERLINE"],
        ["🟢 GREEN", "≥ 96%", "NORMAL"],
      ],
    },
    {
      title: "FASTING GLUCOSE (mg/dL)",
      items: [
        ["🔴 RED", "> 180", "CRITICAL - Severe hyperglycemia"],
        ["🟠 ORANGE", "126-180", "DIABETIC RANGE"],
        ["🟡 YELLOW", "100-125", "PRE-DIABETIC"],
        ["🟢 GREEN", "< 100", "NORMAL"],
      ],
    },
    {
      title: "HbA1c (%)",
      items: [
        ["🔴 RED", "≥ 9.0", "POORLY CONTROLLED DIABETES"],
        ["🟠 ORANGE", "6.5-8.9", "DIABETIC"],
        ["🟡 YELLOW", "5.7-6.4", "PRE-DIABETIC"],
        ["🟢 GREEN", "< 5.7", "NORMAL"],
      ],
    },
    {
      title: "SEVERITY",
      items: [
        ["🔴 RED", "Severe", "Critical condition"],
        ["🟠 ORANGE", "Moderate", "Needs treatment"],
        ["🟢 GREEN", "Mild", "Manageable"],
      ],
    },
  ];

  sections.forEach((s) => {
    legend.addRow([s.title]);
    legend.getRow(legend.rowCount).font = { bold: true, size: 12 };
    s.items.forEach((r) => {
      const row = legend.addRow(r);
      row.getCell(1).font = { bold: true };
    });
    legend.addRow([]);
  });

  legend.columns = [{ width: 20 }, { width: 18 }, { width: 45 }];

  const outPath = path.join(ROOT, "patient_medical_records.xlsx");
  await wb.xlsx.writeFile(outPath);
  console.log(
    `✅ patient_medical_records.xlsx generated (${rows.length} records)`,
  );
}

// ─── Run both ───
(async () => {
  try {
    await generateDiabetesExcel();
    await generatePatientExcel();
    console.log("\n🎉 Both color-coded Excel files generated successfully!");
    console.log("📁 Files saved in:", ROOT);
  } catch (err) {
    console.error("Error:", err);
  }
})();
