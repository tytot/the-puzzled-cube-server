const express = require('express')
const app = express()
const port = 42069

app.use(express.json())

const sqlite3 = require('sqlite3')
const db = new sqlite3.Database('sqlite.db', (err) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log('Connected to sqlite database.')
    db.run(
        'CREATE TABLE IF NOT EXISTS leaderboard (name TEXT NOT NULL, time INTEGER NOT NULL CHECK (time > 0));',
        (err) => {
            if (err) {
                console.error(err)
                process.exit(1)
            }
            console.log('Leaderboard table created.')
        }
    )
})

app.get('/', (req, res) => {
    res.send('regard')
})

app.get('/leaderboard', (req, res) => {
    db.all('SELECT * FROM leaderboard ORDER BY time', (err, rows) => {
        if (err) {
            console.error(err)
            process.exit(1)
        }
        res.send(rows)
    })
})

app.post('/leaderboard', (req, res) => {
    if (!req.body.hasOwnProperty('name') || !req.body.hasOwnProperty('time')) {
        res.status(400).send('Invalid request.')
    } else {
        db.run('INSERT INTO leaderboard (name, time) VALUES (?, ?)', [req.body.name, req.body.time], (err) => {
            if (err) {
                console.error(err)
                process.exit(1)
            }
            res.send('Success.')
        })
    }
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}.`)
})

process.on('SIGINT', () => {
    console.log('Exiting...')
    db.close()
    process.exit(0)
})
