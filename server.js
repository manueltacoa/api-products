const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Middleware para parsear el cuerpo de las solicitudes
app.use(express.json());

// Conectar o crear la base de datos SQLite
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite');
    }
});

// Crear una tabla llamada "products" si no existe
db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL
)`);

// Ruta para obtener todos los productos
app.get('/products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ products: rows });
    });
});

// Ruta para obtener un producto por ID
app.get('/products/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ product: row });
    });
});

// Ruta para crear un nuevo producto
app.post('/products', (req, res) => {
    const { name, price } = req.body;
    db.run('INSERT INTO products (name, price) VALUES (?, ?)', [name, price], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, name, price });
    });
});

// Ruta para actualizar un producto por ID
app.put('/products/:id', (req, res) => {
    const { name, price } = req.body;
    const id = req.params.id;
    db.run('UPDATE products SET name = ?, price = ? WHERE id = ?', [name, price, id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'Producto actualizado' });
    });
});

// Ruta para eliminar un producto por ID
app.delete('/products/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'Producto eliminado' });
    });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`API corriendo en http://localhost:${port}`);
});