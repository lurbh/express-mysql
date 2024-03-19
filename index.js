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

require('handlebars-helpers')({
    handlebars: hbs.handlebars
})

let connection;

async function main() 
{
    connection = await createConnection({
        'host': process.env.DB_HOST,
        'user': process.env.DB_USER,
        'database': process.env.DB_NAME,
        'password': process.env.DB_PASSWORD
    })

    app.get('/', function(req,res) 
    {
        res.redirect('/customers')
    });

    app.get('/customers', async function (req,res)  
    {
        let [customers] = await connection.execute(`SELECT Customers.*, Companies.name as company_name FROM Customers 
        INNER JOIN Companies ON Customers.company_id = Companies.company_id ORDER BY Customers.first_name;`);
        res.render('customers/index', {
            customers
        })
    });

    app.get('/customers/create', async function (req,res) 
    {
        let [companies] = await connection.execute('SELECT * FROM Companies;');
        res.render('customers/create', {
           companies
        })
    });

    app.post('/customers/create', async function (req,res) 
    {
        const {first_name,last_name,rating,company_id} = req.body;
        let query = `INSERT INTO Customers(first_name,last_name,rating,company_id) 
            VALUES(?,?,?,?);`;
        await connection.execute(query, [first_name, last_name, rating, company_id]);
        res.redirect('/customers');
    });

    app.get('/customers/edit/:customer_id', async function (req,res) 
    {
        const customer_id = req.params.customer_id;
        let query = `SELECT * FROM Customers WHERE customer_id = ?;`;
        let [customer] = await connection.execute(query, [customer_id]);
        let [companies] = await connection.execute('SELECT * FROM Companies;');
        const customerToEdit = customer[0];
        res.render('customers/edit', {
            'customer' : customerToEdit,
            companies
        })
    });

    app.post('/customers/edit/:customer_id', async function (req,res) 
    {
        const customer_id = req.params.customer_id;
        const {first_name,last_name,rating,company_id} = req.body;
        let query = `UPDATE Customers SET 
        first_name = ?,
        last_name = ?,
        rating = ?,
        company_id = ?
        WHERE customer_id = ?;`
        await connection.execute(query,[first_name,last_name,rating,company_id,customer_id]);
        res.redirect("/customers")
    });

    app.get('/customers/delete/:customer_id', async function (req,res) 
    {
        const customer_id = req.params.customer_id;
        let query = `SELECT * FROM Customers WHERE customer_id = ?;`;
        let [customer] = await connection.execute(query,[customer_id]);
        const customerToDelete = customer[0];
        res.render('customers/delete', {
            'customer' : customerToDelete
        })
    });

    app.post('/customers/delete/:customer_id', async function (req,res) 
    {
        const customer_id = req.params.customer_id;

        let query = `DELETE FROM Customers WHERE customer_id = ?;`;
        await connection.execute(query,[customer_id]);
        res.redirect("/customers")
    });
}

main(); 

app.listen(3000, ()=>{
    console.log('Server is running')
});
