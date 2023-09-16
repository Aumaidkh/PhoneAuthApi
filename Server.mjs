import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const app = express();
const port = process.env.PORT || 3000;

const SERVICE_PLAN_ID = '0f9ff0a88b2e454c9a99d8f7aa956aae';
const API_TOKEN = '408afafaf0df46c5a29feb06f5f38c11';
const SINCH_NUMBER = '447520651240';

app.use(bodyParser.json());

// Create an empty object to store the OTPs
const otps = {};


// Generate a random verification code
function generateVerificationCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// API endpoint to send a verification code
app.post('/send-verification-code', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const verificationCode = generateVerificationCode();
    sendOtp(phoneNumber,verificationCode,res);

  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// API endpoint to verify OTP and return JWT
app.post('/verify-otp', (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    const expectedVerificationCode = otps[phoneNumber]; // Replace with the expected OTP

    // Verify the received OTP
    if (otp === expectedVerificationCode) {
      // Generate a JWT token (You can use a library like jsonwebtoken)
      const secretKey = 'mysecretkey';
      const token = jwt.sign({ phoneNumber }, secretKey);

      res.status(200).json({ token: token });
    } else {
      res.status(400).json({ error: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

async function sendOtp(phoneNumber,otp,res) {
    const resp = await fetch(
      'https://us.sms.api.sinch.com/xms/v1/' + SERVICE_PLAN_ID + '/batches',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + API_TOKEN
        },
        body: JSON.stringify({
          from: SINCH_NUMBER,
          to: [phoneNumber],
          body: `Your OTP for signing into Mimo is ${otp}`
        })
      }
    );
  
    const data = await resp.json();
    otps[phoneNumber] = otp;
    res.status(200).json({ message: "OTP Sent Successfully" });

  }
