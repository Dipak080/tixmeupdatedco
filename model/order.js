const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    userid: {
        type: String
    },
    eventid: {
        type: String
    },
    items: {
        type: Object
    },
    amount: {
        type: Number
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
    date: {
        type: String
    },
    rewardpoints: {
        type: Number
    },
    discountamount: {
        type: Number
    },
    carttotalamount: {
        type: Number
    },
    couponid: {
        type: String
    },
    isredeemdone: {
        type: Number
    },
    year: {
        type: String
    },
    time: {
        type: String
    },
    mindate: {
        type: String
    },
    payment_id: {
        type: String
    },
    gatway_res: {
        type: Object
    },
    gatway_name: {
        type: String
    },
    payment_status: {
        type: String
    },
    currency: {
        type: String
    },
    tnsid: {
        type: String
    },
    location: {
        type: String
    },
    isdelete: {
        type: Number
    },
    ismail: {
        type: Boolean
    },
},
    {
        timestamps: true,
        versionKey: false
    }
);
module.exports = mongoose.model("Order", userSchema);