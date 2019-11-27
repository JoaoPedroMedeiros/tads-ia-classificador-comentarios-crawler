const { Pool } = require('pg')

const insert = async ({ uri, evaluation, description }) => {
    const pool = new Pool({
        host: 'localhost',
        database: 'postgres',
        user: 'postgres',
        password: '123',
        port: 15432,
    })

    await pool.query(`INSERT INTO comments (uri, evaluation, description, created_at)\n
VALUES ('${uri}', ${evaluation}, '${description}', '${new Date().toISOString()}')`)
}

module.exports = {
    insert,
}