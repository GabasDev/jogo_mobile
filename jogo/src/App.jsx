import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const SIZE = 4; // Tabuleiro 4x4
const createBoard = () => Array(SIZE * SIZE).fill(null);

const API_URL = "https://idddyilmpi.execute-api.us-east-1.amazonaws.com/default/JogoLamdba";

export default function CustomTicTacToe() {
    const [board, setBoard] = useState(createBoard());
    const [currentPlayer, setCurrentPlayer] = useState("X");
    const [winner, setWinner] = useState(null);
    const [partidaId, setPartidaId] = useState(null);

    // Iniciar uma nova partida ao carregar o componente
    useEffect(() => {
        const iniciarPartida = async () => {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: "iniciarPartida" }),
            });
            const data = await response.json();
            setPartidaId(data.id);
            setBoard(data.tabuleiro);
            setCurrentPlayer(data.jogadorAtual);
            setWinner(data.vencedor);
        };

        iniciarPartida();
    }, []);

    // Atualizar o estado do jogo
    const fetchGameState = async () => {
        if (!partidaId) return;

        const response = await fetch(`${API_URL}?id=${partidaId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        setBoard(data.tabuleiro);
        setCurrentPlayer(data.jogadorAtual);
        setWinner(data.vencedor);
    };

    // Registrar uma jogada
    const handleClick = async (index) => {
        if (board[index] || winner) return;

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                action: "jogada",
                id: partidaId,
                posicao: index,
                jogador: currentPlayer,
            }),
        });
        const data = await response.json();
        setBoard(data.tabuleiro);
        setCurrentPlayer(data.jogadorAtual);
        setWinner(data.vencedor);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-4">Jogo da Velha 4x4</h1>
            <div className="grid grid-cols-4 gap-2">
                {board.map((cell, index) => (
                    <motion.div
                        key={index}
                        className="w-16 h-16 flex items-center justify-center border border-gray-400 text-2xl font-bold cursor-pointer bg-gray-700 hover:bg-gray-600"
                        whileTap={{ scale: 0.8 }}
                        onClick={() => handleClick(index)}
                    >
                        {cell}
                    </motion.div>
                ))}
            </div>
            {winner && (
                <div className="mt-4 text-xl font-bold">
                    {winner === "Empate" ? "Deu Empate!" : `Vencedor: ${winner}`}
                </div>
            )}
        </div>
    );
}