import express from "express";
import routes from "./routes";
import cors from "cors";
import morgan from "morgan"
import cron from "node-cron"
import {fsAssistOpportunity} from "./crons/fsAssistOpportunity";
import {fsAssistDBStatus} from "./crons/fsAssistDBStatus";
import assist48hInWalking from "./crons/DBStatus/assist48hInWalking";
import assist24hInExpend from "./crons/DBStatus/assist24hInExpend";

require("dotenv").config();

const app = express();
const port = process.env.PORT_SERVER || 3333;

//cors
const whiteList = [
    "http://localhost:5173",
    "http://192.168.99.105:5173",
    "http://localhost:4173",
    "http://192.168.10.87:81",
    "http://192.168.10.87:83",
    "http://localhost:81",
    "http://localhost:83",
    "http://192.168.10.87:3333",
];
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || whiteList.indexOf(origin) !== -1) callback(null, true);
            else callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);
app.use(express.json());
app.use(morgan("dev"))
app.use(routes);


cron.schedule("*/20 * * * * *", fsAssistOpportunity)
cron.schedule("0 6 * * *", fsAssistDBStatus)
cron.schedule("0 9 * * *", assist48hInWalking)
cron.schedule("0 10 * * *", assist24hInExpend)

//app.use(errorMiddleware);
app.listen(port, () => {
    console.log("Server is running in " + port);
});
