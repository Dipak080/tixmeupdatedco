const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    amount: {
        type: Number
    },
    status: {
        type: Number,
        required: [true, "Please enter status value 0 for pending 1 for accecpt and 2 for canceled"],
    },
    organizerid: {
        type: String
    },
    country: {
        type: String
    },
    date: {
        type: String
    },
    mindate: {
        type: String
    },
    time: {
        type: String
    },
    organizername: {
        type: String
    },
    organizer_data: {
        type: Object
    },
},
    {
        timestamps: true,
        versionKey: false
    }
);
module.exports = mongoose.model("Payoutlog", userSchema);