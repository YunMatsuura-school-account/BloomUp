console.log("Server is running");
const express = require("express");
const app = express();
require("dotenv").config();

const PORT = process.env.PORT || 8888; // Form env file

app.listen(PORT, () => {
  // logger.info(`Server is running on port ${env.PORT}`);
  console.log(`Server is running  ${PORT}`);
});
