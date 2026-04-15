import 'dotenv/config'
import express from 'express';
import mysql from 'mysql2/promise';


const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using the POST method
app.use(express.urlencoded({ extended: true }));
//setting up database connection pool, replace values in red
const pool = mysql.createPool({
    host: "arfo8ynm6olw6vpn.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: process.env.DB_USERNAME,
    password: process.env.DB_PWD,
    database: "xi8aev2hino9toss",
    connectionLimit: 10,
    waitForConnections: true
});


//routes
app.get('/', async (req, res) => {
    let sql1 = `SELECT authorId, firstName, lastName
               From authors
               ORDER BY lastName`;

    let sql2 = `SELECT DISTINCT category
                FROM quotes
                ORDER BY category`
    const [authors] = await pool.query(sql1);
    const [categories] = await pool.query(sql2);
    res.render('home.ejs', { authors, categories })
});

app.get('/newQuote', async (req, res) => {
    res.render('newQuote.ejs')
});

app.get('/authors', async (req, res) => {
    let sql = `SELECT authorId, firstName, lastName 
               FROM authors
               ORDER BY lastName`
    const[authors] = await pool.query(sql);
    res.render('authors.ejs', {authors})
});

app.get('/updateAuthor', async (req, res) => {
    let authorId = req.query.authorId;
    let sql = `SELECT *, DATE_FORMAT(dob, '%Y-%m-%d') ISOdob, DATE_FORMAT(dod, '%Y-%m-%d') ISOdod
               FROM authors
               WHERE authorId = ?`
    const[authorInfo] = await pool.query(sql, authorId);
    res.render('updateAuthor.ejs', {authorInfo})
});

app.post('/updateAuthor', async (req, res) => {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let dob = req.body.dob;
    let dod = req.body.dod;
    let authorId = req.body.authorId;
    let sql = `UPDATE authors
               SET 
               firstName = ?,
               lastName = ?,
               dob = ?,
               dod = ?
               WHERE authorId = ?`
    let sqlParams = [firstName, lastName, dob, dod, authorId]
    const[authorInfoUpdate] = await pool.query(sql, sqlParams)
    res.redirect('/authors');
});

app.get('/quotes', async (req, res) => {
    res.render('quotes.ejs')
});

app.post('/newQuote', async (req, res) => {
    let quote = req.body.quote;
    let authorId = req.body.authorId;

    const params = [quote, authorId]
    let sql = `INSERT INTO quotes (quote, authorId) VALUES (?, ?)`;
    const [newQuote] = await pool.query(sql, params);
    res.redirect('/');
});

app.post('/addAuthor', async (req, res) => {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let dob = req.body.dob;
    let dod = req.body.dod;
    let sex = req.body.sex;
    let profession = req.body.profession;
    let country = req.body.country;
    let portrait = req.body.portrait;
    let biography = req.body.biography;

    const params = [firstName, lastName, dob, dod, sex, profession, country, portrait, biography]
    let sql = `INSERT INTO authors (firstName, lastName, dob, dod, sex, profession, country, portrait, biography) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [newAuthor] = await pool.query(sql, params);
    res.redirect('/');
});



//API to get author info based on author Id
app.get('/api/author/:authorId', async (req, res) => {
    let authorId = req.params.authorId;
    let sql = `SELECT *
               From authors
               WHERE authorId = ?`;
    const [authorInfo] = await pool.query(sql, [authorId]);
    res.send(authorInfo)
});

//searching through quotes by a certain keyword given by the user
//make sure to prevent sql injection by never using the user statement
//make sure to sanatize the statements beofre you use them
app.get("/searchByKeyWord", async (req, res) => {
    try {
        // console.log(req)
        let keyword = req.query.keyword;
        let sql = `SELECT q.quote, a.firstName, a.lastName, a.authorId
                   FROM quotes q
                   NATURAL JOIN authors a
                   WHERE quote LIKE ? `;

        let sqlParams = [`%${keyword}%`];

        const [rows] = await pool.query(sql, sqlParams);
        res.render("quotes.ejs", { rows });

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});

app.get("/searchByAuthor", async (req, res) => {
    try {
        // console.log(req)
        let authorId = req.query.authorId;
        let sql = `SELECT q.quote, a.firstName, a.lastName 
                   FROM quotes q
                   NATURAL JOIN authors a
                   WHERE quote LIKE ? `;

        const [rows] = await pool.query(sql);
        res.render("quotes.ejs", { rows });

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});

app.get("/searchByCategory", async (req, res) => {
    try {
        // console.log(req)
        let authorId = req.query.authorId;
        let sql = `SELECT q.quote, a.firstName, a.lastName 
                   FROM quotes q
                   NATURAL JOIN authors a
                   WHERE quote LIKE ? `;

        const [rows] = await pool.query(sql);
        res.render("quotes.ejs", { rows });

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});

//this is where the app is going to be running 
app.listen(3000, () => {
    console.log("Express server running")
})