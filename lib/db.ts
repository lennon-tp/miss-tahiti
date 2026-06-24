import mysql from 'mysql2/promise';

// Pool de connexions MySQL partagé pour toute l'application.
// Les variables d'environnement sont définies dans .env et injectées par Docker.
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME     || 'miss_tahiti',
  user:     process.env.DB_USER     || 'miss_tahiti_user',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+00:00',
});

export default pool;
