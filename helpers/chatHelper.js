const { loadOldMessages, storeMessage } = require("./dbHelper.js");
const { encryptMessage, decryptMessage } = require("../utils/encryptMessage.js");

module.exports = (io) => {
    function userJoin(data) {
        this.roomId = data.roomid;
        this.username = data.username;
        this.join(this.roomId);

        loadOldMessages(this.roomId)
            .then((res) => {
                const messageObjs = res.rows;

                if (messageObjs) {
                    messageObjs.forEach((messageObj) => {
                        const encryptedMessage = messageObj.content;
                        messageObj.content = decryptMessage(encryptedMessage);
                    });

                    io.to(this.id).emit("join", messageObjs);
                }
            })
            .catch((err) => {
                io.to(this.id).emit(
                    "load old messages error",
                    "Cannot load messages. Try refreshing the page."
                );
                throw err;
            });
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
                    sent_at: messageObj.sent_at,
                });
            })
            .catch((err) => {
                io.to(this.id).emit(
                    "send message error",
                    "This message cannot be sent. Try again."
                );
                throw err;
            });
    }

    return {
        userJoin,
        sendMessage,
    };
};
