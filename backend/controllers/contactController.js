const sgMail = require("@sendgrid/mail");

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Send contact form email using SendGrid
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

    // Check if SendGrid API key is configured
    if (!process.env.SENDGRID_API_KEY) {
      console.error("SENDGRID_API_KEY not configured in environment variables");
      // Log the contact info even without email service
      console.log(`📧 Contact Form Submission (email not configured):`);
      console.log(`   Name: ${name}`);
      console.log(`   Email: ${email}`);
      console.log(`   Message: ${message}`);
      console.log(`   Timestamp: ${new Date().toISOString()}`);

      return res.status(200).json({
        success: true,
        message: "Thank you for contacting us! We will get back to you soon.",
      });
    }

    // Email content for SendGrid
    const msg = {
      to: "bloomupproject2@gmail.com", // Your email to receive contact form submissions
      from: "bloomupproject2@gmail.com", // Must be verified sender in SendGrid
      replyTo: email, // User's email for replying
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #238D88;">New Contact Form Submission</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p style="background-color: white; padding: 15px; border-left: 4px solid #238D88; margin-top: 10px;">
              ${message.replace(/\n/g, "<br>")}
            </p>
          </div>
          <p style="color: #7f8c8d; font-size: 12px; margin-top: 20px;">
            This email was sent from the BloomUp contact form.
          </p>
        </div>
      `,
    };

    // Send email via SendGrid
    await sgMail.send(msg);
    console.log(`✅ Contact form email sent from ${name} (${email})`);

    res.status(200).json({
      success: true,
      message: "Thank you for contacting us! We will get back to you soon.",
    });
  } catch (error) {
    console.error("❌ Error sending contact email:", error.message);

    // Log the contact info even if email fails
    const { name, email, message } = req.body;
    console.log(`📧 Contact Form Submission (email failed):`);
    console.log(`   Name: ${name}`);
    console.log(`   Email: ${email}`);
    console.log(`   Message: ${message}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);

    // Still return success to user - we have their info logged
    res.status(200).json({
      success: true,
      message: "Thank you for contacting us! We will get back to you soon.",
    });
  }
};
