const mongoose = require('mongoose');
const invitationSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    friendEmail: String, 
    status: { type: String, default: 'pending' }
});

module.exports = mongoose.model('invite' , invitationSchema)