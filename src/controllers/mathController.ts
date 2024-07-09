import { Request, Response } from 'express';

export const getLCM = (req: Request, res: Response) => {
  const { numbers } = req.query;

  if (!numbers || typeof numbers !== 'string') {
    res.status(400).json({ error: 'The "numbers" query parameter is required and should be a string.' });
    return;
  }

  const numArray = numbers.split(',').map(Number);
  const lcm = numArray.reduce((a, b) => {
    const gcd = (x: number, y: number): number => (!y ? x : gcd(y, x % y));
    return (a * b) / gcd(a, b);
  });

  res.json({ lcm });
};

export const incrementNumber = (req: Request, res: Response) => {
  const { number } = req.query;
  const num = parseInt(number as string, 10);
  res.json({ result: num + 1 });
};
