const mongoose = require('mongoose')
const signUpSchema = new mongoose.Schema({
    userName : {
        type : String , 
        required : [true, "Username is requied"],
        trim : true
    } ,
    email : {
        type : String , 
        required : [true, "Email is requied"],
        unique : [true, "Email already exist"],
        trim : true
    } ,
    phoneNumber : {
        type : String , 
        required : [true, "Phone Number is requied"],
        unique : [true, "Phone Number already exist"],
        trim : true
        
    } , 
    password : {
        type : String , 
        required : [true, "Password is required!"],
        trim : true
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