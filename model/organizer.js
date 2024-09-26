const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ErrorHandler = require("../utils/ErrorHandler");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    issignupcomplete: {
        type: Number, // 0 = admin not send mail, 1 = admin send main but iser not fill form, 2 = user fill form 
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    countryname: {
        type: String
    },
    bankaccount: {
        type: String
    },
    bankname: {
        type: String
    },
    holdername: {
        type: String
    },
    swiftcode: {
        type: String
    },
    bank_country_value: {
        type: String
    },
    bank_country_label: {
        type: String
    },
    message: {
        type: String
    },
    otp: {
        type: Number
    },
    email: {
        type: String,
        required: true
    },
    phone_number: {
        type: Number,
        required: true
    },
    area_code: {
        type: Number,
        required: true
    },
    agree_to_terms: {
        type: Number,
        required: true
    },
    isactive : {
        type: Number,
        required: true
        // 0 = Pending | 1 = Active | 2 = Deactive
    },
    followers : {
        type: Number,
    },
    date : {
        type: String,
    },
    address : {
        type: String,
    },
    profile_picture : {
        type: String,
    },
    password: {
        type: String,
        minLength: [8, "Password should be greater than 8 characters"],
        select: false,
    },
    isdelete: {
        type: Number
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

module.exports = mongoose.model("Organizer", userSchema);