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
    const [isLoading, setIsLoading] = useState(false);  // Novo estado para carregamento

    // Função para atualizar o estado do jogo
    const updateGameState = (data) => {
        setBoard(data.tabuleiro);
        setCurrentPlayer(data.jogadorAtual);
        setWinner(data.vencedor);
    };

    // Iniciar uma nova partida ao carregar o componente
    useEffect(() => {
        const iniciarPartida = async () => {
            setIsLoading(true); // Inicia o carregamento
            try {
                // Enviar requisição sem 'id', a API vai gerar um id novo
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ action: "iniciarPartida" }), // Não é necessário enviar o 'id' aqui
                });

                if (!response.ok) throw new Error("Falha ao iniciar a partida.");

                const data = await response.json();
                setPartidaId(data.id); // Recebe o id gerado pela API
                updateGameState(data);
            } catch (error) {
                console.error("Erro ao iniciar partida:", error);
                alert("Erro ao iniciar a partida. Tente novamente.");
            } finally {
                setIsLoading(false); // Finaliza o carregamento
            }
        };

        iniciarPartida();
    }, []);

    // Atualizar o estado do jogo
    const fetchGameState = async () => {
        if (!partidaId) return; // Certifique-se de que o id foi definido

        try {
            const response = await fetch(`${API_URL}?id=${partidaId}`, { // Passa o id na URL
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) throw new Error("Erro ao carregar o estado do jogo.");
            const data = await response.json();
            updateGameState(data);
        } catch (error) {
            console.error("Erro ao carregar estado:", error);
            alert("Erro ao carregar o estado do jogo. Tente novamente.");
        }
    };

    // Registrar uma jogada
    const handleClick = async (index) => {
        if (board[index] || winner || isLoading) return;

        setIsLoading(true); // Inicia o carregamento ao fazer uma jogada

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "jogada",
                    id: partidaId,  // Passa o id aqui
                    posicao: index,
                    jogador: currentPlayer,
                }),
            });

            if (!response.ok) throw new Error("Falha ao registrar a jogada.");

            const data = await response.json();
            updateGameState(data);
        } catch (error) {
            console.error("Erro ao registrar jogada:", error);
            alert("Erro ao registrar a jogada. Tente novamente.");
        } finally {
            setIsLoading(false); // Finaliza o carregamento
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-4">Jogo da Velha 4x4</h1>
            {isLoading ? (
                <div className="text-xl font-bold">Carregando...</div>
            ) : (
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
            )}

            {winner && (
                <div className="mt-4 text-xl font-bold">
                    {winner === "Empate" ? "Deu Empate!" : `Vencedor: ${winner}`}
                </div>
            )}
        </div>
    );
}
