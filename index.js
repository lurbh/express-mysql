const express = require('express');
const hbs = require('hbs');
const waxOn = require('wax-on');
const {createConnection} = require('mysql2/promise');
require('dotenv').config();

let app = express();

app.set('view engine', 'hbs');
app.use(express.static('public'));
app.use(express.urlencoded({extended:false}));

waxOn.on(hbs.handlebars);
waxOn.setLayoutPath('./views/layouts');

let connection;

async function main() {
    connection = await createConnection({
        'host': process.env.DB_HOST,
        'user': process.env.DB_USER,
        'database': process.env.DB_NAME,
        'password': process.env.DB_PASSWORD
    })

    app.get('/', (req,res) => {
        res.send('Hello, World!');
    });

    app.get('/customers', async (req,res) => {
        let [customers] = await connection.execute('SELECT * FROM Customers INNER JOIN Companies ON Customers.company_id = Companies.company_id');
        res.render('customers', {
            'customers': customers
        })
    });
}

main(); 

app.listen(3000, ()=>{
    console.log('Server is running')
});
