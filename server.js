const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const dbConfig = require("./config/database.config.js");

// create express app
const port = process.env.PORT || 3000;
const app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse requests of content-type - application/json
app.use(bodyParser.json());

const store = new MongoDBStore({
  uri: `mongodb+srv://${dbConfig.username}:${dbConfig.password}@${dbConfig.cluster}.mongodb.net/${dbConfig.name}?retryWrites=true&w=majority`,
  collection: "sessions",
});

store.on("error", (error) => {
  console.log(error);
});

// set session
const oneDay = 1000 * 60 * 60 * 24;
app.use(
  session({
    secret: "secretkey",
    cookie: { maxAge: oneDay, httpOnly: false },
    store: store,
    resave: false,
    saveUninitialized: true,
    httpOnly: false,
  })
);

// parse cookies
app.use(cookieParser());

// rendering
app.use(express.static(path.join(__dirname, "/public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/app/views/pages"));

// db config
mongoose.Promise = global.Promise;

mongoose.connect(
  `mongodb+srv://${dbConfig.username}:${dbConfig.password}@${dbConfig.cluster}.mongodb.net/${dbConfig.name}?retryWrites=true&w=majority`
);

const db = mongoose.connection;
db.once("open", (_) => {
  console.log("Database connected: ", dbConfig.url);
});

db.on("error", (err) => {
  console.error("Connection error: ", dbConfig.url);
});

require("./app/routes/common.routes.js")(app);
require("./app/routes/user.routes.js")(app);
require("./app/routes/authentication.routes.js")(app);

app.listen(3000, () => {
  console.log("Server is listening on port " + port);
});
