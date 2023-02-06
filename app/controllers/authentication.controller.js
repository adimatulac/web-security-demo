const User = require("../models/user.model");

exports.isAuthenticated = (req, res, next) => {
  if (req.cookies && req.session.user) next();
  else res.redirect("/login");
};

exports.authenticate = (req, res, next) => {
  const { username, accessCode } = req.body;
  if (!username || !accessCode) {
    return res.redirect("/login?msg=fail");
  }

  User.findOne({ username, accessCode })
    .then((user) => {
      if (
        !!user &&
        username === user.username &&
        accessCode === user.accessCode
      ) {
        // saving the data to the cookies + session
        req.session.regenerate((err) => {
          if (err) next(err);
          req.session.user = user;
          req.session.save((err) => {
            if (err) return next(err);
            return res.redirect("/");
          });
        });
        // redirect
      } else {
        // redirect with a fail msg
        return res.redirect("/login?msg=fail");
      }
    })
    .catch((err) => {
      console.log(err);
      return res.redirect("/login?msg=fail");
    });
};
