const nodemailer = require('nodemailer');

const RegisterationMail=async(email)=>{
    if (!email) {
        return res.json({ msg: 'Recipient mail are required.' });
    }
    try {
        // Create a transporter
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'dineshmadhu2012@gmail.com', // Your email address
            pass: 'cpdknoeavtjksxee', // Your app password
          },
        });
    
        // Email details
        const mailOptions = {
          from: 'dineshmadhu2012@gmail.com', // Sender email
          to: email, 
          subject: "Welcome to [MediVault] – Registration Successful!",
          text: `
        Dear User,
        Congratulations! You’ve successfully registered on MediVault.
        We’re thrilled to have you join our community.
        To get started, log in to your account using the link below:
        <a href="https://yourappname.com/login">Log In</a>
        Details of the Registeration:
          Date and Time:${new Date()}
        
        Best regards,
        The MediVault Team
      `, 
        };
    
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
      } catch (error) {
        console.error('Error sending email:', error);
        // res.json({ msg: 'Failed to send email.', details: error.message });
      }
}

module.exports=RegisterationMail;