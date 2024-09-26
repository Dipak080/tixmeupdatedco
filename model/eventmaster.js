const mongoose = require("mongoose");

const eventMasterSchema = new mongoose.Schema({
    event_hosted: {
        type: Number,
        required: true
    },
    ticket_sold: {
        type: Number,
        required: true
    },
    partners_and_organizers: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("EventMaster", eventMasterSchema, "eventmaster");
