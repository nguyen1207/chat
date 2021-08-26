const db = require("../db/dbconfig.js");

function insertPerson(username, password) {
    return db.query({
        text: "INSERT INTO person VALUES($1, $2) RETURNING *",
        values: [username, password],
    });
}

module.exports = { insertPerson };
