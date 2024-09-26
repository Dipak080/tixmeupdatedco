const express = require("express");
const User = require("../model/user");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const jwt = require("jsonwebtoken");
const sendToken = require("../utils/jwtToken");

// create user
router.post("/create-user", async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const userEmail = await User.findOne({ email });
        if (userEmail) {
            return next(new ErrorHandler("User Already exist", 400));
        }
        const user = await User.create({
            name,
            email,
            password
        });
        res.status(201).json({
            success: true,
            userid: user._id
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/user-login", async (req, res, next) => {
    try {

        // const bearerToken = req.headers.authorization;
        // if (!bearerToken) {
        //     return next(new ErrorHandler("Bearer token not provided", 401));
        // }
        // const activation_token = bearerToken.split(' ')[1];

        // const checkAuth = jwt.verify(
        //     activation_token,
        //     process.env.JWT_SECRET_KEY
        // );

        // if (!checkAuth) {
        //     return next(new ErrorHandler("Invalid token", 400));
        // }

        const { email, password } = req.body;
        if (!email || !password) {
            return next(new ErrorHandler("Please provide the all fields!", 400));
        }
        const user = await User.findOne({ email }).select("+password");

        if (user) {
            const isPasswordvalid = await user.comparePassword(password);
            if (!isPasswordvalid) {
                return next(new ErrorHandler("Invalid password!", 400));
            }
            sendToken(user, 200, res);
        } else {
            return next(new ErrorHandler("User not found", 400));
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/user-details-vibrantviva", async (req, res, next) => {
    try {
        const bearerToken = req.headers.authorization;
        if(!bearerToken){
            return next(new ErrorHandler("Bearer token not provided", 400));
        }
        const AuthToken = bearerToken.split(' ')[1];
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return next(new ErrorHandler("nvalid", 401));
            } else {
                console.log('JWT decoded:', decoded);
                // The 'decoded' object contains the payload of the JWT
            }
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
router.post("/users-list", async (req, res, next) => {
    try {
        const { email } = req.body;
        const UserData = await User.findOne({ email });
        if (!UserData) {
            return next(new ErrorHandler("User not found", 400));
        }
        res.status(200).json({
            success: true,
            data: UserData
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
});
module.exports = router; // Export the router