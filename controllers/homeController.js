const bcrypt = require("bcrypt");

const {
    insertPerson,
    findPerson,
    createRoom,
    joinRoom,
    getJoinedRoom,
    findRoom,
    isJoinedRoom,
    leaveRoom,
    deleteEmptyRoom,
    loadOldMessages,
    loadRoomMembers,
} = require("../helpers/dbHelper.js");

const { decryptMessage } = require("../utils/encryptMessage.js");
const formatTime = require("../utils/formatTime.js");
const ApiError = require("../error/ApiError.js");

module.exports = {
    // GET /
    home(req, res, next) {
        const username = req.session.username;
        getJoinedRoom(username)
            .then((data) => {
                const rooms = data.rows;

                res.render("home.ejs", {
                    rooms,
                    title: "Chatdee",
                    username,
                });
            })
            .catch((err) => {
                console.log(err);
                return next(
                    ApiError.internalError(
                        "Cannot load your rooms. Please try again"
                    )
                );
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
            return next(ApiError.badReq("Username cannot be blank"));
        }

        if (username.length > 20) {
            return next(
                ApiError.badReq("Username cannot exceed 20 characters")
            );
        }

        if (!password.match(passwordRequirement)) {
            return next(
                ApiError.badReq(
                    "Password must contain at least eight characters, one uppercase letter, one lowercase letter and one number"
                )
            );
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        insertPerson(username, hashedPassword)
            .then((dbRes) => {
                return res.status(201).json({ message: "success" });
            })
            .catch((err) => {
                console.log(err);
                if (err.code == "23505") {
                    return next(
                        ApiError.badReq("Username has already been taken")
                    );
                } else {
                    return next(
                        ApiError.internalError(
                            "Cannot register now. Please try again"
                        )
                    );
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
            return next(ApiError.badReq("Please enter both fields"));
        }

        try {
            const data = await findPerson(username);
            const person = data.rows[0];

            // Validate username
            if (!person) {
                return next(ApiError.badReq("Username or password is invalid"));
            }

            // Validate password
            const isMatch = await bcrypt.compare(password, person.password);

            if (!isMatch) {
                return next(ApiError.badReq("Username or password is invalid"));
            }

            req.session.username = person.username;
            res.status(200).json({ message: "success" });
        } catch (err) {
            return next(
                ApiError.internalError("Cannot log in now. Please try again")
            );
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
            return next(
                ApiError.internalError("Create room error. Please try again")
            );
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
            if (err.status) {
                return next(ApiError.badReq(err.message));
            }
            return next(
                ApiError.internalError("Create room error. Please try again")
            );
        }
    },

    // GET /:roomId
    async room(req, res, next) {
        try {
            const username = req.session.username;
            const roomId = req.params.roomId;
            const room = await findRoom(roomId);

            if (!room) {
                return next();
            }

            // Fix user did not in room but can view messages in that room
            const isJoined = await isJoinedRoom(username, roomId);
            if(!isJoined) {
                return next();
            }

            const messagesData = await loadOldMessages(roomId);
            const messageObjs = messagesData.rows;

            if (messageObjs) {
                messageObjs.forEach((messageObj) => {
                    const encryptedMessage = messageObj.content;
                    messageObj.content = decryptMessage(encryptedMessage);
                    messageObj.sent_at = formatTime(messageObj.sent_at);
                });
            }

            const membersData = await loadRoomMembers(roomId);
            const members = membersData.rows;

            return res.render("room.ejs", {
                title: "Chatdee",
                room,
                username: req.session.username,
                messageObjs,
                members,
            });
        } catch (err) {
            return next(
                ApiError.internalError(
                    "Cannot connect to this room now. Please try again"
                )
            );
        }
    },

    // POST /leave
    leave(req, res, next) {
        const username = req.session.username;
        const roomId = req.body.roomId;

        leaveRoom(username, roomId)
            .then(() => {
                return deleteEmptyRoom();
            })
            .then(() => {
                return res.redirect("/");
            })
            .catch((err) => {
                console.log(err);
                return next(
                    ApiError.internalError(
                        "Cannot leave room now. Please try again"
                    )
                );
            });
    },
};
