const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    orderid: {
        type: String
    },
    customer_id: {
        type: String
    },
    quantity: {
        type: Number
    },
    customer_name: {
        type: String
    },
    customer_email: {
        type: String
    },
    organizer_id: {
        type: String
    },
    event_id: {
        type: String
    },
    bookingid: {
        type: String
    },
    status: {
        type: String // 0 = pending, 1 = success, 2 = declined
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
    payment_id: {
        type: String
    },
    ticket_group_qty: {
        type: Number
    },
    currency: {
        type: String
    },
    ticket_name: {
        type: String
    },
    ticket_id: {
        type: String
    },
    ticket_price: {
        type: Number
    },
    currency_name: {
        type: String
    },
    order_amount: {
        type: Number
    },
    is_support: {
        type: Number
    },
    start_date: {
        type: String
    },
    start_date_min: {
        type: String
    },
    start_time: {
        type: String
    },
},
    {
        timestamps: true,
        versionKey: false
    }
);
module.exports = mongoose.model("Ordersevent", userSchema);