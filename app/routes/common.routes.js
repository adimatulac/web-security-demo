module.exports = (app) => {
  const authentication = require("../controllers/authentication.controller.js");
  const common = require("../controllers/common.controller.js");

  app.get("/", authentication.isAuthenticated, common.fetchAll);

  app.post("/comments", common.postComment);

  app.get("/create", (req, res) => {
    return res.render("create");
  });

  app.get("/login", (req, res) => {
    // check if there is a msg query
    let bad_auth = req.query.msg ? true : false;

    // if there exists, send the error.
    if (bad_auth) {
      return res.render("login", {
        error: "Invalid username or password. Please try again.",
      });
    } else {
      // else just render the login
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
    // clear the cookie + session, redirect to login
    req.session.user = null;
    req.session.save((err) => {
      if (err) next(err);

      req.session.regenerate((err) => {
        if (err) next(err);
        return res.redirect("/login");
      });
    });
  });

  app.get("/:username/steal-ur-money", (req, res) => {
    return res.render("phishing-form", {
      username: req.params.username,
      amount: req.query.amount,
    });
  });
};
