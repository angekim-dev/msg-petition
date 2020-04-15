const bcrypt = require("bcryptjs");
const { promisify } = require("util");
let { genSalt, hash, compare } = bcrypt;

genSalt = promisify(genSalt); //generates our salt -> a random string
hash = promisify(hash); //takes 2 arguments, a plain text password and a salt
compare = promisify(compare); //takes 2 arguments, a plain text and a hash compare value

module.exports.compare = compare;
module.exports.hash = (plainTxtPw) =>
    genSalt().then((salt) => hash(plainTxtPw, salt));

//////// EXAMPLE FROM IN CLASS ///////
// genSalt()
//     .then((salt) => {
//         // console.log(salt);
//         return hash("superSafePassword", salt);
//     })
//     .then((hashedPassword) => {
//         console.log("hashed and salted PW: ", hashedPassword); //returns properly hashed PW
//         return compare("superSafePassword", hashedPassword);
//     })
//     .then((matchValueOfCompare) => {
//         console.log("matchValueOfCompare: ", matchValueOfCompare);
//     });
