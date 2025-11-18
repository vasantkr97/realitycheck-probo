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

interface AdminResultRequest {
    marketId: string;
    result: OutcomeType;
    autoSettle: boolean;
}


const markets: Market[] = []
const userBalances: Record<string, number> = {}
const userPositions: Record<string, Record<string, Record<OutcomeType, number>>> = {}
//userpositions[userId][marketId]["YES"|"NO"] -> number of shares


router.post("/admin/market", (req: Request, res: Response) => {
    try {
        const { title, category,closingDate } = req.body as { 
            title: string;
            category: string;
            closingDate: string;
        }

        if (!title || !category || !closingDate) {
            return res.status(400).json({ msg: "missing market fields"})
        }

        const newMarket: Market = {
            id: `mkt_${Date.now()}`,
            title,
            closingDate,
            yesPrice: 0.5,
            noPrice: 0.5,
            isActive: true
        }

        markets.push(newMarket)

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
        const { marketId, result, autoSettle = false } = req.body as AdminResultRequest;
        
        const market = markets.find((market) => market.id == marketId)

        if (!market) {
            return res.status(404).json({
                msg: "market does not exists"
            })
        }
        if (!market.isActive) {
            return res.status(400).json({
                msg: "market is already inactive"
            })
        }

        if (!["YES" , "NO"].includes(result)) {
            return res.status(400).json({
                msg: "Invalid result outcome"
            })
        }

        market.isActive = false;

        if (autoSettle) {
            for (const userId of Object.keys(userPositions)) {
                const holdings = userPositions[userId]?.[marketId]
                if (holdings  && holdings[result] > 0) {
                    const payout = holdings[result]*1
                    userBalances[userId] = (userBalances[userId] || 0) + payout;
                    if (!userPositions[userId]) {
                        userPositions[userId] = {};
                    }
                    if (!userPositions[userId][marketId]) {
                        userPositions[userId][marketId] = { YES: 0, NO: 0 };
                    }
                    userPositions[userId][marketId] = { YES: 0, NO: 0 };
                }
            }
        }

        return res.status(200).json({
            message: "Results announced successfully and users autosettled"
        })
    } catch (error) {
        return res.status(500).json({ msg: "Error announcing result."})
    }
});


router.get("/markets", (req: Request, res: Response): Response => {
    return res.status(200).json({ markets })
})


router.post("/user/onramp", (req: Request, res: Response) => {
    //onramp is simply the amount user deposit in the prediction market digital currency
    try {
        const { userId, amount } = req.body as onRampRequest

        if (!userId || typeof amount !== "number" || amount < 0) {
            return res.status(400).json({ message: "invalid onramp request"})
        }
        if (userBalances[userId] === undefined) {
            userBalances[userId] = 0;
        }
        userBalances[userId] += amount;

        return res.status(200).json({
            msg: "funds added successfully",
            balance: userBalances[userId]
        })

    } catch {
        return res.status(500).json({
            msg: "Error adding finds."
        })
    }   
})



router.post("/user/trade", (req: Request, res: Response) => {
    try {
        const { userId, marketId, outcome, shares } = req.body as TradeRequest;

        const market = markets.find((m) => m.id == marketId)

        if (!market || market.isActive) {
            return res.status(400).json({
                msg: "Invalid or market closed"
            })
        }
        if (!["YES","NO"].includes(outcome)) {
            return res.status(400).json({
                msg: "Outcome must be Yes or No."
            })
        }

        if (shares <= 0 ) return res.status(400).json({ msg: "Invalid share count."})

        const pricePerShare = outcome === "YES" ? market.yesPrice : market.noPrice;
        const totalCost = shares*pricePerShare;

        if ((userBalances[userId] || 0) < totalCost) {
            return res.status(400).json({ msg: "Insufficient Balance"})
        }

        if (userBalances[userId] === undefined) {
            userBalances[userId] = 0;
        }
        userBalances[userId] -= totalCost;

        userPositions[userId] = userPositions[userId] || {};
        userPositions[userId][marketId] = userPositions[userId][marketId] || { YES: 0, NO: 0};
        userPositions[userId][marketId][outcome] += shares;

        //Adjust price slightly (simulating market demand)
        const impact = 0.01*Math.log(shares + 1)
        if (outcome === "YES") {
            market.yesPrice = Math.min(0.95, market.yesPrice + impact)
            market.noPrice = 1-market.yesPrice
        } else {
            market.noPrice = Math.min(0.95, market.noPrice + impact);
            market.yesPrice = 1-market.noPrice;
        }

        return res.status(200).json({
            msg: `Purchased ${shares} ${outcome} shares.`,
            remainingBalance: userBalances[userId],
            marketPrices: {
                yesPrice: market.yesPrice,
                noPrice: market.noPrice
            }
        })
    } catch (error) {
        return res.status(500).json({ msg: "Error executing trade."})
    }
})


router.post("/user/claim", (req: Request, res: Response) => {
    try {
        const { userId, marketId } = req.body as ClaimRequest;

        const market = markets.find((m) => m.id == marketId);

        if (!market || market.isActive || !market.result) {
            return res.status(200).json({
                msg: "market not settled yet."
            })
        }

        const holdings = userPositions[userId]?.[marketId]

        if (!holdings) return res.status(404).json({ msg: "No holdings found for user."})

        const winningShares = holdings[market.result] // market.result === "YES" ? holdings.YES : holdings.NO

        if (winningShares <= 0) return res.status(400).json({ msg: "No winning shares to claim."})
        
        const payout = winningShares*1

        userBalances[userId] = (userBalances[userId] || 0) + payout;

        
        holdings[market.result] = 0;

        const losingOutcome = market.result === "YES" ? "NO" : "YES";
        holdings[losingOutcome] = 0;

        return res.status(200).json({
            msg: "PAyout claimed successfully.",
            payout: payout
        })
        
    } catch(error) {
        return res.status(500).json({ msg: "Error processing Claim."})
    }

})


export default router




































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