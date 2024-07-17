const mongoose = require('mongoose')
const wishlistName = new mongoose.Schema({
    wishlistName : {
      type : String ,
      required : true 
    },
    userId : {
     type : mongoose.Schema.Types.ObjectId , 
     required : true 
    }
  })
  module.exports = mongoose.model("wishlistName" , wishlistName)