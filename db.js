const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.addFirstLast = (first, last, signature) => {
    return db.query(
        `INSERT INTO signatures (first, last, signature) 
        VALUES ($1, $2, $3)
        RETURNING (id)`, //one for each argument, an actual string, not a command
        [first, last, signature] //also necessary
    );
};

//SELECT to get first & last of everyone who signed
module.exports.getFirstLast = () => {
    return db.query(`SELECT first, last FROM signatures`);
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
