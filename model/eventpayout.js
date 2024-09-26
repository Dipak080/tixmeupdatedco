const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    organizer_id: {
        type: String,
    },
    organizer_country: {
        type: String,
    },
    event_id: {
        type: String
    },
    date: {
        type: String
    },
    mindate: {
        type: String
    },
    status: {
        type: Number, // 0 = pending  | 1 = ok | 2 = reject
    },
},
    {
        timestamps: true,
        versionKey: false
    }
);
module.exports = mongoose.model("Eventpayout", userSchema);