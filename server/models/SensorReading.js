const mongoose = require("mongoose");

const sensorReadingSchema = new mongoose.Schema({
    pH: Number,
    turbidity: Number,
    temperature: Number,
    waterLevel: Number,
    flowRate: Number,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("SensorReading", sensorReadingSchema);