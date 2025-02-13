import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const SIZE = 4; // Tabuleiro 4x4
const WIN_CONDITION = 4; // Precisamos de 4 em linha para ganhar

const createBoard = () => Array(SIZE * SIZE).fill(null);

const checkWinner = (board) => {
  const checkLine = (indices) => {
    const values = indices.map((i) => board[i]);
    return values.every((v) => v && v === values[0]) ? values[0] : null;
  };

  let lines = [];
  for (let i = 0; i < SIZE; i++) {
    lines.push([...Array(SIZE).keys()].map((j) => i * SIZE + j)); // Linhas
    lines.push([...Array(SIZE).keys()].map((j) => j * SIZE + i)); // Colunas
  }
  lines.push([...Array(SIZE).keys()].map((i) => i * (SIZE + 1))); // Diagonal \
  lines.push([3, 6, 9, 12]); // Correção na diagonal /

  for (let line of lines) {
    const winner = checkLine(line);
    if (winner) return winner;
  }
  return board.includes(null) ? null : "Empate";
};

const fetchGameState = async () => {
  const response = await fetch("http://localhost:3000/game");
  return response.json();
};

const updateGameState = async (gameState) => {
  await fetch("http://localhost:3000/game", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(gameState),
  });
};

export default function CustomTicTacToe() {
  const [board, setBoard] = useState(createBoard());
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ X: 0, O: 0 });

  useEffect(() => {
    fetchGameState().then(({ board, currentPlayer, scores }) => {
      setBoard(board);
      setCurrentPlayer(currentPlayer);
      setScores(scores);
    });
  }, []);

  const handleClick = async (index) => {
    if (board[index] || winner) return;

    const newBoard = board.slice();
    newBoard[index] = currentPlayer;

    const newWinner = checkWinner(newBoard);
    let updatedScores = { ...scores };

    if (newWinner && newWinner !== "Empate") {
      updatedScores[newWinner] += 1;
    }

    setBoard(newBoard);
    setWinner(newWinner);
    setScores(updatedScores);
    setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"));

    await updateGameState({
      board: newBoard,
      currentPlayer: newWinner ? "X" : currentPlayer === "X" ? "O" : "X",
      scores: updatedScores,
    });
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
      <div className="mt-4 text-lg">
        <p>Placar:</p>
        <p>X: {scores.X} | O: {scores.O}</p>
      </div>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
        onClick={async () => {
          const newGameState = { board: createBoard(), currentPlayer: "X", scores };
          setBoard(newGameState.board);
          setWinner(null);
          setCurrentPlayer("X");
          await updateGameState(newGameState);
        }}
      >
        Reiniciar Jogo
      </button>
    </div>
  );
}
