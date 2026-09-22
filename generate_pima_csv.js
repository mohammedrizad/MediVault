// Generate PIMA Indian Diabetes Dataset reproduction (768 records)
// Matching original UCI ML Repository statistical distribution

const fs = require("fs");
const path = require("path");

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFloat(min, max, dec = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(dec));
}
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}
function chance(pct) {
  return Math.random() * 100 < pct;
}

// Box-Muller normal distribution
function randNorm(mean, std) {
  let u1 = Math.random();
  let u2 = Math.random();
  while (u1 === 0) u1 = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z * std;
}

function randNormClamped(mean, std, min, max) {
  let val;
  let attempts = 0;
  do {
    val = randNorm(mean, std);
    attempts++;
  } while ((val < min || val > max) && attempts < 50);
  return clamp(val, min, max);
}

// Original PIMA dataset statistics (from UCI ML Repository):
// Pregnancies:  mean=3.85, std=3.37, min=0, max=17
// Glucose:      mean=120.89, std=31.97, min=0, max=199  (5 zeros = missing)
// BloodPressure: mean=69.11, std=19.36, min=0, max=122  (35 zeros = missing)
// SkinThickness: mean=20.54, std=15.95, min=0, max=99   (227 zeros = missing)
// Insulin:      mean=79.80, std=115.24, min=0, max=846  (374 zeros = missing)
// BMI:          mean=31.99, std=7.88, min=0, max=67.1   (11 zeros = missing)
// DPF:          mean=0.472, std=0.331, min=0.078, max=2.42
// Age:          mean=33.24, std=11.76, min=21, max=81
// Outcome:      268 (1) / 500 (0)

// Diabetic (Outcome=1) stats differ:
// Glucose: mean=141.26, std=31.94
// BMI:     mean=35.14, std=7.26
// Age:     mean=37.07, std=10.97
// DPF:     mean=0.550, std=0.372
// Pregnancies: mean=4.87, std=3.74

// Non-diabetic (Outcome=0) stats:
// Glucose: mean=109.98, std=26.14
// BMI:     mean=30.30, std=7.69
// Age:     mean=31.19, std=11.67
// DPF:     mean=0.430, std=0.299
// Pregnancies: mean=3.30, std=3.02

function generateRecord(isDiabetic) {
  let pregnancies, glucose, bp, skinThickness, insulin, bmi, dpf, age;

  if (isDiabetic) {
    age = Math.round(randNormClamped(37.07, 10.97, 21, 81));
    pregnancies = Math.round(randNormClamped(4.87, 3.74, 0, 17));
    glucose = Math.round(randNormClamped(141.26, 31.94, 44, 199));
    bp = Math.round(randNormClamped(74.0, 14.5, 24, 122));
    bmi = parseFloat(randNormClamped(35.14, 7.26, 18.2, 67.1).toFixed(1));
    dpf = parseFloat(randNormClamped(0.55, 0.372, 0.078, 2.42).toFixed(3));
  } else {
    age = Math.round(randNormClamped(31.19, 11.67, 21, 81));
    pregnancies = Math.round(randNormClamped(3.3, 3.02, 0, 17));
    glucose = Math.round(randNormClamped(109.98, 26.14, 44, 199));
    bp = Math.round(randNormClamped(68.0, 12.8, 24, 122));
    bmi = parseFloat(randNormClamped(30.3, 7.69, 18.2, 67.1).toFixed(1));
    dpf = parseFloat(randNormClamped(0.43, 0.299, 0.078, 2.42).toFixed(3));
  }

  // Skin thickness — correlated with BMI
  if (chance(29.6)) {
    // ~227/768 = 29.6% missing (0)
    skinThickness = 0;
  } else {
    skinThickness = Math.round(
      randNormClamped(bmi * 0.75 + randNorm(0, 5), 8, 7, 99),
    );
  }

  // Insulin — correlated with glucose, high missing rate
  if (chance(48.7)) {
    // ~374/768 = 48.7% missing (0)
    insulin = 0;
  } else {
    const baseInsulin = glucose * 0.8 + randNorm(-20, 40);
    insulin = Math.round(clamp(baseInsulin, 14, 846));
  }

  // Introduce missing values (0) for glucose, BP, BMI at original rates
  if (chance(0.65)) glucose = 0; // 5/768
  if (chance(4.56)) bp = 0; // 35/768
  if (chance(1.43)) bmi = 0; // 11/768

  // Older women → more pregnancies correlation
  if (age > 35 && pregnancies < 2) {
    pregnancies = chance(60) ? rand(2, 6) : pregnancies;
  }

  return {
    Pregnancies: pregnancies,
    Glucose: glucose,
    BloodPressure: bp,
    SkinThickness: skinThickness,
    Insulin: insulin,
    BMI: bmi,
    DiabetesPedigreeFunction: dpf,
    Age: age,
    Outcome: isDiabetic ? 1 : 0,
  };
}

// Generate exactly 268 diabetic + 500 non-diabetic = 768 total
const records = [];

for (let i = 0; i < 268; i++) {
  records.push(generateRecord(true));
}
for (let i = 0; i < 500; i++) {
  records.push(generateRecord(false));
}

// Shuffle to mix diabetic and non-diabetic
for (let i = records.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [records[i], records[j]] = [records[j], records[i]];
}

// Ensure we have some critical high glucose values (>180)
let highGlucoseCount = records.filter(
  (r) => r.Glucose > 180 && r.Glucose !== 0,
).length;
if (highGlucoseCount < 35) {
  // Boost some diabetic patients to have critical glucose
  const diabeticRecords = records.filter(
    (r) => r.Outcome === 1 && r.Glucose > 0 && r.Glucose <= 180,
  );
  const needed = 41 - highGlucoseCount;
  for (let i = 0; i < Math.min(needed, diabeticRecords.length); i++) {
    diabeticRecords[i].Glucose = rand(181, 199);
    // Also boost insulin for these
    if (diabeticRecords[i].Insulin > 0) {
      diabeticRecords[i].Insulin = rand(200, 600);
    }
  }
}

// Build CSV
const headers = [
  "Pregnancies",
  "Glucose",
  "BloodPressure",
  "SkinThickness",
  "Insulin",
  "BMI",
  "DiabetesPedigreeFunction",
  "Age",
  "Outcome",
];

const rows = records.map((r) => headers.map((h) => r[h]).join(","));
const csv = headers.join(",") + "\n" + rows.join("\n") + "\n";

const outPath = path.join(__dirname, "diabetes.csv");
fs.writeFileSync(outPath, csv, "utf-8");

// Print verification stats
const diabetic = records.filter((r) => r.Outcome === 1);
const nonDiabetic = records.filter((r) => r.Outcome === 0);
const critGlucose = records.filter(
  (r) => r.Glucose > 180 && r.Glucose !== 0,
).length;
const ages = records.map((r) => r.Age);
const glucoseNonZero = records
  .filter((r) => r.Glucose > 0)
  .map((r) => r.Glucose);
const bmiNonZero = records.filter((r) => r.BMI > 0).map((r) => r.BMI);
const zeroGlucose = records.filter((r) => r.Glucose === 0).length;
const zeroBP = records.filter((r) => r.BloodPressure === 0).length;
const zeroSkin = records.filter((r) => r.SkinThickness === 0).length;
const zeroInsulin = records.filter((r) => r.Insulin === 0).length;
const zeroBMI = records.filter((r) => r.BMI === 0).length;

const avg = (arr) => (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);

console.log(`✅ Generated ${records.length} records`);
console.log(`📁 Saved to: ${outPath}`);
console.log(`\n--- Verification Statistics ---`);
console.log(
  `Diabetic (Outcome=1): ${diabetic.length} (${((diabetic.length / records.length) * 100).toFixed(1)}%)`,
);
console.log(
  `Non-diabetic (Outcome=0): ${nonDiabetic.length} (${((nonDiabetic.length / records.length) * 100).toFixed(1)}%)`,
);
console.log(`Critical glucose (>180): ${critGlucose}`);
console.log(`Age range: ${Math.min(...ages)} - ${Math.max(...ages)}`);
console.log(`Avg Glucose (non-zero): ${avg(glucoseNonZero)}`);
console.log(`Avg BMI (non-zero): ${avg(bmiNonZero)}`);
console.log(`\nMissing values (0s):`);
console.log(`  Glucose=0: ${zeroGlucose}`);
console.log(`  BloodPressure=0: ${zeroBP}`);
console.log(`  SkinThickness=0: ${zeroSkin}`);
console.log(`  Insulin=0: ${zeroInsulin}`);
console.log(`  BMI=0: ${zeroBMI}`);
