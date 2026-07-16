const nodemailer = require('nodemailer');

const LoginMailAlert=async(email)=>{
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
          subject: "MediVault Login Alert", // Email subject
          text: `
        Dear User,
        We noticed a login attempt to your account on Medivault. If this was you, you can safely ignore this email.
        Details of the login:
          Date and Time:${new Date()}
        If this was not you, please secure your account by resetting your password immediately using the link below:
        Thank you for using YourAppName.
        If you have any questions, feel free to contact our support team.
        Best regards,The YourAppName Team
      `, 
        };
    
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
      } catch (error) {
        console.error('Error sending email:', error);
        // res.json({ msg: 'Failed to send email.', details: error.message });
      }
}

module.exports=LoginMailAlert;