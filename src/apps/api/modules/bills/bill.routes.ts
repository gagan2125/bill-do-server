import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createBillHandler } from "./handlers/create-bill.handler";
import { getBillsHandler } from "./handlers/get-bills.handler";
import { getBillByIdHandler } from "./handlers/get-bill-by-id.handler";
import { updateBillHandler } from "./handlers/update-bill.handler";
import { deleteBillHandler } from "./handlers/delete-bill.handler";
import { pauseBillHandler } from "./handlers/pause-bill.handler";
import { resumeBillHandler } from "./handlers/resume-bill-handler";

const router = Router();

router.use(authMiddleware);

router.post("/", createBillHandler);
router.get("/", getBillsHandler);
router.get("/:id", getBillByIdHandler);
router.put("/:id/pause", pauseBillHandler);
router.put("/:id/resume", resumeBillHandler);
router.put("/:id", updateBillHandler);
router.delete("/:id", deleteBillHandler);

export default router;
