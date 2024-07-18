// routes/notificationRoutes.js
const express = require('express');
const notificationRouter = express.Router();
const notificationController = require('../controllers/notificationController');

notificationRouter.get('/:userId', notificationController.getUserNotifications);
notificationRouter.put('/:userId/read', notificationController.markNotificationsAsRead);

module.exports = notificationRouter;
