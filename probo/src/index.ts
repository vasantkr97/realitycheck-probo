import express from "express"
import cors from "cors"
import authRoutes from "./authroutes";
import markets from "./market"

const app = express()

app.use(express.json())

app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}))

app.use("/user/auth/", authRoutes);

app.use("/api/v1/admin", markets)




app.listen(3000, () => {
    console.log("listenitng here")
})




