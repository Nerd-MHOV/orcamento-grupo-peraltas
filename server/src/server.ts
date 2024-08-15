import express from "express";
import routes from "./routes";
import cors from "cors";
import morgan from "morgan"
import cron from "node-cron"
import Queue from "./lib/Queue"
import {fsAssistOpportunity} from "./crons/fsAssistOpportunity";
import {fsAssistDBStatus} from "./crons/fsAssistDBStatus";
import assist48hInWalking from "./crons/DBStatus/assist48hInWalking";
import assist24hInExpend from "./crons/DBStatus/assist24hInExpend";
import {ExpressAdapter} from "@bull-board/express";
import {createBullBoard} from "@bull-board/api";
import {BullAdapter} from "@bull-board/api/bullAdapter";
import {fsAssistDaysDeadLine} from "./crons/fsAssistDaysDeadLine";
import { fsAssistGoogleForms } from "./crons/fsAssistGoogleForms";

require("dotenv").config();

const app = express();
const port = process.env.PORT_SERVER || 3333;


// //bull-board
// const basePath = "/bull/dashboard"
// const serverAdapter = new ExpressAdapter()
// serverAdapter.setBasePath(basePath);
// createBullBoard({
//     serverAdapter,
//     queues: Queue.queues.map(queue => new BullAdapter(queue.bull)),
//     options: {
//         uiConfig: {
//             boardTitle: "S Orçamento"
//         }
//     }
// })

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
    "http://localhost:4173",
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
app.use(morgan("short"))
app.use(routes);
// app.use(basePath, serverAdapter.getRouter())



cron.schedule("*/20 * * * * *", fsAssistOpportunity)
cron.schedule("0 */2 * * *", fsAssistDBStatus)
// cron.schedule("0 9 * * *", assist48hInWalking)
// cron.schedule("0 10 * * *", assist24hInExpend)
cron.schedule("0 3 * * *", fsAssistDaysDeadLine);
cron.schedule("0 2 * * *", fsAssistGoogleForms);



//app.use(errorMiddleware);
app.listen(port, () => {
    console.log("Server is running in " + port);
});
