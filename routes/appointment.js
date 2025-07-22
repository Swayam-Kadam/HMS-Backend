const express = require('express')
const router = express.Router();
const Appointment = require('../models/appointments');
const fetchuser = require('../middleware/fetchuser');

const twilio = require('twilio');

require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_KEY); // Replace with your secret key

const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

//SMSfuncation this function is use to send sms when petions book their appointment
const sendSMSNotification = async (phoneNumber, message) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phoneNumber}`,  // Patient's phone number
    });

    console.log("SMS sent successfully:", response.sid);
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
};



//Route 1:- Fetch All Appointments using:- GET "api/appointment/appo".
router.get('/appo',async(req,res)=>{
    try {
        const appoinment = await Appointment.find();
        res.json(appoinment);
    } catch (error) {
        console.error(Error.message);
        res.status(500).send("Some Error occured")
    }
})


//Route 1:- Fetch All Appointments Of Specific User using:- GET "api/appointment/appouser".
router.get('/appouser',fetchuser,async(req,res)=>{
  try {
      const appoinment = await Appointment.find({ user: req.user.id });
      res.json(appoinment);
  } catch (error) {
      console.error(Error.message);
      res.status(500).send("Some Error occured")
  }
})




//Route 3:- Create a Appointment :POST "api/appointment/appo".
router.post('/appo',fetchuser,async(req,res)=>{
    try {
        const {f_name,l_name,email,number,NIC,DOB,gander,ADOB,department,doctor,address,status} = req.body;
        const appoinment =new  Appointment({
          f_name,l_name,email,number,NIC,DOB,gander,ADOB,department,doctor,address,status,user:req.user.id
        })
        await appoinment.save()
        
        // Send SMS confirmation
     sendSMSNotification(number, `Hello ${f_name}, your appointment is booked on ${ADOB}.`);
        res.status(201).json({ message: "Appointment created successfully", appoinment });
    } catch (error) {
        console.error(Error.message);
    res.status(500).send("Some Error occured")
    }
})


//Route 4:- Update an Appointment Status :PETCH "api/appointment/update/:id".
router.patch("/update-status/:id", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    try {
      // Find the appointment and update its status
      const updatedAppointment = await Appointment.findByIdAndUpdate(
        id,
        { status },
        { new: true } // Return the updated document
      );
  
      if (!updatedAppointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
  
      res.status(200).json({ message: "Status updated successfully", updatedAppointment });
    } catch (error) {
      console.error("Error updating status:", error);
      res.status(500).json({ error: "Failed to update status" });
    }
  });


router.post("/create-checkout-session", async (req, res) => {
    try {
        const { appointment } = req.body;

        const lineItems = appointment.map((appo) => ({
            price_data: {
                currency: "inr", // Correct currency code for Indian Rupees
                product_data: {  // Use product_data instead of appointment_data
                    name: `${appo.f_name} ${appo.l_name}`,
                    description: `Appointment for ${appo.email}`, // Additional info
                },
                unit_amount: 50000, // Correct format (50000 = ₹500.00)
            },
            quantity: 1, // Required field
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: "https://hms-frontend-sigma.vercel.app//success",
            cancel_url: "https://hms-frontend-sigma.vercel.app//unsuccess",
            metadata: {
                user_email: appointment[0].email, // Store extra info in metadata
            },
        });
        res.json({ id: session.id });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ error: error.message });
    }
});


module.exports = router

