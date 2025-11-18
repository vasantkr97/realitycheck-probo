import type { JwtPayload } from "jsonwebtoken";

export interface JWTPayload {
    userId: number;
    email: string;

}

export interface User {
    userId: number;
    email: string;
    password: string;
    name: string;
}

export interface Todo {
    id: string;
    userId: number;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

//Extend Express Request to include User

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload
        }
    }
}