const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    pHMin: {
      type: Number,
      default: 6.5
    },

    pHMax: {
      type: Number,
      default: 8.5
    },

    turbidityMax: {
      type: Number,
      default: 5
    },

    temperatureMin: {
      type: Number,
      default: 20
    },

    temperatureMax: {
      type: Number,
      default: 30
    },

    waterLevelMin: {
      type: Number,
      default: 30
    },

    waterLevelMax: {
      type: Number,
      default: 90
    },

    flowRateMin: {
      type: Number,
      default: 100
    },

    flowRateMax: {
      type: Number,
      default: 150
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Setting", settingSchema);