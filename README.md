# Real-Time Water Treatment Plant Monitoring and Alert System

A MERN stack-based web application for monitoring simulated water treatment plant parameters in real time, detecting abnormal conditions, generating alerts, and maintaining historical records.

## Features

- Real-time water quality monitoring
- Automatic software-based sensor simulation
- pH monitoring
- Turbidity monitoring
- Temperature monitoring
- Water level monitoring
- Flow rate monitoring
- Threshold-based alert generation
- Historical sensor data visualization
- Equipment monitoring
- Configurable threshold settings
- User authentication using JWT
- Responsive monitoring dashboard

## Tech Stack

### Frontend
- React.js
- Vite
- CSS
- Lucide React

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcryptjs

### Database
- MongoDB Atlas
- Mongoose

## System Architecture

Simulated Sensor Data  
↓  
Node.js + Express.js Backend  
↓  
Threshold Checking  
↓  
MongoDB Atlas  
↓  
React Dashboard  
↓  
Live Readings, Alerts and Historical Data

## Monitored Parameters

| Parameter | Normal Range |
|---|---|
| pH | 6.5 - 8.5 |
| Turbidity | ≤ 5 NTU |
| Temperature | 20 - 30 °C |
| Water Level | 30 - 90% |
| Flow Rate | 100 - 150 |

## Main Modules

- Dashboard
- Live Monitoring
- Historical Data
- Alerts
- Equipment
- Settings
- Authentication

## Project Structure

```text
water-treatment-monitoring/
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── App.jsx
│       └── api.js
│
├── server/
│   ├── middleware/
│   ├── models/
│   ├── sensorSimulator.js
│   └── server.js
│
├── .gitignore
└── README.md