const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

// module.exports.getCities = () => {
//     return db.query("SELECT * FROM cities");
// };

module.exports.addFirstLast = (first, last) => {
    return db.query(
        `INSERT INTO (first, last) 
        VALUES ($1, $2)`, //one for each argument, an actual string, not a command
        [first, last] //also necessary
    );
};
