var env = process.env.NODE_ENV = process.env.NODE_ENV || 'dev'
var con=''
if(env==='dev') {
    con ='mongodb://localhost:27017/orvtia_db'
}
else
{
    con='mongodb://orvta:orvta@ds031865.mlab.com:31865/orvta_db';
}
console.log(con);
exports.connectionString= con;
