import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { getLedgersHandler } from "./handlers/get-ledgers.handler";
import { getLedgerByIdHandler } from "./handlers/get-ledger-by-id.handler";
import { markLedgerPaidHandler } from "./handlers/mark-ledger-paid.handler";
import { markLedgerUnpaidHandler } from "./handlers/mark-ledger-unpaid.handler";
import { updateLedgerHandler } from "./handlers/update-ledger.handler";

const router = Router();

router.use(authMiddleware);

router.get("/", getLedgersHandler);
router.get("/:id", getLedgerByIdHandler);
router.put("/:id/paid", markLedgerPaidHandler);
router.put("/:id/unpaid", markLedgerUnpaidHandler);
router.patch("/:id", updateLedgerHandler);

export default router;
