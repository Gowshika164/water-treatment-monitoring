const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const SensorReading = require("./models/SensorReading");
const Alert = require("./models/Alert");
const Equipment = require("./models/Equipment");
const Setting = require("./models/Setting");
const User = require("./models/User");


const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authMiddleware = require("./middleware/authMiddleware");
const startSensorSimulator = require("./sensorSimulator");
const startEquipmentSimulator = require("./equipmentSimulator");

const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());


// =====================================================
// MONGODB CONNECTION
// =====================================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    // Start automatic sensor simulation
    startSensorSimulator();
    startEquipmentSimulator();
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });


// =====================================================
// TEST ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.send("Water Treatment Monitoring API is running");
});


// =====================================================
// AUTHENTICATION ROUTES
// =====================================================


// -----------------------------------------------------
// POST - Register user
// -----------------------------------------------------

app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role
    } = req.body;

    // Validate fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "operator"
    });

    res.status(201).json({
      message: "User registered successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Server error during registration"
    });
  }
});


// -----------------------------------------------------
// POST - Login user
// -----------------------------------------------------

app.post("/api/auth/login", async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Compare password with hashed password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h"
      }
    );

    res.json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error during login"
    });
  }
});


// =====================================================
// SENSOR ROUTES
// =====================================================


// -----------------------------------------------------
// POST - Add sensor reading manually
// PROTECTED
// -----------------------------------------------------

app.post(
  "/api/sensors",
  authMiddleware,
  async (req, res) => {
    try {
      // Save sensor reading
      const reading = new SensorReading(req.body);

      const savedReading = await reading.save();

      // Get settings
      let settings = await Setting.findOne();

      // Create default settings if none exist
      if (!settings) {
        settings = await Setting.create({
          pHMin: 6.5,
          pHMax: 8.5,

          turbidityMax: 5,

          temperatureMin: 20,
          temperatureMax: 30,

          waterLevelMin: 30,
          waterLevelMax: 90,

          flowRateMin: 100,
          flowRateMax: 150
        });
      }

      const alerts = [];

      // pH check
      if (
        reading.pH < settings.pHMin ||
        reading.pH > settings.pHMax
      ) {
        alerts.push({
          parameter: "pH",
          value: reading.pH,
          message:
            `pH is outside normal range (${settings.pHMin} - ${settings.pHMax})`
        });
      }

      // Turbidity check
      if (
        reading.turbidity >
        settings.turbidityMax
      ) {
        alerts.push({
          parameter: "Turbidity",
          value: reading.turbidity,
          message:
            `Turbidity exceeds ${settings.turbidityMax} NTU`
        });
      }

      // Temperature check
      if (
        reading.temperature <
          settings.temperatureMin ||
        reading.temperature >
          settings.temperatureMax
      ) {
        alerts.push({
          parameter: "Temperature",
          value: reading.temperature,
          message:
            `Temperature is outside normal range (${settings.temperatureMin} - ${settings.temperatureMax} °C)`
        });
      }

      // Water level check
      if (
        reading.waterLevel <
          settings.waterLevelMin ||
        reading.waterLevel >
          settings.waterLevelMax
      ) {
        alerts.push({
          parameter: "Water Level",
          value: reading.waterLevel,
          message:
            `Water level is outside normal range (${settings.waterLevelMin} - ${settings.waterLevelMax}%)`
        });
      }

      // Flow rate check
      if (
        reading.flowRate <
          settings.flowRateMin ||
        reading.flowRate >
          settings.flowRateMax
      ) {
        alerts.push({
          parameter: "Flow Rate",
          value: reading.flowRate,
          message:
            `Flow rate is outside normal range (${settings.flowRateMin} - ${settings.flowRateMax})`
        });
      }

      // Save alerts
      if (alerts.length > 0) {
        await Alert.insertMany(alerts);
      }

      res.status(201).json({
        reading: savedReading,
        alerts
      });

    } catch (error) {
      console.error(
        "Error saving sensor reading:",
        error
      );

      res.status(500).json({
        message: "Error saving sensor reading",
        error: error.message
      });
    }
  }
);


// -----------------------------------------------------
// GET - Latest sensor reading
// PROTECTED
// -----------------------------------------------------

app.get(
  "/api/sensors/latest",
  authMiddleware,
  async (req, res) => {
    try {
      const latestReading =
        await SensorReading.findOne()
          .sort({ timestamp: -1 });

      res.json(latestReading);

    } catch (error) {
      console.error(
        "Error fetching latest reading:",
        error
      );

      res.status(500).json({
        message:
          "Error fetching latest sensor reading"
      });
    }
  }
);


// -----------------------------------------------------
// GET - Sensor history
// PROTECTED
// -----------------------------------------------------

app.get(
  "/api/sensors/history",
  authMiddleware,
  async (req, res) => {
    try {
      const readings =
        await SensorReading.find()
          .sort({ timestamp: -1 })
          .limit(20);

      res.json(readings);

    } catch (error) {
      res.status(500).json({
        message: "Error fetching sensor history",
        error: error.message
      });
    }
  }
);


// =====================================================
// ALERT ROUTES
// =====================================================


// -----------------------------------------------------
// GET - All alerts
// PROTECTED
// -----------------------------------------------------

app.get(
  "/api/alerts",
  authMiddleware,
  async (req, res) => {
    try {
      const alerts =
        await Alert.find()
          .sort({ timestamp: -1 });

      res.json(alerts);

    } catch (error) {
      res.status(500).json({
        message: "Error fetching alerts",
        error: error.message
      });
    }
  }
);


// -----------------------------------------------------
// DELETE - Clear all alerts
// PROTECTED
// -----------------------------------------------------

app.delete(
  "/api/alerts",
  authMiddleware,
  async (req, res) => {
    try {
      await Alert.deleteMany({});

      res.json({
        message:
          "All alerts cleared successfully"
      });

    } catch (error) {
      console.error(
        "Error clearing alerts:",
        error
      );

      res.status(500).json({
        message: "Failed to clear alerts"
      });
    }
  }
);


// =====================================================
// EQUIPMENT ROUTES
// =====================================================


// -----------------------------------------------------
// POST - Add equipment
// PROTECTED
// -----------------------------------------------------

app.post(
  "/api/equipment",
  authMiddleware,
  async (req, res) => {
    try {
      const equipment =
        new Equipment(req.body);

      const savedEquipment =
        await equipment.save();

      res.status(201).json(
        savedEquipment
      );

    } catch (error) {
      res.status(500).json({
        message: "Error saving equipment",
        error: error.message
      });
    }
  }
);


// -----------------------------------------------------
// GET - All equipment
// PROTECTED
// -----------------------------------------------------

app.get(
  "/api/equipment",
  authMiddleware,
  async (req, res) => {
    try {
      const equipment =
        await Equipment.find()
          .sort({ createdAt: -1 });

      res.json(equipment);

    } catch (error) {
      res.status(500).json({
        message: "Error fetching equipment",
        error: error.message
      });
    }
  }
);


// =====================================================
// SETTINGS ROUTES
// =====================================================


// -----------------------------------------------------
// GET - Threshold settings
// PROTECTED
// -----------------------------------------------------

app.get(
  "/api/settings",
  authMiddleware,
  async (req, res) => {
    try {
      let settings =
        await Setting.findOne();

      if (!settings) {
        settings =
          await Setting.create({
            pHMin: 6.5,
            pHMax: 8.5,

            turbidityMax: 5,

            temperatureMin: 20,
            temperatureMax: 30,

            waterLevelMin: 30,
            waterLevelMax: 90,

            flowRateMin: 100,
            flowRateMax: 150
          });
      }

      res.json(settings);

    } catch (error) {
      res.status(500).json({
        message: "Error fetching settings",
        error: error.message
      });
    }
  }
);


// -----------------------------------------------------
// PUT - Update threshold settings
// PROTECTED
// -----------------------------------------------------

app.put(
  "/api/settings",
  authMiddleware,
  async (req, res) => {
    try {
      let settings =
        await Setting.findOne();

      if (!settings) {
        settings =
          new Setting(req.body);
      } else {
        Object.assign(
          settings,
          req.body
        );
      }

      const updatedSettings =
        await settings.save();

      res.json(updatedSettings);

    } catch (error) {
      res.status(500).json({
        message: "Error updating settings",
        error: error.message
      });
    }
  }
);


// =====================================================
// START SERVER
// =====================================================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});