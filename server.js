//Imports
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

//Middleware
app.use(express.json());
app.use(cors());

//Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

//Test the connection
pool.getConnection((err, connection) => {
    if(err) {
        console.error('Database connection failed:', err.message);
    } else{
        console.log('Successfully connected to MYSQL database!');
        connection.release();
    }
});

//Get: Fetch all expenses
app.get('/api/expenses', (req, res) => {
    const query = 'SELECT * FROM EXPENSES ORDER BY CREATED_AT DESC';
    pool.query(query, (err, results) => {
        if(err){
            return res.status(500).json({ error: err.message});
        }
        res.json(results);
    });
});

//Post: add a new expense
app.post('/api/expenses', (req, res) => {
    const { description, amount, category } = req.body;
    
    if (!description || !amount || !category) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = 'INSERT INTO expenses (description, amount, category) VALUES (?, ?, ?)';
    pool.query(query, [description, amount, category], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ 
            id: results.insertId, 
            description, 
            amount, 
            category 
        });
    });
});

//Delete: remove an expense by ID
app.delete('/api/expenses/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM expenses WHERE id = ?';
    
    pool.query(query, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json({ message: 'Expense deleted successfully', id });
    });
});

//Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});