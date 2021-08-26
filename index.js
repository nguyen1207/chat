require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

var expressLayouts = require("express-ejs-layouts");
const route = require("./routes");

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);
const db = require("./db/dbconfig.js");
db.connect();

app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");
app.use(express.static("public"));

route(app);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
