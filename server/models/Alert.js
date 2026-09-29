const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
    parameter: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Alert", alertSchema);