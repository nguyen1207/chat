const { storeMessage } = require("./dbHelper.js");
const { encryptMessage } = require("../utils/encryptMessage.js");
const { setOnlineStatus } = require("./dbHelper.js");
const formatTime = require("../utils/formatTime.js");

module.exports = (io) => {
    async function userOnline(data) {
        this.roomId = data.roomid;
        this.username = data.username;
        this.join(this.roomId);
        await setOnlineStatus(this.username, 1);
        io.to(this.roomId).emit("user online", this.username);
    }

    async function userOffline() {
        console.log("offline")
        await setOnlineStatus(this.username, 0);
        io.to(this.roomId).emit("user offline", this.username);
    }

    async function userLeaveRoom() {
        console.log("leave");
        io.to(this.roomId).emit("user leave room", this.username);
    }

    function sendMessage(data) {
        const message = data.message;
        const encryptedMessage = encryptMessage(message);

        storeMessage(this.username, this.roomId, encryptedMessage)
            .then((res) => {
                const messageObj = res.rows[0];
                io.to(this.roomId).emit("chat message", {
                    username: this.username,
                    content: message,
                    sent_at: formatTime(messageObj.sent_at),
                });
            })
            .catch((err) => {
                io.to(this.id).emit("send message error", {
                    error: "This message cannot be sent. Try again.",
                    message,
                });
                throw err;
            });
    }

    return {
        userOnline,
        userOffline,
        userLeaveRoom,
        sendMessage,
    };
};
