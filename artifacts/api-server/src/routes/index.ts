import { Router, type IRouter } from "express";
import healthRouter from "./health";
import shipmentsRouter from "./shipments";
import verifyRouter from "./verify";

const router: IRouter = Router();

router.use(healthRouter);
router.use(shipmentsRouter);
router.use(verifyRouter);

export default router;
