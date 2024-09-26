const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Please enter email!"],
    },
    userid: {
        type: String
    },
    profiledata: {
        type: Object
    },
    usertype: {
        type: String
    },
    title: {
        type: String
    },
    tickettype: {
        type: String
    },
    priority: {
        type: String
    },
    time: {
        type: String
    },
    uniqueid: {
        type: String
    },
    message: {
        type: String,
    },
    mindate: {
        type: String
    },
    date: {
        type: String
    },
    eventid: {
        type: String
    },
    isfororganizer: {
        type: String
    },
    eventmainid: {
        type: String
    },
    isdelete: {
        type: Number,
        required: [true, "Please enter isdelete value 0 for no delete 1 for delete"],
    },
    isclose: {
        type: Number
    },
    customerid: {
        type: String
    },
    messagelog: {
        type: Object
    }
},
    {
        timestamps: true,
        versionKey: false
    }
);
module.exports = mongoose.model("Support", userSchema);