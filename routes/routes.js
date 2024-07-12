const express = require('express');
const router = express.Router();
const { signup , login ,forgotPassword , resetPassword , editProfile } = require('../controllers/userSignUp')
const {getUsers , deleteUsers}   = require('../controllers/getUsers')
const {addWishlist , getWishlist , deleteWishlist , editWishlist} = require('../controllers/wishlistController')
const {addEvent , getEvents , deleteEvent , editEvent} = require('../controllers/eventController')
router.post('/register' , signup)
router.post('/login' , login)
router.post('/forgetPassword' , forgotPassword)
router.post('/reset-password', resetPassword);
router.put('/edit-profile/:id', editProfile);
router.get('/get-users', getUsers);
router.delete('/delete-users/:id', deleteUsers);

// wishlist curd

router.post("/add-wishlist" , addWishlist)
router.get("/get-wishlist" , getWishlist)
router.delete("/delete-wishlist/:id" , deleteWishlist)
router.put("/edit-wishlist/:id" , editWishlist)

// Event crud
router.post('/add-event', addEvent)
router.get('/get-event', getEvents)
router.delete('/delete-event/:id', deleteEvent)
router.put('/edit-event/:id', editEvent)

module.exports = router