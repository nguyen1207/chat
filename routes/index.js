const homeRouter = require("./home.js");

module.exports = function (app) {
    app.use("/", homeRouter);
};
