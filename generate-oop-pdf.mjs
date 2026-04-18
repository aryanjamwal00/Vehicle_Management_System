import PDFDocument from "pdfkit";
import fs from "fs";

const doc = new PDFDocument({ margin: 50, size: "A4" });
const output = fs.createWriteStream("VehicleManagementSystem_OOP_Code.pdf");
doc.pipe(output);

const PRIMARY = "#4F46E5";
const DARK = "#1E1B4B";
const GRAY = "#6B7280";
const CODE_BG = "#1E1E2E";
const CODE_FG = "#CDD6F4";
const CODE_KEYWORD = "#CBA6F7";
const CODE_TYPE = "#89DCEB";
const CODE_STRING = "#A6E3A1";
const CODE_COMMENT = "#6C7086";
const CODE_CLASS = "#F9E2AF";
const WHITE = "#FFFFFF";

function sectionHeader(text) {
  doc.moveDown(0.5);
  doc.rect(50, doc.y, 495, 28).fill(PRIMARY);
  doc.fillColor(WHITE).fontSize(12).font("Helvetica-Bold")
    .text(text, 62, doc.y - 21);
  doc.fillColor(DARK);
  doc.moveDown(0.7);
}

function codeBlock(lines) {
  const lineH = 13;
  const blockH = lines.length * lineH + 16;
  const startY = doc.y;

  if (startY + blockH > 780) doc.addPage();
  const y = doc.y;

  doc.rect(50, y, 495, blockH).fill(CODE_BG);
  let ly = y + 8;

  lines.forEach(({ text, color }) => {
    doc.fillColor(color || CODE_FG).fontSize(8).font("Courier")
      .text(text, 60, ly, { lineBreak: false });
    ly += lineH;
  });

  doc.y = y + blockH + 6;
  doc.fillColor(DARK);
  doc.moveDown(0.2);
}

function bodyText(text) {
  doc.fillColor(DARK).fontSize(10).font("Helvetica").text(text, { lineGap: 3 });
}

// ── COVER ──────────────────────────────────────────────────────────────────
doc.rect(0, 0, 612, 180).fill(PRIMARY);
doc.fillColor(WHITE).fontSize(24).font("Helvetica-Bold")
  .text("Vehicle Management System", 50, 50, { align: "center" });
doc.fontSize(13).font("Helvetica")
  .text("OOP Design & Business Logic — TypeScript", { align: "center" });
doc.fillColor("#C7D2FE").fontSize(10).moveDown(0.5)
  .text("Classes · Interfaces · Inheritance · Encapsulation · Polymorphism", { align: "center" });
doc.y = 200; doc.fillColor(DARK);

// ── 1. INTERFACES ──────────────────────────────────────────────────────────
sectionHeader("1.  Interfaces — Contracts for all entities");

codeBlock([
  { text: "// ─── Base entity interface ──────────────────────────────────────", color: CODE_COMMENT },
  { text: "interface IEntity {", color: CODE_FG },
  { text: "  readonly id: number;", color: CODE_FG },
  { text: "  readonly createdAt: Date;", color: CODE_FG },
  { text: "}", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "interface ICustomer extends IEntity {", color: CODE_FG },
  { text: "  firstName:     string;", color: CODE_FG },
  { text: "  lastName:      string;", color: CODE_FG },
  { text: "  email:         string;", color: CODE_FG },
  { text: "  phone:         string;", color: CODE_FG },
  { text: "  address:       string;", color: CODE_FG },
  { text: "  licenseNumber: string;", color: CODE_FG },
  { text: "  getFullName(): string;", color: CODE_FG },
  { text: "}", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "interface IVehicleType extends IEntity {", color: CODE_FG },
  { text: "  name:        string;", color: CODE_FG },
  { text: "  description: string;", color: CODE_FG },
  { text: "  category:    string;", color: CODE_FG },
  { text: "}", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "type VehicleStatus = 'Active' | 'On Trip' | 'Under Maintenance' | 'Inactive';", color: CODE_FG },
  { text: "type FuelType      = 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';", color: CODE_FG },
  { text: "type BookingStatus = 'Pending' | 'Active' | 'Completed' | 'Cancelled';", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "interface IVehicle extends IEntity {", color: CODE_FG },
  { text: "  registrationNumber: string;", color: CODE_FG },
  { text: "  make:               string;", color: CODE_FG },
  { text: "  model:              string;", color: CODE_FG },
  { text: "  year:               number;", color: CODE_FG },
  { text: "  color:              string;", color: CODE_FG },
  { text: "  fuelType:           FuelType;", color: CODE_FG },
  { text: "  status:             VehicleStatus;", color: CODE_FG },
  { text: "  mileageKm:          number;", color: CODE_FG },
  { text: "  vehicleTypeId:      number;", color: CODE_FG },
  { text: "  ownerId:            number;", color: CODE_FG },
  { text: "  updateMileage(km: number): void;", color: CODE_FG },
  { text: "  isAvailable(): boolean;", color: CODE_FG },
  { text: "  getDisplayName(): string;", color: CODE_FG },
  { text: "}", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "interface IBooking extends IEntity {", color: CODE_FG },
  { text: "  vehicleId:  number;", color: CODE_FG },
  { text: "  customerId: number;", color: CODE_FG },
  { text: "  startDate:  Date;", color: CODE_FG },
  { text: "  endDate:    Date;", color: CODE_FG },
  { text: "  purpose:    string;", color: CODE_FG },
  { text: "  notes?:     string;", color: CODE_FG },
  { text: "  status:     BookingStatus;", color: CODE_FG },
  { text: "  getTotalDays(): number;", color: CODE_FG },
  { text: "  canCancel(): boolean;", color: CODE_FG },
  { text: "  canComplete(): boolean;", color: CODE_FG },
  { text: "}", color: CODE_FG },
]);

// ── 2. BASE ENTITY CLASS ───────────────────────────────────────────────────
sectionHeader("2.  Abstract Base Class — Entity");

codeBlock([
  { text: "// ─── Abstract base class (encapsulates common fields) ───────────", color: CODE_COMMENT },
  { text: "abstract class Entity implements IEntity {", color: CODE_FG },
  { text: "  readonly id:        number;", color: CODE_FG },
  { text: "  readonly createdAt: Date;", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  constructor(id: number, createdAt?: Date) {", color: CODE_FG },
  { text: "    this.id        = id;", color: CODE_FG },
  { text: "    this.createdAt = createdAt ?? new Date();", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  // Every entity must be serialisable", color: CODE_COMMENT },
  { text: "  abstract toJSON(): Record<string, unknown>;", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  // Shared equality check", color: CODE_COMMENT },
  { text: "  equals(other: Entity): boolean {", color: CODE_FG },
  { text: "    return this.constructor === other.constructor && this.id === other.id;", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "}", color: CODE_FG },
]);

// ── 3. CUSTOMER CLASS ──────────────────────────────────────────────────────
sectionHeader("3.  Customer Class — Encapsulation & Validation");

codeBlock([
  { text: "class Customer extends Entity implements ICustomer {", color: CODE_FG },
  { text: "  // Private fields — encapsulation", color: CODE_COMMENT },
  { text: "  private _firstName:     string;", color: CODE_FG },
  { text: "  private _lastName:      string;", color: CODE_FG },
  { text: "  private _email:         string;", color: CODE_FG },
  { text: "  private _phone:         string;", color: CODE_FG },
  { text: "  private _address:       string;", color: CODE_FG },
  { text: "  private _licenseNumber: string;", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  constructor(data: Omit<ICustomer, 'getFullName'>) {", color: CODE_FG },
  { text: "    super(data.id, data.createdAt);", color: CODE_FG },
  { text: "    this._firstName     = this.validateName(data.firstName, 'First name');", color: CODE_FG },
  { text: "    this._lastName      = this.validateName(data.lastName, 'Last name');", color: CODE_FG },
  { text: "    this._email         = this.validateEmail(data.email);", color: CODE_FG },
  { text: "    this._phone         = data.phone;", color: CODE_FG },
  { text: "    this._address       = data.address;", color: CODE_FG },
  { text: "    this._licenseNumber = data.licenseNumber;", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  // Getters — controlled access", color: CODE_COMMENT },
  { text: "  get firstName()     { return this._firstName; }", color: CODE_FG },
  { text: "  get lastName()      { return this._lastName; }", color: CODE_FG },
  { text: "  get email()         { return this._email; }", color: CODE_FG },
  { text: "  get phone()         { return this._phone; }", color: CODE_FG },
  { text: "  get address()       { return this._address; }", color: CODE_FG },
  { text: "  get licenseNumber() { return this._licenseNumber; }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  // Business logic method", color: CODE_COMMENT },
  { text: "  getFullName(): string {", color: CODE_FG },
  { text: "    return `${this._firstName} ${this._lastName}`;", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  // Private validation helpers", color: CODE_COMMENT },
  { text: "  private validateName(name: string, field: string): string {", color: CODE_FG },
  { text: "    if (!name || name.trim().length < 2)", color: CODE_FG },
  { text: "      throw new Error(`${field} must be at least 2 characters`);", color: CODE_FG },
  { text: "    return name.trim();", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  private validateEmail(email: string): string {", color: CODE_FG },
  { text: "    const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;", color: CODE_FG },
  { text: "    if (!re.test(email)) throw new Error('Invalid email address');", color: CODE_FG },
  { text: "    return email.toLowerCase();", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  toJSON() {", color: CODE_FG },
  { text: "    return { id: this.id, firstName: this._firstName,", color: CODE_FG },
  { text: "             lastName: this._lastName, email: this._email,", color: CODE_FG },
  { text: "             phone: this._phone, address: this._address,", color: CODE_FG },
  { text: "             licenseNumber: this._licenseNumber, createdAt: this.createdAt };", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "}", color: CODE_FG },
]);

// ── 4. VEHICLE TYPE CLASS ──────────────────────────────────────────────────
sectionHeader("4.  VehicleType Class");

codeBlock([
  { text: "class VehicleType extends Entity implements IVehicleType {", color: CODE_FG },
  { text: "  readonly name:        string;", color: CODE_FG },
  { text: "  readonly description: string;", color: CODE_FG },
  { text: "  readonly category:    string;", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  constructor(data: IVehicleType) {", color: CODE_FG },
  { text: "    super(data.id, data.createdAt);", color: CODE_FG },
  { text: "    this.name        = data.name;", color: CODE_FG },
  { text: "    this.description = data.description;", color: CODE_FG },
  { text: "    this.category    = data.category;", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  toJSON() {", color: CODE_FG },
  { text: "    return { id: this.id, name: this.name,", color: CODE_FG },
  { text: "             description: this.description, category: this.category };", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "}", color: CODE_FG },
]);

// ── 5. VEHICLE CLASS + INHERITANCE ─────────────────────────────────────────
sectionHeader("5.  Vehicle Class — with Inheritance (ElectricVehicle)");

codeBlock([
  { text: "class Vehicle extends Entity implements IVehicle {", color: CODE_FG },
  { text: "  registrationNumber: string;", color: CODE_FG },
  { text: "  make:               string;", color: CODE_FG },
  { text: "  model:              string;", color: CODE_FG },
  { text: "  year:               number;", color: CODE_FG },
  { text: "  color:              string;", color: CODE_FG },
  { text: "  fuelType:           FuelType;", color: CODE_FG },
  { text: "  protected _status:  VehicleStatus;", color: CODE_FG },
  { text: "  protected _mileageKm: number;", color: CODE_FG },
  { text: "  vehicleTypeId:      number;", color: CODE_FG },
  { text: "  ownerId:            number;", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  constructor(data: IVehicle) {", color: CODE_FG },
  { text: "    super(data.id, data.createdAt);", color: CODE_FG },
  { text: "    this.registrationNumber = data.registrationNumber.toUpperCase();", color: CODE_FG },
  { text: "    this.make          = data.make;", color: CODE_FG },
  { text: "    this.model         = data.model;", color: CODE_FG },
  { text: "    this.year          = data.year;", color: CODE_FG },
  { text: "    this.color         = data.color;", color: CODE_FG },
  { text: "    this.fuelType      = data.fuelType;", color: CODE_FG },
  { text: "    this._status       = data.status;", color: CODE_FG },
  { text: "    this._mileageKm    = data.mileageKm;", color: CODE_FG },
  { text: "    this.vehicleTypeId = data.vehicleTypeId;", color: CODE_FG },
  { text: "    this.ownerId       = data.ownerId;", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  get status()    { return this._status; }", color: CODE_FG },
  { text: "  get mileageKm() { return this._mileageKm; }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  // Business logic — availability check", color: CODE_COMMENT },
  { text: "  isAvailable(): boolean {", color: CODE_FG },
  { text: "    return this._status === 'Active';", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  // Business logic — mileage update with validation", color: CODE_COMMENT },
  { text: "  updateMileage(km: number): void {", color: CODE_FG },
  { text: "    if (km < this._mileageKm)", color: CODE_FG },
  { text: "      throw new Error(`New mileage (${km}) cannot be less than current (${this._mileageKm})`);", color: CODE_FG },
  { text: "    this._mileageKm = km;", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  setOnTrip():     void { this._status = 'On Trip'; }", color: CODE_FG },
  { text: "  setActive():     void { this._status = 'Active'; }", color: CODE_FG },
  { text: "  setMaintenance():void { this._status = 'Under Maintenance'; }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  getDisplayName(): string {", color: CODE_FG },
  { text: "    return `${this.year} ${this.make} ${this.model}`;", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  // Polymorphic — overridden in subclasses", color: CODE_COMMENT },
  { text: "  getFuelInfo(): string {", color: CODE_FG },
  { text: "    return `Fuel: ${this.fuelType}`;", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  toJSON() {", color: CODE_FG },
  { text: "    return { id: this.id, registrationNumber: this.registrationNumber,", color: CODE_FG },
  { text: "             make: this.make, model: this.model, year: this.year,", color: CODE_FG },
  { text: "             color: this.color, fuelType: this.fuelType,", color: CODE_FG },
  { text: "             status: this._status, mileageKm: this._mileageKm,", color: CODE_FG },
  { text: "             vehicleTypeId: this.vehicleTypeId, ownerId: this.ownerId };", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "}", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "// ─── Inheritance: ElectricVehicle extends Vehicle ────────────────", color: CODE_COMMENT },
  { text: "class ElectricVehicle extends Vehicle {", color: CODE_FG },
  { text: "  private _batteryRangeKm: number;", color: CODE_FG },
  { text: "  private _chargePercent:  number;", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  constructor(data: IVehicle, batteryRangeKm: number, chargePercent: number) {", color: CODE_FG },
  { text: "    super({ ...data, fuelType: 'Electric' });", color: CODE_FG },
  { text: "    this._batteryRangeKm = batteryRangeKm;", color: CODE_FG },
  { text: "    this._chargePercent  = chargePercent;", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  // Polymorphism — overrides parent method", color: CODE_COMMENT },
  { text: "  getFuelInfo(): string {", color: CODE_FG },
  { text: "    return `Battery: ${this._chargePercent}% | Range: ${this._batteryRangeKm} km`;", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  charge(percent: number): void {", color: CODE_FG },
  { text: "    this._chargePercent = Math.min(100, this._chargePercent + percent);", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "}", color: CODE_FG },
]);

// ── 6. BOOKING CLASS ───────────────────────────────────────────────────────
sectionHeader("6.  Booking Class — Business Logic");

codeBlock([
  { text: "class Booking extends Entity implements IBooking {", color: CODE_FG },
  { text: "  readonly vehicleId:  number;", color: CODE_FG },
  { text: "  readonly customerId: number;", color: CODE_FG },
  { text: "  readonly startDate:  Date;", color: CODE_FG },
  { text: "  readonly endDate:    Date;", color: CODE_FG },
  { text: "  readonly purpose:    string;", color: CODE_FG },
  { text: "  readonly notes?:     string;", color: CODE_FG },
  { text: "  private _status:     BookingStatus;", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  constructor(data: IBooking) {", color: CODE_FG },
  { text: "    super(data.id, data.createdAt);", color: CODE_FG },
  { text: "    if (data.startDate >= data.endDate)", color: CODE_FG },
  { text: "      throw new Error('Start date must be before end date');", color: CODE_FG },
  { text: "    this.vehicleId  = data.vehicleId;", color: CODE_FG },
  { text: "    this.customerId = data.customerId;", color: CODE_FG },
  { text: "    this.startDate  = data.startDate;", color: CODE_FG },
  { text: "    this.endDate    = data.endDate;", color: CODE_FG },
  { text: "    this.purpose    = data.purpose;", color: CODE_FG },
  { text: "    this.notes      = data.notes;", color: CODE_FG },
  { text: "    this._status    = data.status;", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  get status() { return this._status; }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  // Business logic — total duration", color: CODE_COMMENT },
  { text: "  getTotalDays(): number {", color: CODE_FG },
  { text: "    const ms = this.endDate.getTime() - this.startDate.getTime();", color: CODE_FG },
  { text: "    return Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1;", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  // Business logic — allowed transitions", color: CODE_COMMENT },
  { text: "  canCancel():   boolean { return this._status === 'Pending' || this._status === 'Active'; }", color: CODE_FG },
  { text: "  canComplete(): boolean { return this._status === 'Active'; }", color: CODE_FG },
  { text: "  canConfirm():  boolean { return this._status === 'Pending'; }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  confirm():  void { if (!this.canConfirm())  throw new Error('Cannot confirm');  this._status = 'Active'; }", color: CODE_FG },
  { text: "  complete(): void { if (!this.canComplete()) throw new Error('Cannot complete'); this._status = 'Completed'; }", color: CODE_FG },
  { text: "  cancel():   void { if (!this.canCancel())   throw new Error('Cannot cancel');   this._status = 'Cancelled'; }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  toJSON() {", color: CODE_FG },
  { text: "    return { id: this.id, vehicleId: this.vehicleId, customerId: this.customerId,", color: CODE_FG },
  { text: "             startDate: this.startDate, endDate: this.endDate,", color: CODE_FG },
  { text: "             purpose: this.purpose, notes: this.notes, status: this._status,", color: CODE_FG },
  { text: "             totalDays: this.getTotalDays() };", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "}", color: CODE_FG },
]);

// ── 7. BOOKING MANAGER (Service Layer) ────────────────────────────────────
sectionHeader("7.  BookingManager — Service / Logic Layer");

codeBlock([
  { text: "// ─── Service class: orchestrates bookings & availability ─────────", color: CODE_COMMENT },
  { text: "class BookingManager {", color: CODE_FG },
  { text: "  private bookings: Map<number, Booking> = new Map();", color: CODE_FG },
  { text: "  private vehicles: Map<number, Vehicle> = new Map();", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  registerVehicle(vehicle: Vehicle): void {", color: CODE_FG },
  { text: "    this.vehicles.set(vehicle.id, vehicle);", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  // Availability check — core business logic", color: CODE_COMMENT },
  { text: "  isVehicleAvailable(vehicleId: number, start: Date, end: Date): boolean {", color: CODE_FG },
  { text: "    const vehicle = this.vehicles.get(vehicleId);", color: CODE_FG },
  { text: "    if (!vehicle || !vehicle.isAvailable()) return false;", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "    const conflicts = [...this.bookings.values()].filter(b =>", color: CODE_FG },
  { text: "      b.vehicleId === vehicleId &&", color: CODE_FG },
  { text: "      (b.status === 'Pending' || b.status === 'Active') &&", color: CODE_FG },
  { text: "      b.startDate <= end && b.endDate >= start           // overlap check", color: CODE_FG },
  { text: "    );", color: CODE_FG },
  { text: "    return conflicts.length === 0;", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  // Create booking with conflict guard", color: CODE_COMMENT },
  { text: "  createBooking(data: IBooking): Booking {", color: CODE_FG },
  { text: "    if (!this.isVehicleAvailable(data.vehicleId, data.startDate, data.endDate))", color: CODE_FG },
  { text: "      throw new Error('Vehicle is not available for the selected dates');", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "    const booking = new Booking(data);", color: CODE_FG },
  { text: "    this.bookings.set(booking.id, booking);", color: CODE_FG },
  { text: "    return booking;", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  // Confirm booking → vehicle goes 'On Trip'", color: CODE_COMMENT },
  { text: "  confirmBooking(bookingId: number): void {", color: CODE_FG },
  { text: "    const booking = this.getBookingOrThrow(bookingId);", color: CODE_FG },
  { text: "    booking.confirm();", color: CODE_FG },
  { text: "    this.vehicles.get(booking.vehicleId)?.setOnTrip();", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  // Complete booking → update mileage, vehicle back to 'Active'", color: CODE_COMMENT },
  { text: "  completeBooking(bookingId: number, returnMileageKm: number): void {", color: CODE_FG },
  { text: "    const booking = this.getBookingOrThrow(bookingId);", color: CODE_FG },
  { text: "    booking.complete();", color: CODE_FG },
  { text: "    const vehicle = this.vehicles.get(booking.vehicleId);", color: CODE_FG },
  { text: "    vehicle?.updateMileage(returnMileageKm);", color: CODE_FG },
  { text: "    vehicle?.setActive();", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  cancelBooking(bookingId: number): void {", color: CODE_FG },
  { text: "    const booking = this.getBookingOrThrow(bookingId);", color: CODE_FG },
  { text: "    booking.cancel();", color: CODE_FG },
  { text: "    this.vehicles.get(booking.vehicleId)?.setActive();", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "  private getBookingOrThrow(id: number): Booking {", color: CODE_FG },
  { text: "    const b = this.bookings.get(id);", color: CODE_FG },
  { text: "    if (!b) throw new Error(`Booking ${id} not found`);", color: CODE_FG },
  { text: "    return b;", color: CODE_FG },
  { text: "  }", color: CODE_FG },
  { text: "}", color: CODE_FG },
]);

// ── 8. USAGE EXAMPLE ──────────────────────────────────────────────────────
sectionHeader("8.  Usage Example — Putting it all together");

codeBlock([
  { text: "// ─── Instantiate domain objects ────────────────────────────────", color: CODE_COMMENT },
  { text: "const customer = new Customer({", color: CODE_FG },
  { text: "  id: 1, createdAt: new Date(),", color: CODE_FG },
  { text: "  firstName: 'Aryan', lastName: 'Jamwal',", color: CODE_FG },
  { text: "  email: 'aryan@example.com', phone: '555-0101',", color: CODE_FG },
  { text: "  address: '123 Main St', licenseNumber: 'DL-001234',", color: CODE_FG },
  { text: "});", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "// Polymorphism — ElectricVehicle behaves as Vehicle", color: CODE_COMMENT },
  { text: "const tesla = new ElectricVehicle({", color: CODE_FG },
  { text: "  id: 4, createdAt: new Date(), registrationNumber: 'PQR-3456',", color: CODE_FG },
  { text: "  make: 'Tesla', model: 'Model 3', year: 2023, color: 'Red',", color: CODE_FG },
  { text: "  fuelType: 'Electric', status: 'Active', mileageKm: 15300,", color: CODE_FG },
  { text: "  vehicleTypeId: 7, ownerId: 1,", color: CODE_FG },
  { text: "}, 580, 82);", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "console.log(tesla.getDisplayName());  // '2023 Tesla Model 3'", color: CODE_COMMENT },
  { text: "console.log(tesla.getFuelInfo());     // 'Battery: 82% | Range: 580 km'", color: CODE_COMMENT },
  { text: "", color: CODE_FG },
  { text: "const manager = new BookingManager();", color: CODE_FG },
  { text: "manager.registerVehicle(tesla);", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "const booking = manager.createBooking({", color: CODE_FG },
  { text: "  id: 1, createdAt: new Date(), vehicleId: 4, customerId: 1,", color: CODE_FG },
  { text: "  startDate: new Date('2026-05-01'), endDate: new Date('2026-05-05'),", color: CODE_FG },
  { text: "  purpose: 'Business trip', status: 'Pending',", color: CODE_FG },
  { text: "});", color: CODE_FG },
  { text: "", color: CODE_FG },
  { text: "console.log(booking.getTotalDays()); // 5", color: CODE_COMMENT },
  { text: "console.log(tesla.status);           // 'Active'", color: CODE_COMMENT },
  { text: "", color: CODE_FG },
  { text: "manager.confirmBooking(1);", color: CODE_FG },
  { text: "console.log(tesla.status);           // 'On Trip'", color: CODE_COMMENT },
  { text: "", color: CODE_FG },
  { text: "manager.completeBooking(1, 15680);   // return mileage = 15,680 km", color: CODE_FG },
  { text: "console.log(tesla.mileageKm);        // 15680", color: CODE_COMMENT },
  { text: "console.log(tesla.status);           // 'Active'", color: CODE_COMMENT },
  { text: "", color: CODE_FG },
  { text: "// Duplicate booking blocked by availability check", color: CODE_COMMENT },
  { text: "try {", color: CODE_FG },
  { text: "  manager.createBooking({ ...booking, id: 2, status: 'Pending' });", color: CODE_FG },
  { text: "} catch (e) {", color: CODE_FG },
  { text: "  console.error(e.message); // 'Vehicle is not available...'", color: CODE_COMMENT },
  { text: "}", color: CODE_FG },
]);

// ── FOOTER ─────────────────────────────────────────────────────────────────
doc.moveDown(1);
doc.rect(50, doc.y, 495, 1).fill("#E5E7EB");
doc.moveDown(0.4);
doc.fillColor(GRAY).fontSize(9).font("Helvetica")
  .text(
    `Vehicle Management System  |  OOP Design & Logic  |  TypeScript  |  ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    { align: "center" }
  );

doc.end();
output.on("finish", () => console.log("OOP PDF ready."));
