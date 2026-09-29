const SensorReading = require("./models/SensorReading");
const Alert = require("./models/Alert");
const Setting = require("./models/Setting");

function randomValue(min, max, decimals = 1) {
    return Number(
        (Math.random() * (max - min) + min).toFixed(decimals)
    );
}

function generateNormalReading() {
    return {
        pH: randomValue(6.7, 8.2),
        turbidity: randomValue(1, 4),
        temperature: randomValue(23, 29),
        waterLevel: randomValue(50, 85, 0),
        flowRate: randomValue(105, 140, 0)
    };
}

function generateAbnormalReading() {

    // Start with normal values
    const data = generateNormalReading();

    // Randomly select ONE parameter to make abnormal
    const parameters = [
        "pH",
        "turbidity",
        "temperature",
        "waterLevel",
        "flowRate"
    ];

    const parameter =
        parameters[Math.floor(Math.random() * parameters.length)];

    switch (parameter) {

        case "pH":
            data.pH = randomValue(9, 10);
            break;

        case "turbidity":
            data.turbidity = randomValue(6, 10);
            break;

        case "temperature":
            data.temperature = randomValue(31, 38);
            break;

        case "waterLevel":
            data.waterLevel = randomValue(10, 25, 0);
            break;

        case "flowRate":
            data.flowRate = randomValue(60, 90, 0);
            break;
    }

    return data;
}

function startSensorSimulator() {

    console.log("Sensor simulator started");

    setInterval(async () => {

        try {

            // 80% normal, 20% abnormal
            const isAbnormal = Math.random() < 0.20;

            const data = isAbnormal
                ? generateAbnormalReading()
                : generateNormalReading();

            const reading = new SensorReading(data);

            await reading.save();

            console.log(
                isAbnormal
                    ? "⚠ Simulated ABNORMAL sensor reading:"
                    : "Simulated sensor reading:",
                data
            );

            let settings = await Setting.findOne();

            if (!settings) {
                settings = await Setting.create({});
            }

            const alerts = [];

            if (data.pH < settings.pHMin ||
                data.pH > settings.pHMax) {

                alerts.push({
                    parameter: "pH",
                    value: data.pH,
                    message: `pH is outside normal range (${settings.pHMin} - ${settings.pHMax})`
                });
            }

            if (data.turbidity > settings.turbidityMax) {

                alerts.push({
                    parameter: "Turbidity",
                    value: data.turbidity,
                    message: `Turbidity exceeds ${settings.turbidityMax} NTU`
                });
            }

            if (data.temperature < settings.temperatureMin ||
                data.temperature > settings.temperatureMax) {

                alerts.push({
                    parameter: "Temperature",
                    value: data.temperature,
                    message: `Temperature is outside normal range (${settings.temperatureMin} - ${settings.temperatureMax} °C)`
                });
            }

            if (data.waterLevel < settings.waterLevelMin ||
                data.waterLevel > settings.waterLevelMax) {

                alerts.push({
                    parameter: "Water Level",
                    value: data.waterLevel,
                    message: `Water level is outside normal range (${settings.waterLevelMin} - ${settings.waterLevelMax}%)`
                });
            }

            if (data.flowRate < settings.flowRateMin ||
                data.flowRate > settings.flowRateMax) {

                alerts.push({
                    parameter: "Flow Rate",
                    value: data.flowRate,
                    message: `Flow rate is outside normal range (${settings.flowRateMin} - ${settings.flowRateMax})`
                });
            }

            if (alerts.length > 0) {

                await Alert.insertMany(alerts);

                console.log("🚨 Alert generated:", alerts);
            }

        } catch (error) {

            console.error(
                "Sensor simulation error:",
                error.message
            );
        }

    }, 10000);
}

module.exports = startSensorSimulator;