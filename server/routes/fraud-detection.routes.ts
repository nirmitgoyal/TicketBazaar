import { Router } from "express";
import { checkTicketFraud } from "../fraud-detection";

const router = Router();

// POST /api/fraud-detection/check
router.post("/check", checkTicketFraud);

export default router;