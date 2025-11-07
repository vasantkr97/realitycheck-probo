import express, { type Request, type Response }from  "express"

const router = express.Router()

type OutcomeType = "YES" | "NO"

interface Market {
    id: string;
    title: string;
    closingDate: string;
    yesPrice: number;
    noPrice: number;
    isActive: boolean;
    result?: OutcomeType
}

interface TradeRequest {
    userId: string;
    marketId: string;
    outcome: OutcomeType;
    shares: number;
}

interface ClaimRequest {
    userId: string;
    marketId: string;
}

interface onRampRequest {
    userId: string;
    amount: number;
}


const market: Market[] = []
const userBalances: Record<string, number> = {}
const userPositions: Record<string, Record<string, Record<OutcomeType, number>>> = {}
//userpositions[userId][marketId]["YES"|"NO"] -> number of shares


router.post("/admin/market", (req: Request, res: Response) => {
    try {
        const { title, closingDate } = req.body 

        if (!title || !closingDate) {
            return res.status(400).json({ msg: "invalid market data"})
        }

        const newMarket: Market = {
            id: `mkt_${Date.now()}`,
            title,
            closingDate,
            yesPrice: 0.5,
            noPrice: 0.5,
            isActive: true
        }

        market.push(newMarket)

        return res.status(201).json({
            msg: "market created successfully",
            market: newMarket
        })
    } catch (error) {
        console.log("Error in market creating")
        return res.status(500).json({ msg: "Error Createing market."})
    }
})


router.post("/admin/results", (req: Request, res: Response) => {
    try {
        const { result}
    }
})








































// import express from "express"
// import { userInfo } from "os"
// const router = express.Router()

// const marketData: any[] = []

// router.post("/admin/market", (req, res) => {
//     //admin to create market

// router.post("/admin/results", (req, res)=> {
//     //admin to annouce results



// router.get("/markets", (req, res) => {
//     //get all created markets
// })


// //???????
// router.post("/user/split", (req, res) => {
//     //split 

// })


// router.post("/user/merge", (req, res) => {
//     //merge

// })

// router.post("/user/claim", (req, res) => {
//     //claim


// })

// router.post("/user/onramp", (req, res) => {
//     //onramp

// })


// export default router;