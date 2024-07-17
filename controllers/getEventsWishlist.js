const Invitation = require('../model/inviteFriend'); // Path to your Invitation model
const Event = require('../model/eventSchema'); // Path to your Event model
const WishlistProduct = require('../model/wishlistSchema'); // Path to your WishlistProduct model
const User = require('../model/signUpSchema'); // Path to your User model

exports.getEventsWishlist = async (req, res) => {
    const { userId } = req.params;

    try {
        // Step 1: Retrieve the user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Log user data
        console.log('User:', user);

        // Step 2: Extract the email from the user
        const userEmail = user.email;

        // Step 3: Find invitations with the user's email
        const invitations = await Invitation.find({ friendEmail: userEmail });
        if (!invitations.length) {
            return res.status(404).json({ message: 'No invitations found for this email' });
        }

        // Log invitations data
        console.log('Invitations:', invitations);

        // Step 4: Filter invitations where status is "accepted"
        const acceptedInvitations = invitations.filter(invitation => invitation.status === 'accepted');
        if (!acceptedInvitations.length) {
            return res.status(404).json({ message: 'No accepted invitations found' });
        }

        // Log accepted invitations
        console.log('Accepted Invitations:', acceptedInvitations);

        // Step 5: Retrieve the event details using eventId from the accepted invitations
        const eventIds = acceptedInvitations.map(invitation => invitation.eventId);
        const events = await Event.find({ _id: { $in: eventIds } });

        // Log events data
        console.log('Events:', events);

        // Step 6: Retrieve the wishlist products using nameId from the events' wishlistId
        const wishlistIds = events.map(event => event.wishlistId);
        const wishlistProducts = await WishlistProduct.find({ nameId: { $in: wishlistIds } });

        // Log wishlist products data
        console.log('Wishlist Products:', wishlistProducts);

        // Step 7: Map wishlist products to their corresponding events
        const eventsWithWishlists = events.map(event => {
            return {
                event,
                wishlists: wishlistProducts.filter(wishlist => wishlist.nameId.equals(event.wishlistId))
            };
        });

        res.status(200).json({
            success: true,
            acceptedInvitations,
            eventsWithWishlists
        });
    } catch (error) {
        console.error('Error fetching accepted wishlists', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
