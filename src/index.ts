import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";

import userRoutes from "./apps/api/modules/users/user.routes";
import billRoutes from "./apps/api/modules/bills/bill.routes";
import ledgerRoutes from "./apps/api/modules/ledgers/ledger.routes";

import { startBillCron } from "./packages/jobs/billCron";

const app = express();

app.use(express.json())
app.use(cookieParser());

startBillCron();

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/bills", billRoutes);
app.use("/api/v1/ledgers", ledgerRoutes);

app.listen(8000, () => {
  console.log("Server is running on port 8000")
})