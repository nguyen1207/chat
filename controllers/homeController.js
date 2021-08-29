const bcrypt = require("bcrypt");

const {
    insertPerson,
    findPerson,
    createRoom,
    joinRoom,
    getJoinedRoom,
    findRoom,
    leaveRoom,
} = require("../helpers/dbHelper.js");

module.exports = {
    // GET /
    home(req, res, next) {
        const username = req.session.username;
        getJoinedRoom(username).then((data) => {
            const rooms = data.rows;

            res.render("home.ejs", {
                rooms,
                title: "Chatdee",
                username,
            });
        });
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
        const username = req.body.username.trim();
        const password = req.body.password.trim();

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
                return res.status(201).json({ message: "success" });
            })
            .catch((err) => {
                console.log(err);
                if (err.code == "23505") {
                    res.status(400).json({
                        error: "Username has already been taken",
                    });
                }
            });
    },

    // GET /login
    login(req, res, next) {
        res.render("login.ejs", { title: "Log In" });
    },

    // POST /login
    async checkLogin(req, res, next) {
        const username = req.body.username.trim();
        const password = req.body.password.trim();

        if (username.length == 0 || password.length == 0) {
            return res.status(400).json({ error: "Please enter both fields" });
        }

        try {
            const data = await findPerson(username);
            const person = data.rows[0];

            // Validate username
            if (!person) {
                return res
                    .status(400)
                    .json({ error: "Username or password is invalid" });
            }

            // Validate password
            const isMatch = await bcrypt.compare(password, person.password);

            if (!isMatch) {
                return res
                    .status(400)
                    .json({ error: "Username or password is invalid" });
            }

            req.session.username = person.username;
            res.status(200).json({ message: "success" });
        } catch (err) {
            res.status(500).json({ error: "Login error" });
        }
    },

    // POST /logout
    logout(req, res, next) {
        req.session.destroy(function (err) {
            if (err) {
                throw err;
            }
            res.redirect("/login");
        });
    },

    // POST /create
    async create(req, res, next) {
        const username = req.session.username;
        const roomName = req.body.roomName.trim();

        try {
            const room = await createRoom(roomName);
            const data = await joinRoom(username, room.roomid, true);

            res.redirect(`/${room.roomid}`);
        } catch (err) {
            res.status(500).json({ error: "Create room error" });
        }
    },

    // POST /join
    async join(req, res, next) {
        try {
            const username = req.session.username;
            const roomId = req.body.roomId.trim();

            const room = await joinRoom(username, roomId);

            res.json(room);
        } catch (err) {
            console.log(err);
            res.status(400).json({ error: err.message });
        }
    },

    // GET /:roomId
    async room(req, res, next) {
        try {
            const roomId = req.params.roomId;
            const room = await findRoom(roomId);

            if (room) {
                return res.render("room.ejs", {
                    title: "Chatdee",
                    room,
                });
            }

            res.status(404).json({ error: "Not found room" });
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
        }
    },

    // POST /leave
    leave(req, res, next) {
        const username = req.session.username;
        const roomId = req.body.roomId;

        leaveRoom(username, roomId)
            .then(() => {
                return res.redirect("/");
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ error: "Leave room error" });
            });
    },
};
