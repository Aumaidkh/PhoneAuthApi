import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import multer from 'multer';
import { Vonage } from '@vonage/server-sdk';

const app = express();
const port = process.env.PORT || 3000;
var forms = multer();



const VONAGE_API_KEY = 'YOUR API KEY HERE';
const API_SECRET = 'YOUR API SECRET HERE';

const vonage = new Vonage({
  apiKey: VONAGE_API_KEY,
  apiSecret: API_SECRET
})

app.use(bodyParser.json());
app.use(forms.array()); 
app.use(bodyParser.urlencoded({ extended: true }));
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
  const from = "Mimo"
  const to = phoneNumber
  const text = `Your OTP for Mimo is ${otp}`
  await vonage.sms.send({to, from, text})
  .then(resp => { 
    otps[phoneNumber] = otp;
    res.status(200).json({message:"OTP Sent Successfully"})
   })
  .catch(err => { 
    console.log('There was an error sending the messages.'); console.error(err);
    res.status(500).json({error:err})
   });
  }