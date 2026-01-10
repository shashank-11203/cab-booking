import nodemailer from "nodemailer";

export const sendEmailOtp = async (email, otp) => {

  console.log("EMAIL ENV CHECK", {
    user: !!process.env.EMAIL_USER,
    pass: !!process.env.EMAIL_PASS,
  });

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  const mailOptions = {
    from: `"DoorDarshan Travels" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Door Darshan OTP Verification",
    html: `
  <div style="margin:0; padding:0; background:#f4f4f4; font-family:Arial, Helvetica, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto;">
      <tr>
        <td style="padding:40px 25px;">

          <!-- Card -->
          <table width="100%" cellpadding="0" cellspacing="0" 
                 style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">

            <!-- Header -->
            <tr>
              <td style="background:#FFD84C; padding:25px 30px; text-align:center;">
                <h1 style="margin:0; font-size:28px; color:#1F2937; font-weight:700;">
                  Door Darshan Travels
                </h1>
                <p style="margin:8px 0 0; color:#1F2937; font-size:14px;">
                  Secure Login Verification
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px; color:#333;">

                <p style="font-size:18px; margin:0 0 15px;">
                  Hello,
                </p>

                <p style="font-size:16px; line-height:1.6; margin:0 0 25px;">
                  Use the OTP below to verify your login request to 
                  <strong>Door Darshan Travels</strong>.  
                  This OTP is valid for only <strong>5 minutes</strong>.
                </p>

                <!-- OTP BOX -->
                <div style="
                  text-align:center;
                  padding:18px 0;
                  background:#FFF5C2;
                  border-radius:12px;
                  font-size:36px;
                  font-weight:bold;
                  letter-spacing:8px;
                  color:#1F2937;
                  border:2px solid #FFD84C;
                  margin-bottom:30px;
                ">
                  ${otp}
                </div>

                <p style="font-size:14px; color:#555; margin:0 0 20px;">
                  If you did not request this login, please ignore this email.  
                  Your account is safe.
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#1F2937; padding:20px; text-align:center;">
                <p style="margin:0; color:#FFD84C; font-size:14px;">
                  © ${new Date().getFullYear()} Door Darshan Travels.   
                  All Rights Reserved.
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </div>
  `
  };

  await transporter.sendMail(mailOptions);
  return true;
};