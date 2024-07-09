import axios from 'axios';

const getRandomJoke = async () => {
  const response = await axios.get('https://api.chucknorris.io/jokes/random');
  return response.data;
};

export default { getRandomJoke };
