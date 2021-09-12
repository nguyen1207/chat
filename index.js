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
const server = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { userOnline, userOffline, userLeaveRoom, sendMessage } = require("./helpers/chatHelper.js")(io);

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

const onConnection = function (socket) {
    socket.on("online", userOnline);
    socket.on("disconnect", userOffline);
    socket.on("user leave room", userLeaveRoom);
    socket.on("chat message", sendMessage);
}

io.on("connection", onConnection);

server.listen(port, function () {
    console.log("listening on *: " + port);
});
