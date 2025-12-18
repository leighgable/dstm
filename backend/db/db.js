const mariadb = require('mariadb');

// Create a connection pool using environment variables
const pool = mariadb.createPool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10
});

module.exports = pool;


const mariadb = require('mariadb/callback');

// Certificate Authority (CA)",
var serverCert = [fs.readFileSync(process.env.SKYSQL_CA_PEM, "utf8")];

// Declare async function
function main() {
   let conn;

   try {
      conn = mariadb.createConnection({
         host: "example.skysql.com",
         port: 5009,
         ssl: { ca: serverCert },
         user: "db_user",
         password: "db_user_password",
         database: "test",
      });

      // Use Connection
      // ...
   } catch (err) {
      // Manage Errors
      console.log("SQL error in establishing a connection: ", err);
   } finally {
      // Close Connection
      if (conn) conn.end(err => {if(err){
         console.log("SQL error in closing a connection: ", err);}
      });
   }
}

main();
