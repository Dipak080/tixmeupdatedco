const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    userid: {
        type: String
    },
    useremail: {
        type: String
    },
    amount: {
        type: String
    },
    amounttype: {
        type: String
    },
    userwallet: {
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
},
    {
        timestamps: true,
        versionKey: false
    }
);
module.exports = mongoose.model("Walletupdatelog", userSchema);