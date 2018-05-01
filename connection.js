var env = process.env.NODE_ENV = process.env.NODE_ENV || 'dev'
var con=''
if(env==='dev') {
    con ='mongodb://localhost:27017/orvtia_db'
}
else
{
    con='mongodb://orvta:orvtate@m@ds147589.mlab.com:47589/orvta_db';
}
console.log(con);
exports.connectionString= con;
