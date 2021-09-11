const socket = io();

socket.emit("join", { username: myUsername, roomid });

const messagesElement = document.querySelector("#messages");
const sendMessageForm = document.querySelector("#send-message-form");
const messageInput = document.querySelector("#message-input");
messagesElement.scrollTop = messagesElement.scrollHeight;

sendMessageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message) {
        socket.emit("chat message", { username: myUsername, message });
        messageInput.value = "";
    }
});

socket.on("chat message", function (messageObj) {
    const time = messageObj.sent_at;
    const username = messageObj.username;
    const content = messageObj.content;

    const messageElement = createMessageElement(username, time, content);

    messagesElement.appendChild(messageElement);
    messagesElement.scrollTop = messagesElement.scrollHeight;
});

socket.on("send message error", function (data) {
    const errorMessageElement = createErrorMessageElement(data.error, data.message);
    messagesElement.appendChild(errorMessageElement);

    messagesElement.scrollTop = messagesElement.scrollHeight;
})


function createMessageElement(username, time, content) {
    const messageElement = document.createElement("div");
    const messageHeader = document.createElement("div");
    const userElement = document.createElement("span");
    const timeElement = document.createElement("span");
    const contentElement = document.createElement("div");
    const p = document.createElement("p");

    messageHeader.className = "message-header";
    userElement.className = "username";
    timeElement.className = "time";

    if (username == myUsername) {
        messageHeader.appendChild(timeElement);
        messageHeader.appendChild(userElement);
        messageElement.className = "message d-flex align-items-end flex-column";
        contentElement.className = "my-message content text-break";
    } else {
        messageHeader.appendChild(userElement);
        messageHeader.appendChild(timeElement);
        messageElement.className =
            "message d-flex align-items-start flex-column";
        contentElement.className = "not-my-message content text-break";
    }

    contentElement.appendChild(p);
    messageElement.appendChild(messageHeader);
    messageElement.appendChild(contentElement);

    userElement.textContent = username;
    timeElement.textContent = time;

    p.textContent = content;

    return messageElement;
}

function createErrorMessageElement(error, messageContent) {
    const errorMessageElement = createMessageElement(myUsername, "", messageContent);
    console.log(errorMessageElement);
    errorMessageElement.querySelector(".time").remove()
    errorMessageElement.querySelector(".username").remove()
    errorMessageElement.className += " error";

    const errorElement = document.createElement("span");
    errorElement.textContent = error;

    errorMessageElement.querySelector(".message-header").appendChild(errorElement);

    return errorMessageElement;
}