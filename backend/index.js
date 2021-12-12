require('dotenv').config()

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});
const db = require('./db/db');


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/app/index.html');
});

io.on('connection', (socket) => {
    console.log('Usuário conectado!');

    // Posto
    socket.on('add posto', (msg) => {
        console.log(msg);
        let posto_nome = msg.nome;
        let posto_lat = msg.lat;
        let posto_long = msg.long;

        const sqlInsert = "INSERT INTO posto (nome, latitude, longitude) VALUES (?, ?, ?);";

        db.query(sqlInsert, [posto_nome, posto_lat, posto_long], (err, result) => {
            if (err) throw err;
            console.log("Posto adicionado");
        });
    });

    socket.on('get posto', () => {
        const sqlSelect = "SELECT * FROM posto;";

        db.query(sqlSelect, (err, result) => {
            console.log(result);

            io.emit('posto retorno', result);

            if (err) throw err;
            console.log("Busca retornada com sucesso");
        });
    });

    socket.on('delete posto', (id) => {
        const sqlDelete = "DELETE FROM posto WHERE id = ?;";

        db.query(sqlDelete, [id], (err, result) => {
            console.log(result);

            io.emit('posto delete retorno', result);

            if (err) throw err;
            console.log("Removido!");
        });
    });

    // Combustível
    socket.on('add combustivel', (msg) => {
        console.log('message: ' + msg);

        const sqlInsert = "INSERT INTO tipo_combustivel (nome) VALUES (?);";

        db.query(sqlInsert, [msg], (err, result) => {
            if (err) throw err;
            console.log("Combustível adicionado");
        });
    });

    socket.on('get combustivel', () => {
        const sqlInsert = "SELECT * FROM tipo_combustivel;";

        db.query(sqlInsert, (err, result) => {
            console.log(result);

            io.emit('combustivel retorno', result);

            if (err) throw err;
            console.log("Busca retornada com sucesso");
        });
    });

    socket.on('delete combustivel', (id) => {
        const sqlDelete = "DELETE FROM tipo_combustivel WHERE id = ?;";

        db.query(sqlDelete, [id], (err, result) => {
            console.log(result);

            io.emit('combustivel delete retorno', result);

            if (err) throw err;
            console.log("Removido!");
        });
    });

    // Preço
    socket.on('add preco', (msg) => {
        console.log(msg);
        let idPosto = msg.posto;
        let idTipo = msg.tipoComb;
        let data = msg.data;
        let preco = msg.preco;

        const sqlInsert = "INSERT INTO preco (idPosto, idTipo, data, preco) VALUES (?, ?, ?, ?);";

        db.query(sqlInsert, [idPosto, idTipo, data, preco], (err, result) => {
            if (err) throw err;
            console.log("Preço adicionado");
        });
    });

    socket.on('get preco', () => {
        const sqlSelect = "SELECT * FROM preco;";

        db.query(sqlSelect, (err, result) => {
            console.log(result);

            io.emit('preco retorno', result);

            if (err) throw err;
            console.log("Busca retornada com sucesso");
        });
    });

    socket.on('delete preco', (id) => {
        const sqlDelete = "DELETE FROM preco WHERE id = ?;";

        db.query(sqlDelete, [id], (err, result) => {
            console.log(result);

            io.emit('preco delete retorno', result);

            if (err) throw err;
            console.log("Removido!");
        });
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectado...');
    });
});

server.listen(process.env.SERVER_PORT, () => {
    console.log('listening on port:', process.env.SERVER_PORT);
});