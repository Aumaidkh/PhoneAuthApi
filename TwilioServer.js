
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const twilio = require('twilio');

const app = express();
const port = process.env.PORT || 3000;
var forms = multer();

const ACCOUNT_SID = "AC14242f136f18bcb5509ed2b9367076ef"
const AUTH_TOKEN = "76cd6322a10da2ed2c0b8830cd3600d0"
const PHONE = "+12762778506"

app.use(bodyParser.json());
app.use(forms.array()); 
app.use(bodyParser.urlencoded({ extended: true }));
// Create an empty object to store the OTPs
const otps = {};


// Twilio credentials (get these from your Twilio account)

const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

// Generate a random verification code
function generateVerificationCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// API endpoint to send a verification code
app.post('/send-verification-code', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    console.log(`Request : ${phoneNumber}`);
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
    console.log(`Request : ${phoneNumber} OTP ${otp}`);
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
  client.messages
  .create({
    body: `Your OTP is ${otp}`,
    from: PHONE,
    to: phoneNumber,
  })
  .then(() => {
    otps[phoneNumber] = otp
    res.status(200).json({message:"OTP Sent Successfully"});
  })
  .catch((error) => {
    console.error(error);
    res.status(500).end();
  });

  }
