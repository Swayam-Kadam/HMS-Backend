const express = require('express');
const router = express.Router();
const Contact = require('../models/contacts');


//this route is use to send a message 
router.post('/send',async(req,res)=>{
    try {
        const {name,email,number,message} = req.body;
        const contact =new  Contact({
          name,email,number,message
        })
        await contact.save();
        res.status(201).json({ message: "Appointment created successfully", contact });
    } catch (error) {
        console.error(Error.message);
        res.status(500).send("Some Error occured")
    }
})

//this route is use to get all the message
router.get('/get',async(req,res)=>{
    try {
        const contact = await Contact.find();
        res.json(contact)
    } catch (error) {
        console.error(Error.message);
        res.status(500).send("Some Error occured")
    }
})


module.exports = router