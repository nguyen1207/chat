const logoutBtn = document.querySelector("#submit");

const submitJoinRoomFormBtn = document.querySelector("#submit-join-room-form");
const joinRoomForm = document.querySelector("#join-room-form");
const joinRoomErrorElement = document.querySelector("#join-error");

const openCreateRoomFormBtn = document.querySelector("#open-create-room-form");
const submitCreateRoomFormBtn = document.querySelector(
    "#submit-create-room-form"
);
const createRoomForm = document.querySelector("#create-room-form");
const createRoomErrorElement = document.querySelector("#create-error");

// JOIN ROOM
joinRoomForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const roomId = document.querySelector("#roomId").value.trim();
    disableButtons(true);

    if (!roomId) {
        joinRoomErrorElement.textContent = "Please enter room id";
        disableButtons(false);
        return;
    }

    try {
        const response = await fetch("/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId }),
        });

        const data = await response.json();

        if (data.error) {
            joinRoomErrorElement.textContent = data.error;
            disableButtons(false);
        } else {
            location.assign(`/${data.roomid}`);
        }
    } catch (err) {
        console.log(err);
    }
});

// CREATE ROOM
openCreateRoomFormBtn.onclick = function () {
    openCreateRoomFormBtn.hidden = true;
    createRoomForm.hidden = false;
};
createRoomForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const roomName = document.querySelector("#roomName").value.trim();
    disableButtons(true);

    if (!roomName) {
        createRoomErrorElement.textContent = "Please enter room name";
        disableButtons(false);
        return;
    }

    this.submit();
});

function disableButtons(isDisabled) {
    submitJoinRoomFormBtn.disabled = isDisabled;
    openCreateRoomFormBtn.disabled = isDisabled;
    submitCreateRoomFormBtn.disabled = isDisabled;
    logoutBtn.disabled = isDisabled;
}
