const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    username: {
        type: String
    },
    useremail: {
        type: String
    },
    userid: {
        type: String
    },
    eventname: {
        type: String
    },
    start_date: {
        type: String
    },
    start_time: {
        type: String
    },
    end_date: {
        type: String
    },
    end_time: {
        type: String
    },
    organizerid: {
        type: String
    },
    eventid: {
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
module.exports = mongoose.model("Saveeventlog", userSchema);