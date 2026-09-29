const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    type: {
      type: String,
      required: true
    },

    status: {
      type: String,
      required: true
    },

    condition: {
      type: String,
      default: "Normal"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Equipment",
  equipmentSchema
);