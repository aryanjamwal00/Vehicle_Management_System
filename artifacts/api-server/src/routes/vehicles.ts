import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { vehiclesTable, customersTable, vehicleTypesTable } from "@workspace/db/schema";
import { CreateVehicleBody, UpdateVehicleBody, GetVehicleParams, UpdateVehicleParams, DeleteVehicleParams } from "@workspace/api-zod";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

const vehicleWithRelations = () =>
  db
    .select({
      id: vehiclesTable.id,
      registrationNumber: vehiclesTable.registrationNumber,
      make: vehiclesTable.make,
      model: vehiclesTable.model,
      year: vehiclesTable.year,
      color: vehiclesTable.color,
      fuelType: vehiclesTable.fuelType,
      status: vehiclesTable.status,
      vehicleTypeId: vehiclesTable.vehicleTypeId,
      vehicleTypeName: vehicleTypesTable.name,
      customerId: vehiclesTable.customerId,
      customerName: sql<string>`${customersTable.firstName} || ' ' || ${customersTable.lastName}`,
      createdAt: vehiclesTable.createdAt,
    })
    .from(vehiclesTable)
    .innerJoin(vehicleTypesTable, eq(vehiclesTable.vehicleTypeId, vehicleTypesTable.id))
    .innerJoin(customersTable, eq(vehiclesTable.customerId, customersTable.id));

router.get("/", async (_req, res) => {
  const vehicles = await vehicleWithRelations().orderBy(vehiclesTable.createdAt);
  res.json(vehicles);
});

router.post("/", async (req, res) => {
  const body = CreateVehicleBody.parse(req.body);
  const [vehicle] = await db.insert(vehiclesTable).values(body).returning();
  const [full] = await vehicleWithRelations().where(eq(vehiclesTable.id, vehicle.id));
  res.status(201).json(full);
});

router.get("/:id", async (req, res) => {
  const { id } = GetVehicleParams.parse({ id: Number(req.params.id) });
  const [vehicle] = await vehicleWithRelations().where(eq(vehiclesTable.id, id));
  if (!vehicle) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }
  res.json(vehicle);
});

router.put("/:id", async (req, res) => {
  const { id } = UpdateVehicleParams.parse({ id: Number(req.params.id) });
  const body = UpdateVehicleBody.parse(req.body);
  await db.update(vehiclesTable).set(body).where(eq(vehiclesTable.id, id));
  const [full] = await vehicleWithRelations().where(eq(vehiclesTable.id, id));
  if (!full) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }
  res.json(full);
});

router.delete("/:id", async (req, res) => {
  const { id } = DeleteVehicleParams.parse({ id: Number(req.params.id) });
  await db.delete(vehiclesTable).where(eq(vehiclesTable.id, id));
  res.status(204).send();
});

export default router;
