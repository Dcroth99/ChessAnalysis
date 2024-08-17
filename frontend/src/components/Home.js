import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchGames, fetchGameDetails } from '../services/chessService';
import styles from '../styles/Home.module.css'; 

const Home = () => {
  const [username, setUsername] = useState('');
  const [games, setGames] = useState([]);
  const navigate = useNavigate();

  const handleFetchGames = async () => {
    try {
      const archives = await fetchGames(username);
      if (archives.length > 0) {
        const latestArchive = archives[archives.length - 1];
        const gameDetails = await fetchGameDetails(latestArchive);
        setGames(gameDetails.games.reverse()); // Reverse the order of games here
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const handleSelectGame = (game) => {
    navigate('/analysis', { state: { pgn: game.pgn } });
  };

  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.homeH1}>Chess Analyzer</h1>
      <section className={styles.homeInput}>
        <label htmlFor="username">Enter Chess.com username</label>
        <input
          className={styles.homeInputField}
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          name="username" 
        />
        <button className={styles.homeButton} onClick={handleFetchGames}>Fetch Games</button>
      </section>

      <div className={styles.homeGames}>
        <h2 className={styles.homeH2}>Games</h2>
        <ul className={styles.homeGameList}>
          {games.map((game, index) => (
            <li 
              key={index}
              className={styles.gameListItem}
            >
              <button 
                className={styles.gameButton}
                onClick={() => handleSelectGame(game)}
              >
                {game.white.username} vs {game.black.username}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;
