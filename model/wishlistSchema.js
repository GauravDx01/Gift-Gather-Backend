const mongoose = require("mongoose");
const getCurrentTime = () => {
  const currentDate = new Date();
  const ISTTime = currentDate.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "numeric",
  });
  
  return `${ISTTime}`;
};
const getCurrentDate = () => {
  const date = new Date();
  const currentDate = date.getDate();
  const currentMonth = date.getMonth();
  const getYear = date.getFullYear();
  const result = `${currentDate}-${currentMonth}-${getYear}`;
  return result;
};

const wishlistSchema = new mongoose.Schema({
  productLink: {
    type: String,
    required: [true, "Product link is required"],
    match: [/^https?:\/\/.+\..+/, "Invalid URL format"],
  },
  giftName: { type: String, required: [true, "Gift name is required"] },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price must be a positive number"],
  },
  desiredRate: {
    type: Number,
    required: [true, "Desired rate is required"],
    min: [0, "Desired rate must be a positive number"],
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "ParentID  is required"],
    
  },
  description: { type: String, required: [true, "Description is required"] },
  image: { type: String },
  date: {
    default: getCurrentDate(),
    type: String
  },

  time: {
    default: getCurrentTime(),
    type: String
  },
  nameId : {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "nameId  is required"], 
  },
  status :{
    type: String , 
    default : "unmarked"

  }
});
module.exports = mongoose.model("wishlist", wishlistSchema);




