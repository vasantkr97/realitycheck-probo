import express from "express"
import type { Response, Request } from "express"
 
const router = express.Router()

interface User {
    id: number;
    username: string;
    email: string;
    password: string;
}

const users: User[] = []

router.post("/signup", (req: Request, res: Response) => {
    try {
        const { email, password, username } = req.body

        if (!email || !password || !username) {
            return res.status(404).json({
                msg: "all fields are requried!"
            })
        }

        const existingUser = users.find((user) => user.email == email) 

        if (!existingUser) {
            return res.status(404).json({
                msg: "user already exists"
            })
        }

        const newUser: User = {
            id: users.length + 1,
            username: username,
            email: email,
            password: password
        }

        users.push(newUser)

        return res.status(500).json({
            msg: "signup success",
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        })
    } catch (error) {
        console.log("Signup failed", error)
        return res.status(500).json({ msg: "Internal Server Error"})
    }
})

router.post("/singin", (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ msg: "Email and password are required"})
        }

        const user = users.find((user) => user.email == email)
        if (!user) {
            return res.status(404).json({
                msg: "User does not exits"
            })
        }

        if (user.password !== password) {
            return res.status(401).json({
                msg: "invalid credentials"
            })
        }

        return res.status(200).json({
            msg: "Signin successfully",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.log("Signin failed", error)
        return res.status(500).json({
            msg: "Internal Server Error"
        })
    }
})