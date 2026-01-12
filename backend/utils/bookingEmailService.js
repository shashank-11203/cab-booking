import * as brevo from '@getbrevo/brevo';

export const sendBookingConfirmationEmail = async (email, booking) => {
  try {
    const apiInstance = new brevo.TransactionalEmailsApi();

    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = "Your Door Darshan Ride Confirmation";
    sendSmtpEmail.to = [{ email: email, name: "User" }];
    sendSmtpEmail.sender = {
      name: "DoorDarshan Cabs",
      email: process.env.EMAIL_USER
    };

    const {
      rideId,
      pickupName,
      dropName,
      date,
      time,
      carName,
      distanceKm,
      finalFare
    } = booking;

    sendSmtpEmail.htmlContent = `
  <div style="margin:0; padding:0; background:#f7f7f7; font-family:Arial, Helvetica, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto;">

      <tr>
        <td style="padding:40px 25px;">

          <!-- Card -->
          <table width="100%" cellpadding="0" cellspacing="0"
            style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.08);">

            <!-- Header -->
            <tr>
              <td style="background:#FFD84C; padding:30px; text-align:center;">
                <h1 style="margin:0; font-size:28px; color:#1F2937; font-weight:700;">
                  Door Darshan Cabs
                </h1>
                <p style="margin:10px 0 0; color:#1F2937; font-size:15px;">
                  Booking Confirmation
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:35px; color:#333;">

                <p style="font-size:18px; margin:0 0 15px;">
                  Hello,
                </p>

                <p style="font-size:16px; line-height:1.6; margin:0 0 25px;">
                  Your ride has been <strong>successfully booked</strong> with 
                  <strong>Door Darshan Cabs</strong>.
                  Below are your trip details.
                </p>

                <!-- Booking Box -->
                <div style="
                  background:#FFF5C2;
                  padding:20px;
                  border-radius:12px;
                  border:2px solid #FFD84C;
                  margin-bottom:25px;
                ">

                  <p style="margin:0; font-size:16px;">
                    <strong>Booking ID:</strong> ${rideId}
                  </p>

                  <p style="margin:8px 0 0; font-size:16px;">
                    <strong>Pickup:</strong> ${pickupName}
                  </p>

                  <p style="margin:8px 0 0; font-size:16px;">
                    <strong>Drop:</strong> ${dropName}
                  </p>

                  <p style="margin:8px 0 0; font-size:16px;">
                    <strong>Date:</strong> ${date}
                  </p>

                  <p style="margin:8px 0 0; font-size:16px;">
                    <strong>Time:</strong> ${time}
                  </p>

                  <p style="margin:8px 0 0; font-size:16px;">
                    <strong>Car:</strong> ${carName}
                  </p>

                  <p style="margin:8px 0 0; font-size:16px;">
                    <strong>Distance:</strong> ${distanceKm} km
                  </p>

                  <p style="margin:8px 0 0; font-size:16px;">
                    <strong>Total Fare:</strong> Rs. ${finalFare}
                  </p>

                </div>

                <p style="font-size:14px; color:#555; margin:0 0 15px;">
                  Your driver details will be shared with you before the ride.
                </p>

                <p style="font-size:14px; color:#555;">
                  For any changes or cancellations, visit the Bookings section on our website.
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#1F2937; padding:22px; text-align:center;">
                <p style="margin:0; color:#FFD84C; font-size:13px;">
                  © ${new Date().getFullYear()} Door Darshan Cabs  
                  — Reliable · Safe · Comfortable
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>

    </table>

  </div>
  `;

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    return true;
  } catch (error) {
    console.error('Brevo API error:', {
      message: error.message,
      response: error.response?.text || error.response?.body
    });
    throw error;
  }
};
