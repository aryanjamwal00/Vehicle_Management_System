import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { customersTable } from "@workspace/db/schema";
import { CreateCustomerBody, UpdateCustomerBody, GetCustomerParams, UpdateCustomerParams, DeleteCustomerParams } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  const customers = await db.select().from(customersTable).orderBy(customersTable.createdAt);
  res.json(customers);
});

router.post("/", async (req, res) => {
  const body = CreateCustomerBody.parse(req.body);
  const [customer] = await db.insert(customersTable).values(body).returning();
  res.status(201).json(customer);
});

router.get("/:id", async (req, res) => {
  const { id } = GetCustomerParams.parse({ id: Number(req.params.id) });
  const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, id));
  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }
  res.json(customer);
});

router.put("/:id", async (req, res) => {
  const { id } = UpdateCustomerParams.parse({ id: Number(req.params.id) });
  const body = UpdateCustomerBody.parse(req.body);
  const [customer] = await db.update(customersTable).set(body).where(eq(customersTable.id, id)).returning();
  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }
  res.json(customer);
});

router.delete("/:id", async (req, res) => {
  const { id } = DeleteCustomerParams.parse({ id: Number(req.params.id) });
  await db.delete(customersTable).where(eq(customersTable.id, id));
  res.status(204).send();
});

export default router;
