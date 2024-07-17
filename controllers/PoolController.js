const Pool = require('../model/createPoolSchema');
const User = require('../model/signUpSchema');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
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
        // Verify invited friends' emails and get their IDs
        const friendsDetails = await Promise.all(invitedFriends.map(async (email) => {
            const friend = await User.findOne({ email });
            if (friend) {
                const token = crypto.randomBytes(20).toString('hex');
                return { email, userId: friend._id, status: 'pending', token };
            } else {
                return { email, userId: null, status: 'invalid' };
            }
        }));

        // Separate valid and invalid friends
        const validFriends = friendsDetails.filter(friend => friend.userId);
        const invalidFriends = friendsDetails.filter(friend => !friend.userId);

        // Pool create karna
        const newPool = new Pool({
            poolAmount: poolAmount,
            createdBy: createdBy,
            invitedFriends: validFriends,
            isAdmin: createdBy
        });

        // Pool ko save karna
        await newPool.save();

        // Sabhi valid friends ko invite karne ke liye email bhejna
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
            } catch (error) {
                console.error(`Error sending invitation to ${friend.email}:`, error);
            }
        });

        // Response bhejna
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

        res.status(200).send('Invitation accepted');
    } catch (error) {
        console.error('Error accepting invitation:', error);
        res.status(500).send('Server error');
    }
};

// Reject invitation
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

        pool.chat.push({
            senderId: senderId,
            message: message,
            timestamp: new Date()
        });

        await pool.save();

        res.status(200).send('Message sent');
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send('Server error');
    }
};

// Get messages
exports.getPoolMessages = async (req, res) => {
    const { poolId } = req.params;

    try {
        const pool = await Pool.findById(poolId).populate('chat.senderId', 'name'); // Populating sender's name
        if (!pool) {
            return res.status(404).send('Pool not found');
        }

        res.status(200).send(pool.chat);
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).send('Server error');
    }
};





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
            const acceptLink = `${process.env.BASE_URL}/api/pools/accept/${updatedPool._id}/${friend.token}`;
            const rejectLink = `${process.env.BASE_URL}/api/pools/reject/${updatedPool._id}/${friend.token}`;

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