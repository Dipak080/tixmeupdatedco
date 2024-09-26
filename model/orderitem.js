const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    order_id: {
        type: String
    },
    orderitem_id: {
        type: String
    },
    tuser_name: {
        type: String
    },
    tuser_gender: {
        type: String
    },
    eventid: {
        type: Object
    },
    ticket_name: {
        type: String
    },
    ticket_id: {
        type: String
    },
    ticket_price: {
        type: String
    },
    ticket_type: {
        type: String
    },
    organizer_id: {
        type: String
    },
    userid: {
        type: String
    },
    user_email: {
        type: String
    },
    user_name: {
        type: String
    },
    owner_id: {
        type: String
    },
    owner_name: {
        type: String
    },
    owner_email: {
        type: String
    },
    date: {
        type: String
    },
    time: {
        type: String
    },
    mindate: {
        type: String
    },
    mintime: {
        type: String
    },
    scan_status: {
        type: String
    },
    isvalid: {
        type: Number
        // 0 = valid | 1 = invalid
    },
    is_transfer: {
        type: Number
    },
    transferid: {
        type: String
    },
    bookingid: {
        type: String
    },
    eventdata: {
        type: Object
    }
},
    {
        timestamps: true,
        versionKey: false
    }
);
module.exports = mongoose.model("Orderitem", userSchema);