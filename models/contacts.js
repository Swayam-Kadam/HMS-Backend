const mongoose = require('mongoose');
const {Schema} = mongoose

const ContactSchema = Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    number:{
        type:Number,
        require:true
    },
    message:{
        type:String,
        require:true
    }
})

const Contact = mongoose.model('contact',ContactSchema);
Contact.createIndexes();
module.exports = Contact
