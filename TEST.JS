const sqlite3 = require('sqlite3').verbose();
const sql = require('sqlite');




var SessionID = '$2a$10$RourL6zQQM7i6q/YGrnWHuODBSVD.h9Ymr.2l71g0sMSIGwYK9upu'


async function ConnectDatabase()
{
    const client =  await sql.open({
        filename: 'PLATFORM.db',
        driver: sqlite3.Database
      })
      var user="admin";
      var t = await client.run("INSERT INTO Users (Name, Password) VALUES (?,?)", [123,333]);
      console.log(t.lastID)
      client.close();
}


ConnectDatabase();

