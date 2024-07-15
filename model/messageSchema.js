const mongoose = require('mongoose')
const getCurrentTime = () => {
    const currentDate = new Date();
    const ISTTime = currentDate.toLocaleTimeString("en-IN", { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: 'numeric' });
    console.log(ISTTime)
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
  
const messageSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
       
        required: true
    },
    message: {
        type: String,
        required: true
    },
    time: {
        type : String ,
        default:getCurrentTime()
    } ,
    date : {
        type :String , 
        default : getCurrentDate()
    }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
