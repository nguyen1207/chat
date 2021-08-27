const db = require("../db/dbconfig.js");

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

module.exports = { insertPerson, findPerson };
