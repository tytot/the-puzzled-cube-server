const express = require('express')
const cors = require('cors')
const app = express()

app.use(express.json())

const sqlite3 = require('sqlite3')
const db = new sqlite3.Database('sqlite.db', (err) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log('Connected to sqlite database.')
    db.run(
        'CREATE TABLE IF NOT EXISTS leaderboard (name TEXT NOT NULL, time INTEGER NOT NULL CHECK (time > 0), date TEXT NOT NULL);',
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

app.get('/leaderboard', cors(), (req, res) => {
    db.all('SELECT * FROM leaderboard ORDER BY time, date', (err, rows) => {
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
        db.run(
            'INSERT INTO leaderboard (name, time, date) VALUES (?, ?, ?)',
            [req.body.name, req.body.time, new Date().toISOString()],
            (err) => {
                if (err) {
                    console.error(err)
                    process.exit(1)
                }
                res.send('Success.')
            }
        )
    }
})

const listener = app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${listener.address().port}.`)
})

process.on('SIGINT', () => {
    console.log('Exiting...')
    db.close()
    process.exit(0)
})
