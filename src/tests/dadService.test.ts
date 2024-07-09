import axios from 'axios';
import dadService from '../services/dadService';

jest.mock('axios');

describe('dadService', () => {
  it('should fetch a random Dad joke', async () => {
    const mockJoke = { joke: 'Dad joke' };
    (axios.get as jest.Mock).mockResolvedValue({ data: mockJoke });

    const joke = await dadService.getRandomJoke();
    expect(joke).toEqual(mockJoke);
  });

  it('should throw an error if fetching the joke fails', async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error('Failed to fetch joke'));

    await expect(dadService.getRandomJoke()).rejects.toThrow('Failed to fetch joke');
  });
});
