const User = require('../model/signUpSchema');
const Event = require('../model/eventSchema');
const Invitation = require('../model/inviteFriend');
const nodemailer = require('nodemailer');
const Group = require('../model/groupSchema')
require('dotenv').config(); // Load environment variables

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

exports.invite = async (req, res) => {
    const { userId, eventId, friendEmail } = req.body; // friendEmails is an array of emails

    // Check if friendEmails is an array
    if (!Array.isArray(friendEmail)) {
        return res.status(400).send('friendEmails should be an array');
    }

    try {
        const user = await User.findById(userId);
        const event = await Event.findById(eventId);

        if (!user || !event) {
            return res.status(404).send('User or Event not found');
        }

        const invitations = friendEmail.map(friendEmail => ({
            eventId,
            userId,
            friendEmail,
            status: 'pending'
        }));

        console.log('Inserting invitations:', invitations); // Debugging log

        await Invitation.insertMany(invitations); // Bulk insert invitations

        // Create a group for the event without adding the event creator as a member
        const group = new Group({
            name: event.eventName + ' Group',
            members: [], // No members added initially
            event: eventId
        });

        await group.save();

        friendEmail.forEach(async friendEmail => {
            const mailOptions = {
                from: process.env.EMAIL,
                to: friendEmail,
                subject: `You're Invited to ${event.eventName}!`,
                text: `Hi there! ${user.userName} has invited you to ${event.eventName} on ${event.date}. Please accept or reject the invitation by clicking the appropriate link: 
                Accept: http://localhost:5001/api/accept?eventId=${event._id}&friendEmail=${friendEmail}
                Reject: http://localhost:5001/api/reject?eventId=${event._id}&friendEmail=${friendEmail}`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(`Error sending email to ${friendEmail}: ${error.message}`);
                } else {
                    console.log(`Invitation sent to ${friendEmail}: ${info.response}`);
                }
            });
        });

        res.status(200).send({
            success: true,
            message: 'Invitations sent successfully',
            data: invitations // Send the invitations array in the response
        });

    } catch (error) {
        console.error('Error inviting friends:', error); // Debugging log
        res.status(500).send(error.toString());
    }
};




// accept the invite 
exports.accept = async (req, res) => {
    const { eventId, friendEmail } = req.query;

    try {
        const user = await User.findOne({ email: friendEmail });
        if (!user) {
            return res.status(404).send('User not found');
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).send('Event not found');
        }

        const group = await Group.findOne({ event: eventId });

        if (!group) {
            return res.status(404).send('Group not found');
        }

        const invitation = await Invitation.findOne({ eventId, friendEmail });

        if (!invitation) {
            return res.status(404).send('Invitation not found');
        }

        // Add user to the group if not already a member
        if (!group.members.includes(user._id)) {
            group.members.push(user._id);
            await group.save();
        }

        invitation.status = 'accepted';
        await invitation.save();

        res.status(200).send('Invitation accepted successfully');
    } catch (error) {
        console.error('Error accepting invitation:', error); // Debugging log
        res.status(500).send(error.toString());
    }
};




// reject the invitation

exports.reject = async(req , res)=>{
    
    const { eventId, friendEmail } = req.query;

    try {
        const invitation = await Invitation.findOne({ eventId, friendEmail });

        if (!invitation) {
            return res.status(404).send('Invitation not found');
        }

        invitation.status = 'rejected';
        await invitation.save();

        res.send('Invitation rejected');
    } catch (error) {
        res.status(500).send(error.toString());
    }

}
