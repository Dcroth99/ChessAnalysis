// src/services/chessService.js
import axios from 'axios';

export const fetchGames = async (username) => {
  try {
    const response = await axios.get(`https://api.chess.com/pub/player/${username}/games/archives`);
    return response.data.archives;
  } catch (error) {
    console.error('Error fetching games:', error);
    throw error;
  }
};

export const fetchGameDetails = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching game details:', error);
    throw error;
  }
};
