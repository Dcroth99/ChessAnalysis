import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Chessboard from 'chessboardjsx';
import { Chess } from 'chess.js';
import pgnParser from 'pgn-parser';
import axios from 'axios';
import styles from '../styles/Analysis.module.css';

const GameAnalysis = () => {
  const location = useLocation();
  const { pgn } = location.state || {};

  const [chess] = useState(new Chess());
  const [position, setPosition] = useState(chess.fen());
  const [moves, setMoves] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [fen, setFen] = useState(chess.fen());
  const [evaluation, setEvaluation] = useState(null); 
  const [bestMove, setBestMove] = useState(null); 

  useEffect(() => {
    if (pgn) {
      const parsed = pgnParser.parse(pgn)[0];
      const cleanMoves = parsed.moves.map(({ move }) => move).filter(Boolean);
      setMoves(cleanMoves);
      sendFenToBackend(chess.fen());
    }
  }, [pgn]);

  const sendFenToBackend = async (fen) => {
    try {
      console.log("Sending FEN:", fen);  // Debugging: Log the FEN being sent
      const response = await axios.post('http://127.0.0.1:8000/api/analyze/', { fen });
      setEvaluation(response.data.evaluation);
      setBestMove(response.data.bestMove);
      console.log("Received Evaluation:", response.data.evaluation);  // Debugging: Log the evaluation received
      console.log("Best Move:", response.data.bestMove); 
    } catch (error) {
      console.error('Error fetching evaluation and best move:', error);
    }
  };

  const goToStart = () => {
    chess.reset();
    setCurrentMoveIndex(0);
    setPosition(chess.fen());
    setFen(chess.fen());
    sendFenToBackend(chess.fen());
  };

  const goToEnd = () => {
    chess.reset();
    moves.forEach(move => chess.move(move));
    setCurrentMoveIndex(moves.length);
    setPosition(chess.fen());
    setFen(chess.fen());
    sendFenToBackend(chess.fen());
  };

  const goToNext = () => {
    if (currentMoveIndex < moves.length) {
      chess.move(moves[currentMoveIndex]);
      setCurrentMoveIndex(currentMoveIndex + 1);
      setPosition(chess.fen());
      setFen(chess.fen());
      sendFenToBackend(chess.fen());
    }
  };

  const goToPrev = () => {
    if (currentMoveIndex > 0) {
      chess.undo();
      setCurrentMoveIndex(currentMoveIndex - 1);
      setPosition(chess.fen());
      setFen(chess.fen());
      sendFenToBackend(chess.fen());
    }
  };

  const renderMoveList = () => {
    const movePairs = [];
    for (let i = 0; i < moves.length; i += 2) {
      movePairs.push({
        moveNumber: Math.floor(i / 2) + 1,
        whiteMove: moves[i],
        blackMove: moves[i + 1] || '',
      });
    }
    return movePairs.map((pair, index) => (
      <tr key={index} style={{ backgroundColor: currentMoveIndex === index * 2 || currentMoveIndex === index * 2 + 1 ? '#f0f0f0' : 'transparent' }}>
        <td>{pair.moveNumber}</td>
        <td>{pair.whiteMove}</td>
        <td>{pair.blackMove}</td>
      </tr>
    ));
  };

  const getBarHeights = () => {
    if (evaluation === null) return { whiteHeight: '50%', blackHeight: '50%' };

    // Detect mate situations (using a threshold value, e.g., ±9999)
    const isMate = Math.abs(evaluation) > 999;
    if (isMate) {
      const whiteHeight = evaluation > 0 ? '100%' : '0%';
      const blackHeight = evaluation > 0 ? '0%' : '100%';
      return { whiteHeight, blackHeight };
    }

    // Capping the evaluation to a reasonable range
    const cappedEval = Math.max(-10, Math.min(10, evaluation));
    const whiteHeight = `${50 + (cappedEval * 5)}%`;
    const blackHeight = `${100 - (50 + (cappedEval * 5))}%`;

    console.log("Bar Heights -> White:", whiteHeight, "Black:", blackHeight);  // Debugging: Log the bar heights

    return { whiteHeight, blackHeight };
  };

  const { whiteHeight, blackHeight } = getBarHeights();

  return (
    <div className={styles.container}>
    <h2>Game Analysis</h2>
    <div className={styles['main-board-container']}>
      <div className={styles['moves-container']}>
        <table className={styles.moveTable}>
          <thead>
            <tr>
              <th>Move #</th>
              <th>White</th>
              <th>Black</th>
            </tr>
          </thead>
          <tbody>
            {renderMoveList()}
          </tbody>
        </table>
      </div>
      <div className={styles['board-and-info-container']}>
        <div className={styles['board-and-bar']}>
          <div className={styles['evaluation-bar-container']}>
            <div
              className={styles['evaluation-bar-white']}
              style={{ height: whiteHeight }}
            />
            <div
              className={styles['evaluation-bar-black']}
              style={{ height: blackHeight }}
            />
          </div>
          <div className={styles['board-container']}>
            <Chessboard position={position} width={512} />
          </div>
        </div>
        <div className={styles['move-info']}>
          
          {evaluation !== null && (
            <p>Evaluation: {evaluation > 0 ? `White +${evaluation}` : `Black ${evaluation}`}</p>
          )}
          {bestMove && (
            <p>Best Move: <code>{bestMove}</code></p>
          )}
        </div>
      </div>
    </div>
  
    <div className={styles['buttons-container']}>
      <button onClick={goToStart} disabled={currentMoveIndex === 0} className={styles.button}>
        Start
      </button>
      <button onClick={goToPrev} disabled={currentMoveIndex === 0} className={styles.button}>
        Previous
      </button>
      <button onClick={goToNext} disabled={currentMoveIndex === moves.length} className={styles.button}>
        Next
      </button>
      <button onClick={goToEnd} disabled={currentMoveIndex === moves.length} className={styles.button}>
        End
      </button>
    </div>
  </div>
  
  );
};

export default GameAnalysis;
