import { Router, type IRouter } from "express";
import healthRouter from "./health";
import customersRouter from "./customers";
import vehicleTypesRouter from "./vehicleTypes";
import vehiclesRouter from "./vehicles";
import bookingsRouter from "./bookings";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/customers", customersRouter);
router.use("/vehicle-types", vehicleTypesRouter);
router.use("/vehicles", vehiclesRouter);
router.use("/bookings", bookingsRouter);

export default router;
