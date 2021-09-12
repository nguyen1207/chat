const socket = io();

socket.emit("online", { username: myUsername, roomid });

const messagesElement = document.querySelector("#messages");
const sendMessageForm = document.querySelector("#send-message-form");
const messageInput = document.querySelector("#message-input");
const membersElement = document.querySelector(".list-group-flush");
const leaveRoomForm = document.querySelector("#leave");
messagesElement.scrollTop = messagesElement.scrollHeight;

sendMessageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message) {
        socket.emit("chat message", { username: myUsername, message });
        messageInput.value = "";
    }
});

socket.on("user online", function (username) {
    let memberElement = document.querySelector(`.member#${username}`);

    // New member join room
    if (!memberElement) {
        const memberString = `<li class="list-group-item d-flex justify-content-between align-items-center member" id="${username}">
                                    ${username}
                                    <i class="fas fa-circle online-status online"></i>
                                </li>`;
        memberElement = htmlToElement(memberString);
        membersElement.appendChild(memberElement);
    } else {
        const onlineStatusElement =
            memberElement.querySelector(".online-status");
        onlineStatusElement.className += " online";
    }
});

socket.on("user offline", function (username) {
    const memberElement = document.querySelector(`.member#${username}`);

    // When user leave room disconnect event will also be fired
    // memberElement is removed when user leave room
    if (memberElement) {
        const onlineStatusElement =
            memberElement.querySelector(".online-status");
        onlineStatusElement.classList.remove("online");
    }
});

socket.on("user leave room", function (username) {
    const memberElement = document.querySelector(`.member#${username}`);
    memberElement.remove();
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
    const errorMessageElement = createErrorMessageElement(
        data.error,
        data.message
    );
    messagesElement.appendChild(errorMessageElement);

    messagesElement.scrollTop = messagesElement.scrollHeight;
});

leaveRoomForm.addEventListener("submit", function () {
    socket.emit("user leave room", myUsername);
});

function createMessageElement(username, time, content) {
    let messageElement, messageString;

    if (username == myUsername) {
        messageString = `<div class="message d-flex align-items-end flex-column">
                            <div class="message-header">
                                <span class="time">${time}</span>
                                <span class="username">${username}</span>
                            </div>
                            <div class="my-message content text-break">
                                <p>${content}</p>
                            </div>
                        </div>`;
    } else {
        messageString = `<div class="message d-flex align-items-start flex-column">
                            <div class="message-header">
                            <span class="username">${username}</span>
                                <span class="time">${time}</span>
                            </div>
                            <div class="not-my-message content text-break">
                                <p>${content}</p>
                            </div>
                        </div>`;
    }

    messageElement = htmlToElement(messageString);

    return messageElement;
}

function createErrorMessageElement(error, messageContent) {
    const errorMessageElement = createMessageElement(
        myUsername,
        "",
        messageContent
    );
    console.log(errorMessageElement);
    errorMessageElement.querySelector(".time").remove();
    errorMessageElement.querySelector(".username").remove();
    errorMessageElement.className += " error";

    const errorElement = document.createElement("span");
    errorElement.textContent = error;

    errorMessageElement
        .querySelector(".message-header")
        .appendChild(errorElement);

    return errorMessageElement;
}

function htmlToElement(html) {
    var template = document.createElement("template");
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}
