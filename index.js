require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

const expressLayouts = require("express-ejs-layouts");
const db = require("./db/dbconfig.js");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const route = require("./routes");

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use(
    session({
        store: new pgSession({
            pool: db,
        }),
        secret: process.env.SECRET,
        saveUninitialized: false,
        resave: false,
        secure: isProduction,
        cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
    })
);

db.connect();

app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");
app.use(express.static("public"));

route(app);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
