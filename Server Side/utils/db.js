import mysql from 'mysql'

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "0000",
    database: "ems"
})

con.connect(function(err) {
    if(err) {
        console.log("Connection error:", err.message)
    } else {
        console.log("Connected")
    }
})

export default con;

