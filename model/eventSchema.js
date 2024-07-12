const mongoose = require('mongoose')
const eventSchema = new mongoose.Schema({
    eventType : {
        type : String ,
        required : [true , "Event type is required"] 
    },
    eventName : {
        type : String ,
        required :  [true , "Event nane is required"] 
    },
    date : {
        type : String ,
        required :  [true , "Date type is required"]  
    },
    time : {
        type : String ,
        required :  [true , "Time is required"]  
    },
    location : {
        type : String ,
        required :  [true , "Location is required"]  
    },
    wishlist : {
        type : String ,
        required :  [true , "Wishlist is required"]  
    },
    description : {
        type : String ,
        required :  [true , "description is required"]  
    },
    parentId : {
        type : String ,
        required :  [true , "Parent-id  is required"]  
    }
})

module.exports = mongoose.model("event" , eventSchema)