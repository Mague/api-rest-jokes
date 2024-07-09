import axios from 'axios';

const getRandomJoke = async () => {
  const response = await axios.get('https://icanhazdadjoke.com/', {
    headers: { Accept: 'application/json' }
  });
  return response.data;
};

export default { getRandomJoke };
