const Equipment = require("./models/Equipment");
const Alert = require("./models/Alert");

const normalStatuses = {
  Pump: "Running",
  Valve: "Open",
  Filter: "Active",
  Tank: "Active"
};

const abnormalStatuses = {
  Pump: "Stopped",
  Valve: "Closed",
  Filter: "Inactive",
  Tank: "Inactive"
};

const startEquipmentSimulator = () => {
  console.log("Equipment simulator started");

  setInterval(async () => {
    try {
      const equipmentList = await Equipment.find();

      if (equipmentList.length === 0) {
        return;
      }

      // Select one random equipment
      const equipment =
        equipmentList[
          Math.floor(Math.random() * equipmentList.length)
        ];

      // 85% normal, 15% abnormal
      const isNormal = Math.random() < 0.85;

      const newStatus = isNormal
        ? normalStatuses[equipment.type]
        : abnormalStatuses[equipment.type];

      const newCondition = isNormal
        ? "Normal"
        : "Warning";

      equipment.status = newStatus;
      equipment.condition = newCondition;

      await equipment.save();

      console.log(
        `Equipment updated: ${equipment.name} - ${newStatus} - ${newCondition}`
      );

      // Generate alert only for abnormal equipment
      if (!isNormal) {
        await Alert.create({
          parameter: "Equipment",
          value: 0,
          message: `${equipment.name} is ${newStatus}`,
          timestamp: new Date()
        });

        console.log(
          `Equipment alert generated: ${equipment.name} is ${newStatus}`
        );
      }
    } catch (error) {
      console.error(
        "Equipment simulator error:",
        error.message
      );
    }
  }, 10000); // every 10 seconds
};

module.exports = startEquipmentSimulator;