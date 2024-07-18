// controllers/notificationController.js
const Notification = require('../model/notificationSchema');

exports.getUserNotifications = async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalNotifications = await Notification.countDocuments({ userId });

        res.status(200).send({
            totalNotifications,
            totalPages: Math.ceil(totalNotifications / limit),
            currentPage: parseInt(page),
            notifications
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).send('Server error');
    }
};

exports.markNotificationsAsRead = async (req, res) => {
    const { userId } = req.params;

    try {
        await Notification.updateMany({ userId, read: false }, { read: true });

        res.status(200).send('Notifications marked as read');
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).send('Server error');
    }
};
