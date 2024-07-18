const Pool = require('../model/createPoolSchema');
const User = require('../model/signUpSchema');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Chat = require('../model/poolChatSchema');
const Notification = require('../model/notificationSchema');
require('dotenv').config(); // Load environment variables

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});
exports.createPool = async (req, res) => {
    const { poolAmount, createdBy, invitedFriends } = req.body;
    if (!Array.isArray(invitedFriends)) {
        return res.status(400).send('invitedFriends should be an array');
    }

    try {
        const friendsDetails = await Promise.all(invitedFriends.map(async (email) => {
            const friend = await User.findOne({ email });
            if (friend) {
                const token = crypto.randomBytes(20).toString('hex');
                return { email, userId: friend._id, status: 'pending', token };
            } else {
                return { email, userId: null, status: 'invalid' };
            }
        }));

        const validFriends = friendsDetails.filter(friend => friend.userId);
        const invalidFriends = friendsDetails.filter(friend => !friend.userId);

        const newPool = new Pool({
            poolAmount: poolAmount,
            createdBy: createdBy,
            invitedFriends: validFriends,
            isAdmin: createdBy
        });

        await newPool.save();

        validFriends.forEach(async (friend) => {
            const acceptLink = `${process.env.BASE_URL}/api/pools/accept/${newPool._id}/${friend.token}`;
            const rejectLink = `${process.env.BASE_URL}/api/pools/reject/${newPool._id}/${friend.token}`;


            const mailOptions = {
                from: process.env.EMAIL,
                to: friend.email,
                subject: 'You are invited to join a pool',
                text: `You have been invited to join a pool with amount ${poolAmount}. Please click the following links to respond:
Accept: ${acceptLink}
Reject: ${rejectLink}`
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log(`Invitation sent to ${friend.email}`);

                // Create notification for each valid friend
                const notification = new Notification({
                    userId: friend.userId,
                    message: `You have been invited to join a pool with amount ${poolAmount}`
                });
                await notification.save();
            } catch (error) {
                console.error(`Error sending invitation to ${friend.email}:`, error);
            }
        });

        res.status(201).send({
            message: 'Pool created and invitations sent',
            invalidFriends: invalidFriends.map(friend => friend.email)
        });
    } catch (error) {
        console.error('Error creating pool:', error);
        res.status(500).send('Server error');
    }
};

// Accept invitation
exports.acceptInvitation = async (req, res) => {
    const { poolId, token } = req.params;

    try {
        const pool = await Pool.findById(poolId);
        if (!pool) {
            return res.status(404).send('Pool not found');
        }

        const friend = pool.invitedFriends.find(f => f.token === token);
        if (!friend) {
            return res.status(400).send('Invalid token');
        }

        friend.status = 'accepted';
        pool.members.push(friend.userId);

        await pool.save();

        // Create notification for pool creator
        const notification = new Notification({
            userId: pool.createdBy,
            message: `${friend.email} has accepted your pool invitation`
        });
        await notification.save();

        res.status(200).send('Invitation accepted');
    } catch (error) {
        console.error('Error accepting invitation:', error);
        res.status(500).send('Server error');
    }
};


// reject invitation
exports.rejectInvitation = async (req, res) => {
    const { poolId, token } = req.params;

    try {
        const pool = await Pool.findById(poolId);
        if (!pool) {
            return res.status(404).send('Pool not found');
        }

        const friend = pool.invitedFriends.find(f => f.token === token);
        if (!friend) {
            return res.status(400).send('Invalid token');
        }

        friend.status = 'declined';

        await pool.save();

        // Create notification for pool creator
        const notification = new Notification({
            userId: pool.createdBy,
            message: `${friend.email} has declined your pool invitation`
        });
        await notification.save();

        res.status(200).send('Invitation declined');
    } catch (error) {
        console.error('Error declining invitation:', error);
        res.status(500).send('Server error');
    }
};

// Send a message
exports.sendPoolMessage = async (req, res) => {
    const { poolId } = req.params;
    const { senderId, message } = req.body;

    try {
        const pool = await Pool.findById(poolId);
        if (!pool) {
            return res.status(404).send('Pool not found');
        }

        const newChat = new Chat({
            poolId: poolId,
            senderId: senderId,
            message: message
        });

        await newChat.save();

        res.status(200).send('Message sent');
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send('Server error');
    }
};
// get messsages
exports.getPoolMessages = async (req, res) => {
    const { poolId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
        const pool = await Pool.findById(poolId);
        if (!pool) {
            return res.status(404).send('Pool not found');
        }

        const messages = await Chat.find({ poolId })
            .populate('senderId', 'name')
            .sort({ timestamp: -1 }) // Sorting messages by timestamp in descending order
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalMessages = await Chat.countDocuments({ poolId });

        res.status(200).send({
            totalMessages,
            totalPages: Math.ceil(totalMessages / limit),
            currentPage: parseInt(page),
            messages
        });
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).send('Server error');
    }
}




// delete pool 

exports.deletePool = async (req , res)=>{
    try {
        const poolId = req.params.id;
        const deletedPool = await Pool.findByIdAndDelete(poolId);

        if (!deletedPool) {
            return res.status(404).send('Pool not found');
        }

        res.status(200).send({ message: 'Pool deleted successfully' });
    } catch (error) {
        console.error('Error deleting pool:', error);
        res.status(500).send('Server error');
    }
}


// edit pool request

exports.editPool = async (req , res)=>{
    const { poolAmount, invitedFriends } = req.body;
    const poolId = req.params.id;

    if (!Array.isArray(invitedFriends)) {
        return res.status(400).send('invitedFriends should be an array');
    }

    try {
        // Update invited friends and their details
        const friendsDetails = await Promise.all(invitedFriends.map(async (email) => {
            const friend = await User.findOne({ email });
            if (friend) {
                const token = crypto.randomBytes(20).toString('hex');
                return { email, userId: friend._id, status: 'pending', token };
            } else {
                return { email, userId: null, status: 'invalid' };
            }
        }));

        const validFriends = friendsDetails.filter(friend => friend.userId);
        const invalidFriends = friendsDetails.filter(friend => !friend.userId);

        // Update the pool
        const updatedPool = await Pool.findByIdAndUpdate(poolId, {
            poolAmount,
            invitedFriends: validFriends
        }, { new: true });

        if (!updatedPool) {
            return res.status(404).send('Pool not found');
        }

        // Send invitation emails to new friends
        validFriends.forEach(async (friend) => {
            const acceptLink = `${process.env.BASE_URL}/accept-pool-invite/${updatedPool._id}/${friend.token}`;
            const rejectLink = `${process.env.BASE_URL}/reject-pool-invite/${updatedPool._id}/${friend.token}`;

            const mailOptions = {
                from: process.env.EMAIL,
                to: friend.email,
                subject: 'You are invited to join a pool',
                text: `You have been invited to join a pool with amount ${poolAmount}. Please click the following links to respond:
Accept: ${acceptLink}
Reject: ${rejectLink}`
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log(`Invitation sent to ${friend.email}`);
            } catch (error) {
                console.error(`Error sending invitation to ${friend.email}:`, error);
            }
        });

        res.status(200).send({
            message: 'Pool updated and invitations sent',
            invalidFriends: invalidFriends.map(friend => friend.email)
        });
    } catch (error) {
        console.error('Error updating pool:', error);
        res.status(500).send('Server error');
    }
}