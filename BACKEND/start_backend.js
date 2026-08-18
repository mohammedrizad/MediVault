const { spawn } = require("child_process");
const path = require("path");

console.log("🚀 Starting MediVault Backend with Twilio OTP...");

// Change to the BACKEND directory
const backendPath = path.join(__dirname);
console.log("Backend directory:", backendPath);

// Start the server
const server = spawn("node", ["index.js"], {
  cwd: backendPath,
  stdio: "inherit",
});

server.on("close", (code) => {
  console.log(`Server process exited with code ${code}`);
});

server.on("error", (error) => {
  console.error("Server error:", error);
});
