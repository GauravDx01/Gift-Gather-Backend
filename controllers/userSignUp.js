const { response } = require('express');
const User = require('../model/signUpSchema');
const multer = require('multer')

require('dotenv').config();
const path = require('path');
exports.signup = async (req, res) => {
    const { userName, phoneNumber, password, email } = req.body;

    try {
        const newUser = await User.create({ userName, phoneNumber, password, email });
        res.status(200).send({
            success: true,
            msg: "User registered successfully",
            data: newUser
        });
    } catch (error) {
        console.error(error);

        if (error.name === 'ValidationError') {
            const errors = Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message
            }));
            return res.status(400).json({ success: false, errors });
        }
        else if (error.code = 11000){
            const duplicateCode = Object.keys(error.keyValue[0])
            res.status(400).send({
                success: false,
                msg: `User registration failed: ${duplicateCode} already exists`,
                error: error.message
            });

        }
        else {
            res.status(500).send({
                success: false,
                msg: "Internal server error",
                error: error.message
            });
        }
    }
};



// login controller 
// controllers/userController.js
const jwt = require('jsonwebtoken');


exports.login = async (req, res) => {
    const { emailOrPhone, password, rememberMe } = req.body;

    try {
        const user = await User.findOne({
            $or: [
                { email: emailOrPhone },
                { phoneNumber: emailOrPhone }
            ]
        });

        if (!user || user.password !== password) {
            return res.status(400).send({
                success: false,
                msg: "Invalid email/phone number or password"
            });
        }

        const token = jwt.sign({ id: user._id }, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9", {
            expiresIn: rememberMe ? '7d' : '1d' // Token expires in 7 days if remember me is checked, otherwise in 1 day
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 7 days or 1 day
        });

        res.status(200).send({
            success: true,
            msg: "Login successful",
            data: user ,
            token : token
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            msg: "Internal server error",
            error: error.message
        });
    }
};



// forget password
const crypto = require('crypto');
const nodemailer = require('nodemailer');

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send({
                success: false,
                msg: "No user found with this email address"
            });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.resetPasswordToken = otp;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL,
            subject: 'Password Reset OTP',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
            Your OTP for password reset is: ${otp}\n\n
            This OTP will expire in 1 hour.\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).send({
            success: true,
            msg: "An email has been sent to " + user.email + " with the OTP."
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            msg: "Internal server error",
            error: error.message
        });
    }
};




// reset password

// controllers/userController.js
exports.resetPassword = async (req, res) => {
    const { otp, newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send({
                success: false,
                msg: "OTP is invalid or has expired."
            });
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).send({
            success: true,
            msg: "Password has been reset successfully."
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            msg: "Internal server error",
            error: error.message
        });
    }
};











// edit the profile 





const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/profilePhoto'); // yahan 'uploads' folder ka path diya hai
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Middleware for handling form-data
const uploadMiddleware = upload.single('profilePhoto');

exports.editProfile = [
    uploadMiddleware, // Use multer middleware to handle file upload
    async (req, res) => {
        const { phoneNumber, password, email, gender, website } = req.body;
        const profilePhoto = req.file ? req.file.path : null;
        const { id } = req.params;

        try {
            const user = await User.findById(id);
            if (!user) {
                return res.status(400).send({
                    msg: "Profile not found!"
                });
            }

            user.phoneNumber = phoneNumber;
            user.password = password;
            user.email = email;
            user.gender = gender;
            user.website = website;
            if (profilePhoto) {
                user.profilePhoto = profilePhoto;
            }

            await user.save();

            res.status(200).send({
                msg: "Profile updated successfully",
                success: true,
                data: user
            });
        } catch (error) {
            res.status(500).send({
                msg: "Internal server error",
                error: error.message // Optional: include error message for debugging
            });
        }
    }
];