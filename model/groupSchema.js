const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;



