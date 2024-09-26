const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    order_id: {
        type: String
    },
    eventid: {
        type: Object
    },
    ticket_name: {
        type: String
    },
    ticket_price: {
        type: String
    },
    ticket_type: {
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
    scan_status: {
        type: String
    },
    historyid: {
        type: String
    },
    isvalid: {
        type: Number
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
module.exports = mongoose.model("Tickettransferlog", userSchema);