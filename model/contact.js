const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    subject: {
        type: String
    },
    areyou: {
        type: String
    },
    message: {
        type: String
    },
    mindate: {
        type: String
    },
    date: {
        type: String
    },
    time: {
        type: String
    },
    isdelete: {
        type: Number,
        required: [true, "Please enter isdelete value 0 for no delete 1 for delete"],
    },
},
    {
        timestamps: true,
        versionKey: false
    }
);
module.exports = mongoose.model("Contact", userSchema);