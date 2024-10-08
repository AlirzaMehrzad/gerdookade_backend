const express = require("express");
const app = express();

app.use("/uploads", express.static("uploads"));

require("./boot");
require("./middlewares")(app);
require("./routes")(app);

module.exports = (port) => {
  app.listen(port, () => {
    console.log(`app is running on port: ${port}`);
  });
};
