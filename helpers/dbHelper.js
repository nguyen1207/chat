const crypto = require("crypto");
const db = require("../db/dbconfig.js");
const ROOM_ID_LENGTH = 12;

function insertPerson(username, password) {
    return db.query({
        text: "INSERT INTO person VALUES($1, $2) RETURNING *",
        values: [username, password],
    });
}

function findPerson(username) {
    return db.query({
        text: "SELECT * FROM person WHERE username = $1",
        values: [username],
    });
}

async function createRoom(roomName) {
    try {
        let isRoomIdExisted;
        let roomId;
    
        do {
            roomId = crypto.randomBytes(20).toString("hex").substring(0, ROOM_ID_LENGTH);
            isRoomIdExisted = await findRoom(roomId);
    
        }
        while(isRoomIdExisted);
        
        const data = await db.query({
            text: "INSERT INTO room VALUES ($1, $2) RETURNING *",
            values: [roomId, roomName],
        });
    
        const room = data.rows[0];
        return room;
    }
    catch(err) {
        throw err;
    }
}

async function findRoom(roomId) {
    try {
        const data = await db.query({
            text: "SELECT * FROM room WHERE roomid = $1",
            values: [roomId],
        });
        
        const room = data.rows[0];
        return room;
    }
    catch (err) {
        throw err;
    }
}

async function joinRoom(username, roomId, isCreatingRoom = false) {
    try {
        // Don't need to check for roomId when create room
        if(isCreatingRoom) {
            const data = await db.query({
                text: "INSERT INTO in_room VALUES ($1, $2) RETURNING *",
                values: [username, roomId],
            })
            
            return data.rows[0];
        }
        
        // Check room existence
        const isExisted = await findRoom(roomId);
        if(isExisted) {
            // Check if user has already joined the room
            const isJoined = await isJoinedRoom(username, roomId);

            if(!isJoined) {
                const data = await db.query({
                    text: "INSERT INTO in_room VALUES ($1, $2) RETURNING *",
                    values: [username, roomId],
                })
                
                return data.rows[0];
            }

            const error = new Error("You have joined this room");
            error.status = 400;
            throw error;
        }

        const error = new Error("Not found room");
        error.status = 400;
        throw error;
    }
    catch (err) {
        throw err;
    }
}

function getJoinedRoom(username) {
    return db.query({
        text: "SELECT * FROM room WHERE roomid IN (SELECT roomid FROM in_room WHERE username = $1) ORDER BY room_name",
        values: [username],
    })
}

async function isJoinedRoom(username, roomId) {
    const data = await db.query({
        text: "SELECT * FROM in_room WHERE username = $1 AND roomid = $2",
        values: [username, roomId],
    })

    return data.rows.length != 0 ? true : false;
}

function leaveRoom(username, roomId) {
    return db.query({
        text: "DELETE FROM in_room WHERE username = $1 AND roomid = $2",
        values: [username, roomId],
    })
}

function deleteEmptyRoom() {
    return db.query({
        text: "DELETE FROM room WHERE roomid NOT IN ( SELECT roomid FROM in_room )",
    })
}

function loadOldMessages(roomId) {
    return db.query({
        text: "SELECT username, content, sent_at FROM message WHERE roomid = $1 ORDER BY sent_at",
        values: [roomId],
    })
}

function storeMessage(username, roomId, content) {
    return db.query({
        text: "INSERT INTO message VALUES ($1, $2, $3) RETURNING *",
        values: [username, roomId, content],
    })
}

function loadRoomMembers(roomId) {
    return db.query({
        text: "SELECT in_room.username, person.online_status FROM in_room INNER JOIN person ON in_room.username = person.username WHERE in_room.roomid = $1",
        values: [roomId],
    })
}

function setOnlineStatus(username, onlineStatus) {
    return db.query({
        text: "UPDATE person SET online_status = $1 WHERE username = $2",
        values: [onlineStatus, username],
    })
}

module.exports = { 
    insertPerson, 
    findPerson, 
    createRoom, joinRoom, 
    getJoinedRoom, 
    findRoom, 
    isJoinedRoom,
    leaveRoom, 
    deleteEmptyRoom, 
    loadOldMessages, 
    storeMessage,
    loadRoomMembers,
    setOnlineStatus,
};
