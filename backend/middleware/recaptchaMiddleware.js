import axios from 'axios';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';

dotenv.config();

const verifyCaptcha = asyncHandler(async (req, res, next) => {
  // Get the recaptcha token from the request body
  const { recaptchaToken } = req.body;

  // If the token is not provided, return an error
  if (!recaptchaToken) {
    return res.status(400).json({ message: 'Please complete the CAPTCHA' });
  }

  // Secret key from Google reCAPTCHA
  const secretKey = '6LdmVLgqAAAAAOm3xuODA-ZIXacLkkpjO9l1SeZY';

  try {
    // Verify the captcha token
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`
    );
    
    if (response.data.success) {
      next(); // If CAPTCHA verification is successful, call the next middleware
    } 
    
    else {
      return res.status(400).json({ message: 'CAPTCHA verification failed' }); // If CAPTCHA verification fails, return an error
    }
  } 
  
  catch (error) {
    return res.status(500).json({ message: 'CAPTCHA verification error' }); // If an error occurs during CAPTCHA verification, return an error
  }
});

export { verifyCaptcha };
