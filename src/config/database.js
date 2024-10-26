const mongoose = require("mongoose");

const dbState = [
  {
    value: 0,
    label: "Disconnected",
  },
  {
    value: 1,
    label: "Connected",
  },
  {
    value: 2,
    label: "Connecting",
  },
  {
    value: 3,
    label: "Disconnecting",
  },
];

const connectionDatabase = async () => {
  try {
    const db_uri = "mongodb+srv://btl-mmt.m4gxf.mongodb.net/?retryWrites=true&w=majority&appName=btl-mmt";
    const db_name = "btl-mmt";
    const db_user = "phihung0131";
    const db_pass = "Phihung311.";

    await mongoose.connect(db_uri, {
      dbName: db_name,
      user: db_user,
      pass: db_pass,
    });
    const state = Number(mongoose.connection.readyState);
    console.log(dbState.find((f) => f.value == state).label, "to databse."); // connected to db
  } catch (error) {
    console.log(">>>Error connecting to database: ", error);
  }
};

module.exports = {
  connectionDatabase,
};
