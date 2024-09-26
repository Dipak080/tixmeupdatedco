const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    userid: {
        type: String
    },
    usertype: {
        type: String
    },
    rec_mailid: {
        type: String
    },
    send_status: {
        type: Boolean
    },
    date: {
        type: String
    },
    time: {
        type: String
    },
    is_event_mail: {
        type: Boolean
    },
    event_id: {
        type: String
    },
    is_schedule: {
        type: Boolean
    },
    mindate: {
        type: Number
    },
    message: {
        type: String
    },
},
    {
        timestamps: true,
        versionKey: false
    }
);
module.exports = mongoose.model("mailbox", userSchema);