const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ErrorHandler = require("../utils/ErrorHandler");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    login_type: {
        type: String
    },
    is_comingsoon: {
        type: Number
    },
    picture: {
        type: String
    },
    wallet: {
        type: Number
    },
    date: {
        type: String
    },
    planid: {
        type: String
    },
    hobbies: {
        type: Object
    },
    plan_name: {
        type: String
    },
    plan_amount: {
        type: String
    },
    plan_discount: {
        type: String
    },
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    phone_number: {
        type: Number
    },
    area_code: {
        type: Number
    },
    whatsapp_no: {
        type: Number,
    },
    address: {
        type: String
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    country: {
        type: String,
    },
    cityvalue: {
        type: String,
    },
    statevalue: {
        type: String,
    },
    countryvalue: {
        type: String,
    },
    pincode: {
        type: String
    },
    agree_to_terms: {
        type: Number,
    },
    agree_to_receive_marketing: {
        type: Number,
    },
    otp: {
        type: Number,
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
    return jwt.sign({ id: this._id, name: this.name, email: this.email }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES,
    });
};

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("Customer", userSchema);