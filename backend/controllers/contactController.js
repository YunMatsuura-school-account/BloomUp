const nodemailer = require("nodemailer");

// Create reusable transporter object using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER || "bloomupproject2@gmail.com",
      pass: process.env.EMAIL_PASSWORD, // App password from Gmail
    },
  });
};

// Send contact form email
exports.sendContactEmail = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Check if email password is configured
    if (!process.env.EMAIL_PASSWORD) {
      console.error("EMAIL_PASSWORD not configured in environment variables");
      return res.status(500).json({
        success: false,
        message:
          "Email service not configured. Please contact the administrator.",
      });
    }

    const transporter = createTransporter();

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER || "bloomupproject2@gmail.com",
      to: "bloomupproject2@gmail.com",
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">New Contact Form Submission</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p style="background-color: white; padding: 15px; border-left: 4px solid #3498db; margin-top: 10px;">
              ${message.replace(/\n/g, "<br>")}
            </p>
          </div>
          <p style="color: #7f8c8d; font-size: 12px; margin-top: 20px;">
            This email was sent from the BloomUp contact form.
          </p>
        </div>
      `,
      replyTo: email, // Allow replying directly to the sender
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log(`✅ Contact form email sent from ${name} (${email})`);

    res.status(200).json({
      success: true,
      message: "Thank you for contacting us! We will get back to you soon.",
    });
  } catch (error) {
    console.error("❌ Error sending contact email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
