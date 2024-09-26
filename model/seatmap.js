const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    organizerid: {
        type: String
    },
    eventid: {
        type: String
    },
    isdelete: {
        type: Number
    },
    sectionname: {
        type: String
    },
    sectionId: {
        type: String
    },
    rows: {
        type: Number
    },
    seatsPerRow: {
        type: Number
    },
    ticketid: {
        type: String
    },
    position: {
        type: Object
    },
    seatColor: {
        type: String
    },
    rotationAngle: {
        type: Number
    }
},
    {
        timestamps: true,
        versionKey: false
    }
);
module.exports = mongoose.model("Seatmap", userSchema);