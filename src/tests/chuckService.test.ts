import axios from 'axios';
import chuckService from '../services/chuckService';

jest.mock('axios');

describe('chuckService', () => {
  it('should fetch a random Chuck Norris joke', async () => {
    const mockJoke = { value: 'Chuck Norris joke' };
    (axios.get as jest.Mock).mockResolvedValue({ data: mockJoke });

    const joke = await chuckService.getRandomJoke();
    expect(joke).toEqual(mockJoke);
  });

  it('should throw an error if fetching the joke fails', async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error('Failed to fetch joke'));

    await expect(chuckService.getRandomJoke()).rejects.toThrow('Failed to fetch joke');
  });
});
