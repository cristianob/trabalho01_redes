const mysql = require("mysql");

const connection = mysql.createConnection({
	host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Abre a conexão
connection.connect((error) => {
	if (error) throw error;
	console.log("Successfully connected to the database.");
});

module.exports = connection;