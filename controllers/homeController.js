const bcrypt = require("bcrypt");

const { insertPerson } = require("../helpers/dbHelper.js");

module.exports = {
    // GET /
    home(req, res, next) {
        res.render("home.ejs", { title: "Chatdee" });
    },

    // GET /register
    register(req, res, next) {
        res.render("register.ejs", { title: "Register" });
    },

    // POST /register
    async checkRegister(req, res, next) {
        // Minimum eight characters, at least one uppercase letter, one lowercase letter and one number
        const passwordRequirement =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

        const saltRounds = 10;
        const { username, password } = req.body;

        // Validating
        if (!username) {
            return res.status(400).json({ error: "Username cannot be blank" });
        }

        if (username.length > 20) {
            return res
                .status(400)
                .json({ eror: "Username cannot exceed 20 characters" });
        }

        if (!password.match(passwordRequirement)) {
            return res.status(400).json({
                error: "Password must contain at least eight characters, one uppercase letter, one lowercase letter and one number",
            });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        insertPerson(username, hashedPassword)
            .then((dbRes) => {
                console.log(dbRes.rows);
                return res.status(201).json({ message: "success" });
            })
            .catch((err) => {
                console.log(err);
                if (err.code == "23505") {
                    res.status(400).json({
                        error: "Username has already existed",
                    });
                }
            });
    },
};
