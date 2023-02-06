module.exports = (app) => {
  const authentication = require("../controllers/authentication.controller.js");

  app.post("/authenticate", authentication.authenticate);
};
