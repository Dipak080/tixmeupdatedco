const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name: {
        type: String
    },
    point: {
        type: Number
    },
    discount: {
        type: Number
    },
    isdelete: {
        type: Number
    },
    currency: {
        type: String
    },
},
    {
        timestamps: true,
        versionKey: false
    }
);
module.exports = mongoose.model("Coupon", userSchema);