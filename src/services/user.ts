import { prisma } from "../lib/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface IUser {
    name: string;
    email: string;
    password: string;
}
class UserService {

    private async getUserByEmail(email: string): Promise<any | null> {
        // logic to get user by email from the database
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })
        return user ? user : null; // placeholder
    }

    private async generateToken(user: any): Promise<string> {
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1h' });
        return token;

    }
    public static async createUser(payload: IUser) {
        const { name, email, password } = payload;

        // validate the payload
        if (!name || !email || !password) {
            throw new Error('Missing required fields');
        }

        // check if the user already exists
        const existingUser = await UserService.prototype.getUserByEmail.call(this, email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // create the user in the database
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });
        return user;

    }
}

export { UserService };