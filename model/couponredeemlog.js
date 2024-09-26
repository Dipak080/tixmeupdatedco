const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    customerid: {
        type: String
    },
    tokenno: {
        type: String
    },
    coupondiscount: {
        type: String
    },
    couponid: {
        type: String
    },
    orderid: {
        type: String
    },
    isvalid: {
        type: Number // 0 = valid 1 = = used
    },
},
    {
        timestamps: true,
        versionKey: false
    }
);
module.exports = mongoose.model("Couponredeemlog", userSchema);