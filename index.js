const express = require("express");
const app = express();
const db = require("./db");

// console.log("db: ", db);

app.use(express.static("./public"));

app.get("/", (req, res) => {
    console.log("get request to / route happened!");
});

app.get("/cities", (req, res) => {
    db.getCities() //returns promise
        .then((results) => {
            //OR {rows}
            console.log("results: ", results.rows); //we only care about rows, that's why .rows OR just rows IF destructuring
        })
        .catch((err) => {
            console.log("err in getCities: ", err);
        });
});

app.post("/add-city", (req, res) => {
    db.addCity("Guayaquil", "Ecuador") //ideally user input coming from the server, not hard-coding like here
        .then(() => {
            console.log("yay that worked!");
        })
        .catch((err) => {
            console.log("err in addCity: ", err);
        });
});

app.listen(8080, () => console.log("petition server is listening!"));
