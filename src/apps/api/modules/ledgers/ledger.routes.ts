import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { getLedgersHandler } from "./handlers/get-ledgers.handler";
import { markLedgerPaidHandler } from "./handlers/mark-ledger-paid.handler";
import { markLedgerUnpaidHandler } from "./handlers/mark-ledger-unpaid.handler";

const router = Router();

router.use(authMiddleware);

router.get("/", getLedgersHandler);
router.put("/:id/paid", markLedgerPaidHandler);
router.put("/:id/unpaid", markLedgerUnpaidHandler);

export default router;
