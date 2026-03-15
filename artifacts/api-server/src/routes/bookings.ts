import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { bookingsTable, vehiclesTable, customersTable } from "@workspace/db/schema";
import {
  CreateBookingBody, GetBookingParams, UpdateBookingStatusParams, UpdateBookingStatusBody,
} from "@workspace/api-zod";
import { eq, and, or, lte, gte, sql } from "drizzle-orm";

const router: IRouter = Router();

const bookingWithRelations = () =>
  db
    .select({
      id: bookingsTable.id,
      vehicleId: bookingsTable.vehicleId,
      vehicleName: sql<string>`${vehiclesTable.make} || ' ' || ${vehiclesTable.model}`,
      registrationNumber: vehiclesTable.registrationNumber,
      customerId: bookingsTable.customerId,
      customerName: sql<string>`${customersTable.firstName} || ' ' || ${customersTable.lastName}`,
      startDate: bookingsTable.startDate,
      endDate: bookingsTable.endDate,
      purpose: bookingsTable.purpose,
      notes: bookingsTable.notes,
      status: bookingsTable.status,
      totalDays: sql<number>`(${bookingsTable.endDate}::date - ${bookingsTable.startDate}::date) + 1`,
      createdAt: bookingsTable.createdAt,
    })
    .from(bookingsTable)
    .innerJoin(vehiclesTable, eq(bookingsTable.vehicleId, vehiclesTable.id))
    .innerJoin(customersTable, eq(bookingsTable.customerId, customersTable.id));

router.get("/", async (_req, res) => {
  const bookings = await bookingWithRelations().orderBy(bookingsTable.createdAt);
  res.json(bookings);
});

router.post("/", async (req, res) => {
  const body = CreateBookingBody.parse(req.body);

  const conflicts = await db
    .select({ id: bookingsTable.id })
    .from(bookingsTable)
    .where(
      and(
        eq(bookingsTable.vehicleId, body.vehicleId),
        or(
          eq(bookingsTable.status, "Pending"),
          eq(bookingsTable.status, "Active")
        ),
        lte(bookingsTable.startDate, body.endDate),
        gte(bookingsTable.endDate, body.startDate)
      )
    );

  if (conflicts.length > 0) {
    res.status(409).json({ error: "Vehicle is not available for the selected dates" });
    return;
  }

  const [booking] = await db.insert(bookingsTable).values(body).returning();
  const [full] = await bookingWithRelations().where(eq(bookingsTable.id, booking.id));
  res.status(201).json(full);
});

router.get("/:id", async (req, res) => {
  const { id } = GetBookingParams.parse({ id: Number(req.params.id) });
  const [booking] = await bookingWithRelations().where(eq(bookingsTable.id, id));
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(booking);
});

router.patch("/:id/status", async (req, res) => {
  const { id } = UpdateBookingStatusParams.parse({ id: Number(req.params.id) });
  const { status, mileageOnReturn } = UpdateBookingStatusBody.parse(req.body);

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  await db.update(bookingsTable).set({ status }).where(eq(bookingsTable.id, id));

  if (status === "Completed" && mileageOnReturn !== undefined) {
    await db.update(vehiclesTable).set({ mileageKm: mileageOnReturn }).where(eq(vehiclesTable.id, booking.vehicleId));
  }

  if (status === "Completed" || status === "Cancelled") {
    await db.update(vehiclesTable).set({ status: "Active" }).where(eq(vehiclesTable.id, booking.vehicleId));
  }

  if (status === "Active") {
    await db.update(vehiclesTable).set({ status: "On Trip" }).where(eq(vehiclesTable.id, booking.vehicleId));
  }

  const [full] = await bookingWithRelations().where(eq(bookingsTable.id, id));
  res.json(full);
});

export default router;
