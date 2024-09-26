const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    orderid: {
        type: String
    },
    boxindex: {
        type: String
    },
    seatindex: {
        type: Number
    },
    eventid: {
        type: String
    },
    boxid: {
        type: String
    },
    status: {
        type: Boolean
    },
},
    {
        timestamps: true,
        versionKey: false
    }
);
module.exports = mongoose.model("Seatmaplog", userSchema);