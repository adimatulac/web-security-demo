module.exports = (app) => {
  const messages = require("../constants/messages.js");
  const authentication = require("../controllers/authentication.controller.js");
  const common = require("../controllers/common.controller.js");

  app.get("/", authentication.isAuthenticated, common.fetchAll);

  app.post("/messages", common.postMessage);

  app.get("/create", (req, res) => {
    let error = req.query.error;

    if (error) {
      return res.render("create", {
        error: error === 'toolong' ? messages.toolong : messages.invalid,
      });
    } else {
      return res.render("create");
    }
  });

  app.get("/login", (req, res) => {
    let error = req.query.error;

    if (error) {
      return res.render("login", {
        error: messages.invalid,
      });
    } else {
      return res.render("login");
    }
  });

  app.get("/confirm", (req, res) => {
    let username = req.query.username;
    let accessCode = req.query.accessCode;

    return res.render("confirm", {
      username,
      accessCode,
    });
  });

  app.get("/logout", (req, res) => {
    req.session.user = null;
    req.session.save((err) => {
      if (err) next(err);

      req.session.regenerate((err) => {
        if (err) next(err);
        return res.redirect("/login");
      });
    });
  });

  app.get("/:username/steal-ur-stuff", (req, res) => {
    return res.render("phishing-form", {
      username: req.params.username,
      itemId: req.query.itemId,
      quantity: req.query.quantity,
    });
  });
};
