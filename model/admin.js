const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ErrorHandler = require("../utils/ErrorHandler");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter name"],
    },
    email: {
        type: String,
        required: [true, "Please enter email"],
    },
    picture: {
        type: String
    },
    username: {
        type: String,
        required: [true, "Please enter username"],
    },
    password: {
        type: String,
        required: [true, "Please enter password"],
    },
    role: {
        type: Number,
        required: [true, "Please enter role"],
        // 1 = admin 2 = sub admin
    }
},
    {
        timestamps: true,
        versionKey: false
    }
);
// jwt token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id,name: this.name,email: this.email }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES,
    });
};

userSchema.methods.comparePassword = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save",async function (next){
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});
module.exports = mongoose.model("Admin", userSchema);