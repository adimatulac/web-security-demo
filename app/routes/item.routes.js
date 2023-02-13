module.exports = (app) => {
  const items = require("../controllers/item.controller.js");

  app.post("/items", items.add);
  app.get("/items", items.fetchAll);

  app.get("/items/random", items.fetchRandom)
};
