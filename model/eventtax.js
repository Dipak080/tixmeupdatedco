const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    eventid: {
        type: String,
    },
    taxtitle: {
        type: String,
    },
    taxtype: {
        type: String
    },
    taxamount: {
        type: Number
    },
    isglobal: {
        type: String,
    },
    ticketname: {
        type: String
    },
    ticketid: {
        type: String
    }
},
    {
        timestamps: true,
        versionKey: false
    }
);
module.exports = mongoose.model("Eventtax", userSchema);