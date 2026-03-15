import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_your_super_secured_default_secret';

export const generateToken = (userId: number, username: string) => {
    return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '1d' });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET) as { userId: number, username: string };
};
