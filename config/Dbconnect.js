const mongoose = require("mongoose");

const dbconnect = () => {
  mongoose
    .connect(process.env.DB_URL)
    .then(() => {
      console.log("DB is connected");
    })
    .catch((err) => console.log(err.message));
};

module.exports = dbconnect;
