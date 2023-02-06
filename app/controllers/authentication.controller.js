const User = require("../models/user.model");

exports.isAuthenticated = (req, res, next) => {
  if (req.cookies && req.session.user) next();
  else res.redirect("/login");
};

exports.authenticate = (req, res, next) => {
  const { username, accessCode } = req.body;
  if (!username || !accessCode) {
    return res.redirect("/login?error=invalid");
  }

  User.findOne({ username, accessCode })
    .then((user) => {
      if (
        !!user &&
        username === user.username &&
        accessCode === user.accessCode
      ) {
        req.session.regenerate((err) => {
          if (err) next(err);
          req.session.user = user;
          req.session.save((err) => {
            if (err) return next(err);
            return res.redirect("/");
          });
        });
      } else {
        return res.redirect("/login?error=invalid");
      }
    })
    .catch((err) => {
      console.log(err);
      return res.redirect("/login?error=invalid");
    });
};
