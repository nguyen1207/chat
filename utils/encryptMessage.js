const crypto = require("crypto");

const SIXTEEN_BYTES = 16;

function encryptMessage(message) {
    message = message.split("");

    // Hash 16 byte initialization vertor
    const resizedIV = Buffer.allocUnsafe(SIXTEEN_BYTES);
    const iv = crypto.createHash("sha256").update(process.env.IV).digest();
    iv.copy(resizedIV);

    // Hash 16 byte key
    const resizedKey = Buffer.allocUnsafe(SIXTEEN_BYTES);
    const key = crypto.createHash("sha256").update(process.env.KEY).digest();
    key.copy(resizedKey);

    // AES128 algorithm produces 16 byte buffer by taking 16 byte iv and 16 byte key
    const cipher = crypto.createCipheriv("aes128", resizedKey, resizedIV);
    const encryptedMessage = [];

    message.forEach((phrase) => {
        encryptedMessage.push(cipher.update(phrase, "binary", "hex"));
    });

    encryptedMessage.push(cipher.final("hex"));

    return encryptedMessage.join("");
}

function decryptMessage(encryptedMessage) {
    encryptedMessage = encryptedMessage.split();

    // Hash 16 byte initialization vertor
    const resizedIV = Buffer.allocUnsafe(SIXTEEN_BYTES);
    const iv = crypto.createHash("sha256").update(process.env.IV).digest();
    iv.copy(resizedIV);

    // Hash 16 byte key
    const resizedKey = Buffer.allocUnsafe(SIXTEEN_BYTES);
    const key = crypto.createHash("sha256").update(process.env.KEY).digest();
    key.copy(resizedKey);

    const decipher = crypto.createDecipheriv("aes128", resizedKey, resizedIV);
    const message = [];

    encryptedMessage.forEach((phrase) => {
        message.push(decipher.update(phrase, "hex", "binary"));
    });

    message.push(decipher.final("binary"));

    return message.join("");
}

module.exports = { encryptMessage, decryptMessage };
