const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    order_id: {
        type: String,
    },
    event_id: {
        type: String
    },
    sender_id: {
        type: String,
    },
    recever_id: {
        type: String,
    },
},
    {
        timestamps: true,
        versionKey: false
    }
);
module.exports = mongoose.model("Transferhistory", userSchema);