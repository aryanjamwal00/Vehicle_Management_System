import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { vehiclesTable, customersTable, vehicleTypesTable } from "@workspace/db/schema";
import {
  CreateVehicleBody, UpdateVehicleBody, GetVehicleParams, UpdateVehicleParams,
  DeleteVehicleParams, UpdateVehicleMileageParams, UpdateVehicleMileageBody,
  CheckVehicleAvailabilityParams, CheckVehicleAvailabilityQueryParams,
} from "@workspace/api-zod";
import { eq, sql, and, or, lte, gte, ne } from "drizzle-orm";
import { bookingsTable } from "@workspace/db/schema";

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
      mileageKm: vehiclesTable.mileageKm,
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
  const [vehicle] = await db.insert(vehiclesTable).values({ ...body, mileageKm: body.mileageKm ?? 0 }).returning();
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

router.patch("/:id/mileage", async (req, res) => {
  const { id } = UpdateVehicleMileageParams.parse({ id: Number(req.params.id) });
  const { mileageKm } = UpdateVehicleMileageBody.parse(req.body);
  await db.update(vehiclesTable).set({ mileageKm }).where(eq(vehiclesTable.id, id));
  const [full] = await vehicleWithRelations().where(eq(vehiclesTable.id, id));
  if (!full) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }
  res.json(full);
});

router.get("/:id/availability", async (req, res) => {
  const { id } = CheckVehicleAvailabilityParams.parse({ id: Number(req.params.id) });
  const query = CheckVehicleAvailabilityQueryParams.parse(req.query);

  const conflicts = await db
    .select({
      id: bookingsTable.id,
      startDate: bookingsTable.startDate,
      endDate: bookingsTable.endDate,
      status: bookingsTable.status,
    })
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.vehicleId, id),
        or(
          eq(bookingsTable.status, "Pending"),
          eq(bookingsTable.status, "Active")
        ),
        lte(bookingsTable.startDate, query.endDate),
        gte(bookingsTable.endDate, query.startDate)
      )
    );

  res.json({
    available: conflicts.length === 0,
    conflictingBookings: conflicts,
  });
});

export default router;
