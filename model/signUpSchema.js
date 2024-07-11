const mongoose = require('mongoose')
const signUpSchema = new mongoose.Schema({
    userName : {
        type : String , 
        required : true
    } ,
    email : {
        type : String , 
        required : true , 
        unique : true
    } ,
    phoneNumber : {
        type : String , 
        required : true ,
        unique : true
        
    } , 
    password : {
        type : String , 
        required : true 
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    profilePhoto : {
        type: String
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: false
      },
      website : {
        type: String
      }
})
module.exports = mongoose.model("user"  , signUpSchema)