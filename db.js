const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/petition"
);

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

module.exports.addProfile = (age, city, url, user_id) => {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4);`,
        [age || null, city, url, user_id]
    );
};

//SELECT to get first & last of everyone who signed
module.exports.getSupportersDetails = () => {
    return db.query(
        `SELECT users.first AS first, users.last AS last, user_profiles.age AS age, user_profiles.city AS city, user_profiles.url AS url FROM users
    LEFT JOIN user_profiles
    ON users.id = user_profiles.user_id
    JOIN signatures
    ON user_profiles.user_id = signatures.user_id;`
    );
};

module.exports.getSupWithEmail = () => {
    return db.query(
        `SELECT users.first AS first, users.last AS last, users.email AS email, user_profiles.age AS age, user_profiles.city AS city, user_profiles.url AS url
        FROM users
        LEFT JOIN user_profiles
        ON users.id = user_profiles.user_id
        WHERE users.id = user_id;`
    );
};

module.exports.getCity = (city) => {
    return db.query(
        `SELECT users.first AS first, users.last AS last, user_profiles.age AS age, user_profiles.city AS city, user_profiles.url AS user_url FROM users
    JOIN user_profiles
    ON users.id = user_profiles.user_id
    JOIN signatures
    ON user_profiles.user_id = signatures.user_id
    WHERE LOWER(user_profiles.city) = LOWER($1);`,
        [city]
    );
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
        .query(`SELECT signature FROM signatures WHERE id=$1;`, [id])
        .then((result) => {
            return result.rows[0].signature;
        });
};

module.exports.getUserInfo = (email) => {
    return db.query(`SELECT * FROM users WHERE email = $1;`, [email]);
};

module.exports.makeChanges = (first, last, email, password, id) => {
    return db.query(
        `UPDATE users SET first = $1, last = $2, email = $3, password = $4 WHERE id = $5;`,
        [first, last, email, password, id]
    );
};

module.exports.makeChangesNoPw = (first, last, email, id) => {
    return db.query(
        `UPDATE users SET first = $1, last = $2, email = $3 WHERE id = $4;`,
        [first, last, email, id]
    );
};

module.exports.checkSignature = (id) => {
    return db.query(`SELECT id FROM signatures WHERE user_id = $1;`, [id]);
};

module.exports.deleteSig = (user_id) => {
    return db.query(
        `DELETE FROM signatures
        WHERE user_id = $1;`,
        [user_id]
    );
};

module.exports.upsertProfile = (age, city, url, user_id) => {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET age = $1, city = $2, url = $3;`,
        [age, city, url, user_id]
    );
};
