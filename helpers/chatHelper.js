const { storeMessage } = require("./dbHelper.js");
const { encryptMessage } = require("../utils/encryptMessage.js");
const formatTime = require("../utils/formatTime.js");

module.exports = (io) => {
    function userJoin(data) {
        this.roomId = data.roomid;
        this.username = data.username;
        this.join(this.roomId);
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
        userJoin,
        sendMessage,
    };
};
