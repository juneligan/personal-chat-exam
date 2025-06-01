import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_your_super_secured_default_secret';

export const generateToken = (userId: number) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1d' });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, JWT_SECRET) as { userId: number };
};
