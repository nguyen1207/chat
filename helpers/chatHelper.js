const { loadOldMessages, storeMessage } = require("./dbHelper.js");

module.exports = (io) => {
    function userJoin(data) {
        this.roomId = data.roomid;
        this.username = data.username;
        this.join(this.roomId);

        // Load old messesges
        loadOldMessages(this.roomId)
            .then((res) => {
                const messages = res.rows;
                if (messages) {
                    io.to(this.id).emit("join", messages);
                }
            })
            .catch((err) => {
                io.to(this.id).emit("load old messages error", "Cannot load messages. Try refreshing the page.");
                throw err;
            });
    }

    function sendMessage(data) {
        storeMessage(this.username, this.roomId, data.message)
            .then((res) => {
                const messageObj = res.rows[0];
                io.to(this.roomId).emit("chat message", messageObj);
            })
            .catch((err) => {
                io.to(this.id).emit("send message error", "This message cannot be sent. Try again.");
                throw err;
            });
    }

    return {
        userJoin,
        sendMessage,
    };
};
