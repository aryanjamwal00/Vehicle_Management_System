import { Router, type IRouter } from "express";
import healthRouter from "./health";
import customersRouter from "./customers";
import vehicleTypesRouter from "./vehicleTypes";
import vehiclesRouter from "./vehicles";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/customers", customersRouter);
router.use("/vehicle-types", vehicleTypesRouter);
router.use("/vehicles", vehiclesRouter);

export default router;
