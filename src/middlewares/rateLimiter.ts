import rateLimit from "express-rate-limit";
export const globalLimiter = rateLimit({
    windowMs : 15*60*1000,
    max : 100,
    standardHeaders : true,
    legacyHeaders : false,
    skip: (req) => req.method === "OPTIONS",
})