async function startServer() {
   const express = require('express');
   const mongoose = require('mongoose');
   const bodyParser = require('body-parser');
   const nodemailer = require('nodemailer');
   const app = express();
   require('dotenv').config();





   // Replace with your MongoDB Atlas connection string
   const mongoURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.guif9pr.mongodb.net/<database-name>`;



   // Connect to MongoDB Atlas
   try {
      await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('Connected to MongoDB Atlas');
   } catch (error) {
      console.error('MongoDB Atlas connection error:', error);
   }

   // Create a model for form submissions
   const Submission = mongoose.model('Submission', {
      name: String,
      email: String,
      // Add more fields as needed
   });

   // Middleware
   app.use(bodyParser.json());

   // Define API endpoint for form submissions
   app.post('/api/submit', async (req, res) => {
      try {
         const submission = new Submission(req.body);
         await submission.save();

         // Send an email to the user
         const transporter = nodemailer.createTransport({
            service: 'your-email-service-provider',
            auth: {
               user: 'your-email@example.com',
               pass: 'your-email-password',
            },
         });

         const mailOptions = {
            from: 'your-email@example.com',
            to: req.body.email, // Use the email provided in the form
            subject: 'Form Submission Confirmation',
            text: `Thank you for your submission. Here is the information you entered: ${JSON.stringify(req.body)}`,
         };

         transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
               console.error('Email error:', error);
            } else {
               console.log('Email sent:', info.response);
            }
         });

         res.json({ success: true, message: 'Form submitted successfully' });
      } catch (error) {
         res.status(500).json({ success: false, message: 'An error occurred' });
      }
   });

   // Start the server
   const port = process.env.PORT || 3001;
   app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
   });
}

startServer().catch(console.error);
