import { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
const socket = socketIOClient(process.env.REACT_APP_API_URL);

function useServer() {
    const [postos, setPostos] = useState([]);
    const [combustiveis, setCombustiveis] = useState([]);
    const [precos, setPrecos] = useState([]);

    useEffect(() => {
        socket.on("posto retorno", (data) => {
            setPostos(data);
        });
        socket.on("combustivel retorno", (data) => {
            setCombustiveis(data);
        });
        socket.on("preco retorno", (data) => {
            setPrecos(data);
        });
    });

    return { postos, combustiveis, precos };
}

function getUpdatesFromServer() {
    socket.emit("get posto");
    socket.emit("get combustivel");
    socket.emit("get preco");
}

function addPosto(posto) {
    socket.emit("add posto", posto);
}

function addCombustivel(combustivel) {
    socket.emit("add combustivel", combustivel);
}

function addPreco(preco) {
    socket.emit("add preco", preco);
}

export { useServer, getUpdatesFromServer, addPosto, addCombustivel, addPreco };