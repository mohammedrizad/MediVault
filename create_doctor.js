const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Doctor Schema (simplified)
const DoctorSchema = new mongoose.Schema({
    AdminID: String,
    Doctor_name: String,
    Gender: String,
    DOB: String,
    Email_Address: String,
    Current_Address: String,
    Qualifications: String,
    Specialization: String,
    Medical_License_Number: String,
    Medical_Council_Registration_Number: String,
    Years_of_experience: String,
    Contract_type: String,
    PhoneNo: String,
    Password: String,
    Date_Joined: String,
    Time_Joined: String,
    Day_Joined: String
});

const DoctorScheme = mongoose.model('Doctor', DoctorSchema);

// Create doctor function
async function createDoctor() {
    try {
        const bcrypt = require('bcrypt');
        
        const currentdatetime = new Date();
        const currentdate = currentdatetime.toLocaleDateString();
        const currenttime = currentdatetime.toLocaleTimeString();
        const num = currentdatetime.getDay();
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const currentday = daysOfWeek[num];
        
        // Hash the password (using Medical License Number as password)
        const hashpassword = await bcrypt.hash('DOC123456', 10);
        
        const doctor = new DoctorScheme({
            AdminID: "admin",
            Doctor_name: "Dr. John Smith",
            Gender: "Male",
            DOB: "1980-01-01",
            Email_Address: "doctor@test.com",
            Current_Address: "123 Medical Plaza",
            Qualifications: "MBBS, MD",
            Specialization: "General Medicine",
            Medical_License_Number: "DOC123456",
            Medical_Council_Registration_Number: "REG123456",
            Years_of_experience: "10",
            Contract_type: "Full Time",
            PhoneNo: "1234567890",
            Password: hashpassword,
            Date_Joined: currentdate,
            Time_Joined: currenttime,
            Day_Joined: currentday
        });
        
        await doctor.save();
        console.log('✅ Doctor created successfully!');
        console.log('Username: DOC123456');
        console.log('Password: DOC123456');
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating doctor:', error);
        process.exit(1);
    }
}

createDoctor();