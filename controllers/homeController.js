module.exports = {
    home: function (req, res, next) {
        res.render("home.ejs", { title: "Chatdee" });
    },
};
