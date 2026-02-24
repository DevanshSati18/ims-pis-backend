"use strict";
import path from "path"; // 👈 Add this import at the top
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = require("./config/db");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const department_routes_1 = __importDefault(require("./routes/department.routes"));
const subDepartment_routes_1 = __importDefault(require("./routes/subDepartment.routes"));
const inventory_routes_1 = __importDefault(require("./routes/inventory.routes"));
const record_routes_1 = __importDefault(require("./routes/record.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const rateLimiter_1 = require("./middlewares/rateLimiter");
const helmet_1 = __importDefault(require("helmet"));
dotenv_1.default.config();
(0, db_1.connectDB)();
const app = (0, express_1.default)();
const allowedOrigins = [
    process.env.CLIENT_URL,
];
// Middleware
app.disable("x-powered-by");
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
// app.use(rateLimiter_1.globalLimiter);
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/health", health_routes_1.default);
app.use("/api/departments", department_routes_1.default);
app.use("/api/sub-departments", subDepartment_routes_1.default);
app.use("/api/inventory", inventory_routes_1.default);
app.use("/api/records", record_routes_1.default);
app.use("/api/uploads", express_1.default.static("src/uploads"));
app.use("/api/uploads", express.static(path.join(process.cwd(), "src/uploads")));
app.use("/api/users", user_routes_1.default);
// Server
const PORT = Number(process.env.PORT) || 5050;
app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
