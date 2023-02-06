module.exports = (app) => {
  const users = require("../controllers/user.controller.js");
  const authentication = require("../controllers/authentication.controller.js");

  app.post("/users", users.create);

  // app.get("/users", users.findAll);
  // app.put("/users/:username", users.topUp);

  app.get("/account", users.fetchAccount);

  // for collecting cookies
  app.get("/storage", authentication.isAuthenticated, users.fetchStorage);
  app.get("/:username/storage", users.collectData);
  // app.delete("/:username/storage", users.deleteStorage);

  // for transferring coins
  app.post("/transfer", users.transfer);  
};
