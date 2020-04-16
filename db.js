const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.addSignature = (signature, user_id) => {
    return db.query(
        `INSERT INTO signatures (signature, user_id) 
        VALUES ($1, $2)
        RETURNING id;`, //one for each argument, an actual string, not a command
        [signature, user_id] //also necessary
    );
};

module.exports.addRegistration = (first, last, email, password) => {
    return db.query(
        `INSERT INTO users (first, last, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [first, last, email, password]
    );
};

//SELECT to get first & last of everyone who signed
module.exports.getFirstLast = () => {
    return db.query(`SELECT first, last FROM users`);
    // .then((results) => {
    //     return results.rows;
    // })
    // .catch((err) => {
    //     console.log("Error in getFirstLast", err);
    // });
};
//SELECT to get total numbers of signers *count* by postgres
module.exports.totalSigners = () => {
    return db.query(`SELECT COUNT(*) FROM signatures`).then((results) => {
        return results.rows[0].count;
    });
    // .catch((err) => {
    //     console.log("Error in totalSigners", err);
    // });
};

module.exports.getSignature = (id) => {
    return db
        .query(`SELECT signature FROM signatures WHERE id = '${id}';`)
        .then((result) => {
            return result.rows[0].signature;
        });
};

module.exports.getUserInfo = (email) => {
    return db.query(`SELECT * FROM users WHERE email = '${email}';`);
};
