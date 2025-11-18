import express, { type Request,type Response,type NextFunction } from "express"
import type { User, Todo, JWTPayload } from "./utils/types"
import { COOKIE_NAME, COOKIE_OPTIONS, JWT_EXPIRES_IN, JWT_SECRET } from "./utils/config"
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser"
import { signupSchema, signinSchema, type signinInput, type signupInput, type createTodoInput, createTodoSchema, type updateTodoInput, updateTodoSchema } from "./utils/zod";
import bcrypt from "bcryptjs"
import { email } from "zod"
import { use } from "react"
import { isNamedExportBindings, updateLanguageServiceSourceFile } from "typescript"
import { todo } from "node:test"
import { countReset } from "console"


const users: User[] = []
const todos: Todo[] = []


const generateToken = (payload: JWTPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN})
}

const verifyToken = (token: string): JWTPayload => {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

//middleware
const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token = req.cookies[COOKIE_NAME];

        if (!token) {
            res.status(401).json({ error: "Authenticate Required"});
            return;
        }

        const decoded = verifyToken(token);
        req.user = decoded
        next();
    } catch (error) {
        res.status(401).json({
            error: "Invalid or expires token"
        });
    }
}  



const app = express()

app.use(express.json())
app.use(cookieParser())

app.post("/api/signup", async (req: Request, res: Response): Promise<void> => {
    try {
        const validateData: signupInput = signupSchema.parse(req.body);

        const existingUser = users.find(u => u.email === validateData.email)

        if (existingUser) {
            res.status(400).json({ error: "User already exists"});
            return
        }

        const hashedPassword = await bcrypt.hash(validateData.password, 10)

        const newUser: User = {
            userId: users.length + 1,
            email: validateData.email,
            password: hashedPassword,
            name: validateData.name
        }

        users.push(newUser)

        const token = generateToken({
        userId: newUser.userId,
        email: newUser.email
        })

        res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS)

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser.userId,
                email: newUser.email,
                name: newUser.name
            }
        })
    } catch (error) {
        res.status(400).json({
            error: "Internal Server Error"
        })
    }
})


app.post("/api/signin", async (req: Request, res: Response): Promise<void> => {
    try {
        const validateData: signinInput = signinSchema.parse(req.body);

        const user = users.find(u => u.email === validateData.email)

        if (!user) {
            res.status(401).json({ error: "Invalid Credentials"})
            return 
        }

        const isValidPassword = await bcrypt.compare(validateData.password, user.password)

        if (!isValidPassword) {
            res.status(401).json({
                error: "Invlaid credentials"
            });
            return
        }

        const token = generateToken({
            userId: user.userId,
            email: user.email
        })

        res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS)
        
        res.status(200).json({
            message: "signed in successfully",
            user: {
                id: user.userId,
                email: user.email,
                name: user.name,
            }
        })
        
    } catch (error) {
        res.status(500).json({
            error: "interval server error"
        })
    }
})


app.post("/signout", async (req: Request, res: Response): Promise<void> => {
    res.clearCookie(COOKIE_NAME),
    res.status(200).json({ message: "Signed out succesfully"});
});

app.get("/me", (req: Request, res: Response) => {
    const user = users.find(u => u.userId === req.user?.userId)

    if (!user) {
        res.status(404).json({ error: "User not foun"})
        return
    }

    res.status(200).json({
        user: {
            id: user.userId,
            email: user.email,
            name: user.name
        }
    })
})


app.post("/api/createTodo", async (req: Request, res: Response): Promise<void> => {
    try {
        const validateData: createTodoInput = createTodoSchema.parse(req.body)
        const userId = req.user!.userId;

        const newTodo: Todo = {
            id: Date.now().toString(),
            userId,
            title: validateData.title,
            description: validateData?.description!,
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        todos.push(newTodo)

        res.status(201).json({
            message: "Todo created Successfully",
            todo: newTodo
        })
    } catch (error) {
        res.status(500).json({
            error: "Internal server error"
        })
    }
})

app.get("/api/getTodos", async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    const { completed } = req.query;

    let userTodos = todos.filter(todo => todo.userId == userId);

    if (completed !== undefined) {
        const isCompleted = completed == "true";

        userTodos = userTodos.filter(todo => todo.completed === isCompleted)
    }

    //sort by creating date 
    userTodos.sort((a,b) => b.createdAt.getTime() - a.createdAt.getDate())

    res.status(200).json({
        todos: userTodos,
        count: userTodos.length
    })
})

app.get("/api/getById", async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    const todo = todos.find(t => t.id === id && t.userId === userId);

    if (!todo) {
        res.status(404).json({
            error: "Todo not found"
        });
        return
    }

    res.status(200).json({
        todos
    })

})

app.post("/api/updateTodos/:id", async (req: Request, res: Response) =>{
    try {
        const validateData: updateTodoInput = updateTodoSchema.parse(req.body);
        const userId = req.user!.userId;
        const id  = req.params.id as string;

        if (!id){
            return res.status(400).json({ error: "ID required"})
        }

        const todoIndex =todos.findIndex(t => t.id === id && t.userId === userId)

        if (todoIndex === -1) {
            res.status(404).json({ error: "todo not found"})
            return;
        }

        const currTodo = todos[todoIndex]

        if (validateData.title !== undefined) {
            currTodo!.title = validateData.title;
        }
        if (validateData.description !== undefined) {
            currTodo!.description = validateData.description;
        }
        if (validateData.completed !== undefined) {
            currTodo!.completed = validateData.completed;
        }

        currTodo!.updatedAt = new Date()

        res.status(200).json({
            message: "Todo updated successfully",
            todo: currTodo
        })

    } catch (error) {
        res.status(500).json({
            error: "internal server error"
        })
    }
})

app.delete("/api/delete", (req: Request, res: Response) => {

    const userId = req.user?.userId;
    const { id } = req.params;

    const todoIndex = todos.findIndex(t => t.id ===id && t.userId === userId)

    if (todoIndex === -1) {
        res.status(404).json({ error: "Todo not found"})
        return
    }

    todos.splice(todoIndex, 1);
    res.status(200).json({ 
        message: "Todo deleted successfully"
    })

    
})