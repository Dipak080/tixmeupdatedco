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
    organizername: {
        type: String
    },
    organizerid: {
        type: String
    },
    organizeremail: {
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
module.exports = mongoose.model("Followlog", userSchema);