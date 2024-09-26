const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    userid: {
        type: String
    },
    username: {
        type: String
    },
    useremail: {
        type: String
    },
    planid: {
        type: String
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
    year: {
        type: String
    },
    mindate: {
        type: String
    },
    date: {
        type: String
    }
},
    {
        timestamps: true,
        versionKey: false
    }
);
module.exports = mongoose.model("Packageplanlog", userSchema);