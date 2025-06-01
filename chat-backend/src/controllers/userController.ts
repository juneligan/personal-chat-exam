import {prisma} from "../prisma/client";
import {Request, Response} from "express";

export const getUser = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true },
    });
    res.json(users);
  } catch (err) {
    console.error('Failed to fetch users:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}