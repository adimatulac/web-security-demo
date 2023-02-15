module.exports = (app) => {
  const message = require("../controllers/message.controller.js");

  app.post("/messages", message.postMessage);
};
