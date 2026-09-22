// Quick Admin Login Fix
const BASE_URL = "http://localhost:5011";

async function createAdminAccount() {
  console.log("🔧 Creating Admin Account...\n");

  try {
    const adminData = {
      Name: "System Administrator",
      Email: "admin@medivault.com",
      Password: "admin123",
      Role: "SuperAdmin",
      Department: "Administration",
      HospitalId: "MV001",
    };

    const response = await fetch(`${BASE_URL}/admin/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(adminData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Admin account created successfully!");
      console.log("Email:", adminData.Email);
      console.log("Password:", adminData.Password);
    } else {
      console.log(
        "⚠️ Admin account creation response:",
        result.msg || result.error
      );
    }

    return result;
  } catch (error) {
    console.log("❌ Error creating admin:", error.message);
  }
}

async function testAdminLogin() {
  console.log("\n🔐 Testing Admin Login...\n");

  try {
    const loginData = {
      Email: "admin@medivault.com",
      Password: "admin123",
    };

    const response = await fetch(`${BASE_URL}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    const result = await response.json();

    console.log("Login Response:", result);

    if (result.msg === "Login successful" || result.token) {
      console.log("✅ Admin login working!");
      console.log("Token:", result.token ? "Generated" : "None");
    } else {
      console.log("❌ Admin login failed:", result.msg);
    }
  } catch (error) {
    console.log("❌ Login test error:", error.message);
  }
}

async function checkExistingAdmins() {
  console.log("\n👥 Checking Existing Admins...\n");

  try {
    const response = await fetch(`${BASE_URL}/admin/getalladmins`);

    if (response.ok) {
      const result = await response.json();
      console.log(`Found ${result.length || 0} admin accounts`);

      if (result.length > 0) {
        result.forEach((admin, index) => {
          console.log(`${index + 1}. ${admin.Name} - ${admin.Email}`);
        });
      }
    } else {
      console.log("Could not fetch admin accounts");
    }
  } catch (error) {
    console.log("Error checking admins:", error.message);
  }
}

// Run admin fix
async function fixAdminLogin() {
  console.log("🚨 ADMIN LOGIN FIX\n");
  console.log("=".repeat(40));

  await checkExistingAdmins();
  await createAdminAccount();
  await testAdminLogin();

  console.log("\n=".repeat(40));
  console.log("✅ Admin Login Fix Complete!");
  console.log("\n🔑 Admin Credentials:");
  console.log("Email: admin@medivault.com");
  console.log("Password: admin123");
  console.log("\n🌐 Login at: http://localhost:3000");
  console.log('Select "Admin" role and use above credentials');
}

fixAdminLogin();
