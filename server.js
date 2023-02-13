require("dotenv").config();
const env = process.env;
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");

// create express app
const port = env.PORT || 3000;
const app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse requests of content-type - application/json
app.use(bodyParser.json());

let dbUri = "";
if (env.NODE_ENV === "dev") {
  dbUri = `mongodb+srv://${env.DEV_DB_USERNAME}:${env.DEV_DB_PASSWORD}@${env.DEV_DB_CLUSTER}.mongodb.net/general?retryWrites=true&w=majority`;
} else if (env.NODE_ENV === "prod") {
  dbUri = `mongodb+srv://${env.PROD_DB_USERNAME}:${env.PROD_DB_PASSWORD}@${env.PROD_DB_CLUSTER}.mongodb.net/primary?retryWrites=true&w=majority`;
}

const store = new MongoDBStore({
  uri: dbUri,
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

// set views
app.use(express.static(path.join(__dirname, "/public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/app/views/pages"));

// db config
mongoose.Promise = global.Promise;
mongoose.connect(dbUri);

const db = mongoose.connection;
db.once("open", (_) => {
  console.log("database connected");
});

db.on("error", (err) => {
  console.error("connection error: ", err);
});

// set routes
require("./app/routes/common.routes.js")(app);
require("./app/routes/user.routes.js")(app);
require("./app/routes/item.routes.js")(app);
require("./app/routes/authentication.routes.js")(app);

app.listen(3000, () => {
  console.log("server is listening on port " + port);
});
