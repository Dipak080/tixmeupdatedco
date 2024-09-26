const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name: {
        type: String
    },
    symbol: {
        type: String
    },
    currency: {
        type: String
    },
},
    {
        timestamps: true,
        versionKey: false
    }
);
module.exports = mongoose.model("Country", userSchema);