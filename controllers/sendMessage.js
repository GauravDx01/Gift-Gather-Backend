
const Message = require('../model/messageSchema');

// POST /api/groupchat/send
exports.sendMessage =  async (req, res) => {
    const { groupId, senderId, message } = req.body;

    try {
        const newMessage = new Message({
            groupId,
            senderId,
            message
        });

        await newMessage.save();

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Error sending message' });
    }
};

exports.getMessages = async(req , res)=>{
    const { groupId } = req.params;

    try {
        const messages = await Message.find({ groupId }).populate('senderId', 'name'); // Populate sender details

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Error fetching messages' });
    }
}


