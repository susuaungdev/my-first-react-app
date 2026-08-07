import mysql from "mysql2/promise";


const db = mysql.createPool({

    host: "localhost",
    user: "root",
    password: "",
    database: "careerflow",
    port: 3307

});


export default db;