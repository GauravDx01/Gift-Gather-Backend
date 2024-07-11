const mongoose = require('mongoose')
 const server = mongoose.connect("mongodb://localhost:27017/GiftGather").then((res)=>{
    console.log("MongoDB connected !")
})
module.exports = server