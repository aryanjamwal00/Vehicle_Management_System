import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { vehicleTypesTable } from "@workspace/db/schema";
import { CreateVehicleTypeBody, UpdateVehicleTypeBody, UpdateVehicleTypeParams, DeleteVehicleTypeParams } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  const types = await db.select().from(vehicleTypesTable).orderBy(vehicleTypesTable.name);
  res.json(types);
});

router.post("/", async (req, res) => {
  const body = CreateVehicleTypeBody.parse(req.body);
  const [type] = await db.insert(vehicleTypesTable).values(body).returning();
  res.status(201).json(type);
});

router.put("/:id", async (req, res) => {
  const { id } = UpdateVehicleTypeParams.parse({ id: Number(req.params.id) });
  const body = UpdateVehicleTypeBody.parse(req.body);
  const [type] = await db.update(vehicleTypesTable).set(body).where(eq(vehicleTypesTable.id, id)).returning();
  if (!type) {
    res.status(404).json({ error: "Vehicle type not found" });
    return;
  }
  res.json(type);
});

router.delete("/:id", async (req, res) => {
  const { id } = DeleteVehicleTypeParams.parse({ id: Number(req.params.id) });
  await db.delete(vehicleTypesTable).where(eq(vehicleTypesTable.id, id));
  res.status(204).send();
});

export default router;
