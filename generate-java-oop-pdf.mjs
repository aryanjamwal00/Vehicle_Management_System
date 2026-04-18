import PDFDocument from "pdfkit";
import fs from "fs";

const doc = new PDFDocument({ margin: 50, size: "A4" });
const output = fs.createWriteStream("VehicleManagementSystem_Java_OOP.pdf");
doc.pipe(output);

const PRIMARY  = "#B45309";
const DARK     = "#1C1917";
const GRAY     = "#78716C";
const CODE_BG  = "#1E1E2E";
const CODE_FG  = "#CDD6F4";
const CODE_COMMENT = "#6C7086";
const WHITE    = "#FFFFFF";

function sectionHeader(text) {
  doc.moveDown(0.5);
  if (doc.y > 750) doc.addPage();
  doc.rect(50, doc.y, 495, 28).fill(PRIMARY);
  doc.fillColor(WHITE).fontSize(12).font("Helvetica-Bold")
    .text(text, 62, doc.y - 21);
  doc.fillColor(DARK);
  doc.moveDown(0.7);
}

function codeBlock(lines) {
  const lineH = 13;
  const blockH = lines.length * lineH + 16;
  if (doc.y + blockH > 790) doc.addPage();
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

const C = CODE_FG;
const CM = CODE_COMMENT;

// ── COVER ───────────────────────────────────────────────────────────────────
doc.rect(0, 0, 612, 180).fill(PRIMARY);
doc.fillColor(WHITE).fontSize(24).font("Helvetica-Bold")
  .text("Vehicle Management System", 50, 45, { align: "center" });
doc.fontSize(13).font("Helvetica")
  .text("Java OOP Implementation", { align: "center" });
doc.fillColor("#FEF3C7").fontSize(10).moveDown(0.5)
  .text("Interfaces · Abstract Classes · Inheritance · Encapsulation · Polymorphism", { align: "center" });
doc.y = 200; doc.fillColor(DARK);

// ── 1. ENUMS ────────────────────────────────────────────────────────────────
sectionHeader("1.  Enums");

codeBlock([
  { text: "public enum VehicleStatus {", color: C },
  { text: "    ACTIVE, ON_TRIP, UNDER_MAINTENANCE, INACTIVE", color: C },
  { text: "}", color: C },
  { text: "", color: C },
  { text: "public enum FuelType {", color: C },
  { text: "    PETROL, DIESEL, ELECTRIC, HYBRID", color: C },
  { text: "}", color: C },
  { text: "", color: C },
  { text: "public enum BookingStatus {", color: C },
  { text: "    PENDING, ACTIVE, COMPLETED, CANCELLED", color: C },
  { text: "}", color: C },
]);

// ── 2. INTERFACES ────────────────────────────────────────────────────────────
sectionHeader("2.  Interfaces");

codeBlock([
  { text: "// Base entity contract", color: CM },
  { text: "public interface IEntity {", color: C },
  { text: "    int getId();", color: C },
  { text: "    java.time.LocalDateTime getCreatedAt();", color: C },
  { text: "}", color: C },
  { text: "", color: C },
  { text: "public interface ICustomer extends IEntity {", color: C },
  { text: "    String getFirstName();", color: C },
  { text: "    String getLastName();", color: C },
  { text: "    String getEmail();", color: C },
  { text: "    String getPhone();", color: C },
  { text: "    String getAddress();", color: C },
  { text: "    String getLicenseNumber();", color: C },
  { text: "    String getFullName();           // Business method", color: C },
  { text: "}", color: C },
  { text: "", color: C },
  { text: "public interface IVehicle extends IEntity {", color: C },
  { text: "    String  getRegistrationNumber();", color: C },
  { text: "    String  getMake();", color: C },
  { text: "    String  getModel();", color: C },
  { text: "    int     getYear();", color: C },
  { text: "    String  getColor();", color: C },
  { text: "    FuelType   getFuelType();", color: C },
  { text: "    VehicleStatus getStatus();", color: C },
  { text: "    double  getMileageKm();", color: C },
  { text: "    boolean isAvailable();", color: C },
  { text: "    void    updateMileage(double km);", color: C },
  { text: "    String  getDisplayName();", color: C },
  { text: "    String  getFuelInfo();           // Polymorphic", color: C },
  { text: "}", color: C },
  { text: "", color: C },
  { text: "public interface IBooking extends IEntity {", color: C },
  { text: "    int  getVehicleId();", color: C },
  { text: "    int  getCustomerId();", color: C },
  { text: "    java.time.LocalDate getStartDate();", color: C },
  { text: "    java.time.LocalDate getEndDate();", color: C },
  { text: "    String getPurpose();", color: C },
  { text: "    BookingStatus getStatus();", color: C },
  { text: "    long    getTotalDays();", color: C },
  { text: "    boolean canCancel();", color: C },
  { text: "    boolean canComplete();", color: C },
  { text: "}", color: C },
]);

// ── 3. ABSTRACT BASE CLASS ───────────────────────────────────────────────────
sectionHeader("3.  Abstract Base Class — Entity");

codeBlock([
  { text: "import java.time.LocalDateTime;", color: C },
  { text: "", color: C },
  { text: "public abstract class Entity implements IEntity {", color: C },
  { text: "", color: C },
  { text: "    private final int           id;", color: C },
  { text: "    private final LocalDateTime createdAt;", color: C },
  { text: "", color: C },
  { text: "    protected Entity(int id) {", color: C },
  { text: "        this.id        = id;", color: C },
  { text: "        this.createdAt = LocalDateTime.now();", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    protected Entity(int id, LocalDateTime createdAt) {", color: C },
  { text: "        this.id        = id;", color: C },
  { text: "        this.createdAt = createdAt;", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    @Override public int           getId()        { return id; }", color: C },
  { text: "    @Override public LocalDateTime getCreatedAt() { return createdAt; }", color: C },
  { text: "", color: C },
  { text: "    // Shared equality — two entities are equal if same class & id", color: CM },
  { text: "    @Override", color: C },
  { text: "    public boolean equals(Object o) {", color: C },
  { text: "        if (this == o) return true;", color: C },
  { text: "        if (o == null || getClass() != o.getClass()) return false;", color: C },
  { text: "        return id == ((Entity) o).id;", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    @Override public int hashCode() { return Integer.hashCode(id); }", color: C },
  { text: "", color: C },
  { text: "    // Every entity must implement serialisation", color: CM },
  { text: "    public abstract String toJson();", color: C },
  { text: "}", color: C },
]);

// ── 4. CUSTOMER CLASS ─────────────────────────────────────────────────────────
sectionHeader("4.  Customer Class — Encapsulation & Validation");

codeBlock([
  { text: "public class Customer extends Entity implements ICustomer {", color: C },
  { text: "", color: C },
  { text: "    // Private fields — encapsulation", color: CM },
  { text: "    private String firstName;", color: C },
  { text: "    private String lastName;", color: C },
  { text: "    private String email;", color: C },
  { text: "    private String phone;", color: C },
  { text: "    private String address;", color: C },
  { text: "    private String licenseNumber;", color: C },
  { text: "", color: C },
  { text: "    public Customer(int id, String firstName, String lastName,", color: C },
  { text: "                    String email, String phone,", color: C },
  { text: "                    String address, String licenseNumber) {", color: C },
  { text: "        super(id);", color: C },
  { text: "        this.firstName     = validateName(firstName, \"First name\");", color: C },
  { text: "        this.lastName      = validateName(lastName,  \"Last name\");", color: C },
  { text: "        this.email         = validateEmail(email);", color: C },
  { text: "        this.phone         = phone;", color: C },
  { text: "        this.address       = address;", color: C },
  { text: "        this.licenseNumber = licenseNumber;", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    // Getters — controlled read access", color: CM },
  { text: "    @Override public String getFirstName()     { return firstName; }", color: C },
  { text: "    @Override public String getLastName()      { return lastName; }", color: C },
  { text: "    @Override public String getEmail()         { return email; }", color: C },
  { text: "    @Override public String getPhone()         { return phone; }", color: C },
  { text: "    @Override public String getAddress()       { return address; }", color: C },
  { text: "    @Override public String getLicenseNumber() { return licenseNumber; }", color: C },
  { text: "", color: C },
  { text: "    // Setters with validation", color: CM },
  { text: "    public void setEmail(String email) { this.email = validateEmail(email); }", color: C },
  { text: "", color: C },
  { text: "    @Override", color: C },
  { text: "    public String getFullName() {", color: C },
  { text: "        return firstName + \" \" + lastName;", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    // Private validation helpers", color: CM },
  { text: "    private String validateName(String name, String field) {", color: C },
  { text: "        if (name == null || name.trim().length() < 2)", color: C },
  { text: "            throw new IllegalArgumentException(field + \" must be >= 2 chars\");", color: C },
  { text: "        return name.trim();", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    private String validateEmail(String email) {", color: C },
  { text: "        if (email == null || !email.matches(\"^[^@\\\\s]+@[^@\\\\s]+\\\\.[^@\\\\s]+$\"))", color: C },
  { text: "            throw new IllegalArgumentException(\"Invalid email: \" + email);", color: C },
  { text: "        return email.toLowerCase();", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    @Override", color: C },
  { text: "    public String toJson() {", color: C },
  { text: "        return String.format(", color: C },
  { text: "            \"{\\\"id\\\":%d,\\\"firstName\\\":\\\"%s\\\",\\\"lastName\\\":\\\"%s\\\",\\\"email\\\":\\\"%s\\\"}\",", color: C },
  { text: "            getId(), firstName, lastName, email);", color: C },
  { text: "    }", color: C },
  { text: "}", color: C },
]);

// ── 5. VEHICLE CLASS ──────────────────────────────────────────────────────────
sectionHeader("5.  Vehicle Class — Base for Inheritance");

codeBlock([
  { text: "public class Vehicle extends Entity implements IVehicle {", color: C },
  { text: "", color: C },
  { text: "    private  final String registrationNumber;", color: C },
  { text: "    private  final String make;", color: C },
  { text: "    private  final String model;", color: C },
  { text: "    private  final int    year;", color: C },
  { text: "    private  final String color;", color: C },
  { text: "    private  final FuelType fuelType;", color: C },
  { text: "    protected VehicleStatus status;    // protected → accessible in subclasses", color: C },
  { text: "    protected double mileageKm;", color: C },
  { text: "    private  final int vehicleTypeId;", color: C },
  { text: "    private  final int ownerId;", color: C },
  { text: "", color: C },
  { text: "    public Vehicle(int id, String regNum, String make, String model,", color: C },
  { text: "                   int year, String color, FuelType fuelType,", color: C },
  { text: "                   VehicleStatus status, double mileageKm,", color: C },
  { text: "                   int vehicleTypeId, int ownerId) {", color: C },
  { text: "        super(id);", color: C },
  { text: "        this.registrationNumber = regNum.toUpperCase();", color: C },
  { text: "        this.make          = make;", color: C },
  { text: "        this.model         = model;", color: C },
  { text: "        this.year          = year;", color: C },
  { text: "        this.color         = color;", color: C },
  { text: "        this.fuelType      = fuelType;", color: C },
  { text: "        this.status        = status;", color: C },
  { text: "        this.mileageKm     = mileageKm;", color: C },
  { text: "        this.vehicleTypeId = vehicleTypeId;", color: C },
  { text: "        this.ownerId       = ownerId;", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    @Override public String        getRegistrationNumber() { return registrationNumber; }", color: C },
  { text: "    @Override public String        getMake()               { return make; }", color: C },
  { text: "    @Override public String        getModel()              { return model; }", color: C },
  { text: "    @Override public int           getYear()               { return year; }", color: C },
  { text: "    @Override public String        getColor()              { return color; }", color: C },
  { text: "    @Override public FuelType      getFuelType()           { return fuelType; }", color: C },
  { text: "    @Override public VehicleStatus getStatus()             { return status; }", color: C },
  { text: "    @Override public double        getMileageKm()          { return mileageKm; }", color: C },
  { text: "             public int            getVehicleTypeId()      { return vehicleTypeId; }", color: C },
  { text: "             public int            getOwnerId()            { return ownerId; }", color: C },
  { text: "", color: C },
  { text: "    @Override", color: C },
  { text: "    public boolean isAvailable() {", color: C },
  { text: "        return status == VehicleStatus.ACTIVE;", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    @Override", color: C },
  { text: "    public void updateMileage(double km) {", color: C },
  { text: "        if (km < mileageKm)", color: C },
  { text: "            throw new IllegalArgumentException(", color: C },
  { text: "                \"New mileage (\" + km + \") < current (\" + mileageKm + \")\");", color: C },
  { text: "        this.mileageKm = km;", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    public void setOnTrip()      { this.status = VehicleStatus.ON_TRIP; }", color: C },
  { text: "    public void setActive()      { this.status = VehicleStatus.ACTIVE; }", color: C },
  { text: "    public void setMaintenance() { this.status = VehicleStatus.UNDER_MAINTENANCE; }", color: C },
  { text: "", color: C },
  { text: "    @Override", color: C },
  { text: "    public String getDisplayName() {", color: C },
  { text: "        return year + \" \" + make + \" \" + model;", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    // Polymorphic method — overridden in subclasses", color: CM },
  { text: "    @Override", color: C },
  { text: "    public String getFuelInfo() {", color: C },
  { text: "        return \"Fuel: \" + fuelType;", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    @Override", color: C },
  { text: "    public String toJson() {", color: C },
  { text: "        return String.format(", color: C },
  { text: "            \"{\\\"id\\\":%d,\\\"reg\\\":\\\"%s\\\",\\\"make\\\":\\\"%s\\\",", color: C },
  { text: "             \\\"model\\\":\\\"%s\\\",\\\"status\\\":\\\"%s\\\",\\\"mileage\\\":%.1f}\",", color: C },
  { text: "            getId(), registrationNumber, make, model, status, mileageKm);", color: C },
  { text: "    }", color: C },
  { text: "}", color: C },
]);

// ── 6. ELECTRIC VEHICLE (INHERITANCE) ────────────────────────────────────────
sectionHeader("6.  ElectricVehicle — Inheritance & Polymorphism");

codeBlock([
  { text: "// Inherits all Vehicle behaviour, adds battery-specific logic", color: CM },
  { text: "public class ElectricVehicle extends Vehicle {", color: C },
  { text: "", color: C },
  { text: "    private double batteryRangeKm;", color: C },
  { text: "    private int    chargePercent;", color: C },
  { text: "", color: C },
  { text: "    public ElectricVehicle(int id, String regNum, String make, String model,", color: C },
  { text: "                           int year, String color,", color: C },
  { text: "                           VehicleStatus status, double mileageKm,", color: C },
  { text: "                           int vehicleTypeId, int ownerId,", color: C },
  { text: "                           double batteryRangeKm, int chargePercent) {", color: C },
  { text: "        // Always Electric fuel type", color: CM },
  { text: "        super(id, regNum, make, model, year, color,", color: C },
  { text: "              FuelType.ELECTRIC, status, mileageKm, vehicleTypeId, ownerId);", color: C },
  { text: "        this.batteryRangeKm = batteryRangeKm;", color: C },
  { text: "        this.chargePercent  = chargePercent;", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    public double getBatteryRangeKm() { return batteryRangeKm; }", color: C },
  { text: "    public int    getChargePercent()  { return chargePercent; }", color: C },
  { text: "", color: C },
  { text: "    // Polymorphism — overrides Vehicle.getFuelInfo()", color: CM },
  { text: "    @Override", color: C },
  { text: "    public String getFuelInfo() {", color: C },
  { text: "        return String.format(\"Battery: %d%% | Range: %.0f km\",", color: C },
  { text: "                            chargePercent, batteryRangeKm);", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    public void charge(int percent) {", color: C },
  { text: "        this.chargePercent = Math.min(100, chargePercent + percent);", color: C },
  { text: "    }", color: C },
  { text: "}", color: C },
]);

// ── 7. BOOKING CLASS ──────────────────────────────────────────────────────────
sectionHeader("7.  Booking Class — Business Logic & State Machine");

codeBlock([
  { text: "import java.time.LocalDate;", color: C },
  { text: "import java.time.temporal.ChronoUnit;", color: C },
  { text: "", color: C },
  { text: "public class Booking extends Entity implements IBooking {", color: C },
  { text: "", color: C },
  { text: "    private final int       vehicleId;", color: C },
  { text: "    private final int       customerId;", color: C },
  { text: "    private final LocalDate startDate;", color: C },
  { text: "    private final LocalDate endDate;", color: C },
  { text: "    private final String    purpose;", color: C },
  { text: "    private       String    notes;", color: C },
  { text: "    private       BookingStatus status;", color: C },
  { text: "", color: C },
  { text: "    public Booking(int id, int vehicleId, int customerId,", color: C },
  { text: "                   LocalDate startDate, LocalDate endDate,", color: C },
  { text: "                   String purpose, String notes, BookingStatus status) {", color: C },
  { text: "        super(id);", color: C },
  { text: "        if (!startDate.isBefore(endDate))", color: C },
  { text: "            throw new IllegalArgumentException(\"Start must be before end date\");", color: C },
  { text: "        this.vehicleId  = vehicleId;", color: C },
  { text: "        this.customerId = customerId;", color: C },
  { text: "        this.startDate  = startDate;", color: C },
  { text: "        this.endDate    = endDate;", color: C },
  { text: "        this.purpose    = purpose;", color: C },
  { text: "        this.notes      = notes;", color: C },
  { text: "        this.status     = status;", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    @Override public int          getVehicleId()  { return vehicleId; }", color: C },
  { text: "    @Override public int          getCustomerId() { return customerId; }", color: C },
  { text: "    @Override public LocalDate    getStartDate()  { return startDate; }", color: C },
  { text: "    @Override public LocalDate    getEndDate()    { return endDate; }", color: C },
  { text: "    @Override public String       getPurpose()    { return purpose; }", color: C },
  { text: "    @Override public BookingStatus getStatus()    { return status; }", color: C },
  { text: "", color: C },
  { text: "    @Override", color: C },
  { text: "    public long getTotalDays() {", color: C },
  { text: "        return ChronoUnit.DAYS.between(startDate, endDate) + 1;", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    // State transition guards", color: CM },
  { text: "    @Override public boolean canCancel()   { return status == BookingStatus.PENDING", color: C },
  { text: "                                                  || status == BookingStatus.ACTIVE; }", color: C },
  { text: "    @Override public boolean canComplete() { return status == BookingStatus.ACTIVE; }", color: C },
  { text: "             public boolean canConfirm()   { return status == BookingStatus.PENDING; }", color: C },
  { text: "", color: C },
  { text: "    public void confirm() {", color: C },
  { text: "        if (!canConfirm()) throw new IllegalStateException(\"Cannot confirm booking\");", color: C },
  { text: "        this.status = BookingStatus.ACTIVE;", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    public void complete() {", color: C },
  { text: "        if (!canComplete()) throw new IllegalStateException(\"Cannot complete booking\");", color: C },
  { text: "        this.status = BookingStatus.COMPLETED;", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    public void cancel() {", color: C },
  { text: "        if (!canCancel()) throw new IllegalStateException(\"Cannot cancel booking\");", color: C },
  { text: "        this.status = BookingStatus.CANCELLED;", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    @Override", color: C },
  { text: "    public String toJson() {", color: C },
  { text: "        return String.format(", color: C },
  { text: "            \"{\\\"id\\\":%d,\\\"vehicleId\\\":%d,\\\"customerId\\\":%d,", color: C },
  { text: "             \\\"status\\\":\\\"%s\\\",\\\"totalDays\\\":%d}\",", color: C },
  { text: "            getId(), vehicleId, customerId, status, getTotalDays());", color: C },
  { text: "    }", color: C },
  { text: "}", color: C },
]);

// ── 8. BOOKING MANAGER ─────────────────────────────────────────────────────────
sectionHeader("8.  BookingManager — Service / Logic Layer");

codeBlock([
  { text: "import java.time.LocalDate;", color: C },
  { text: "import java.util.HashMap;", color: C },
  { text: "import java.util.Map;", color: C },
  { text: "", color: C },
  { text: "public class BookingManager {", color: C },
  { text: "", color: C },
  { text: "    private final Map<Integer, Booking> bookings = new HashMap<>();", color: C },
  { text: "    private final Map<Integer, Vehicle> vehicles = new HashMap<>();", color: C },
  { text: "", color: C },
  { text: "    public void registerVehicle(Vehicle v) {", color: C },
  { text: "        vehicles.put(v.getId(), v);", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    // Availability check — core business logic", color: CM },
  { text: "    public boolean isVehicleAvailable(int vehicleId,", color: C },
  { text: "                                      LocalDate start, LocalDate end) {", color: C },
  { text: "        Vehicle v = vehicles.get(vehicleId);", color: C },
  { text: "        if (v == null || !v.isAvailable()) return false;", color: C },
  { text: "", color: C },
  { text: "        for (Booking b : bookings.values()) {", color: C },
  { text: "            if (b.getVehicleId() == vehicleId", color: C },
  { text: "                    && (b.getStatus() == BookingStatus.PENDING", color: C },
  { text: "                        || b.getStatus() == BookingStatus.ACTIVE)", color: C },
  { text: "                    && !b.getStartDate().isAfter(end)    // overlap check", color: C },
  { text: "                    && !b.getEndDate().isBefore(start)) {", color: C },
  { text: "                return false;  // conflict found", color: CM },
  { text: "            }", color: C },
  { text: "        }", color: C },
  { text: "        return true;", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    // Create booking with conflict guard", color: CM },
  { text: "    public Booking createBooking(int id, int vehicleId, int customerId,", color: C },
  { text: "                                 LocalDate start, LocalDate end,", color: C },
  { text: "                                 String purpose, String notes) {", color: C },
  { text: "        if (!isVehicleAvailable(vehicleId, start, end))", color: C },
  { text: "            throw new IllegalStateException(", color: C },
  { text: "                \"Vehicle not available for selected dates\");", color: C },
  { text: "        Booking b = new Booking(id, vehicleId, customerId,", color: C },
  { text: "                               start, end, purpose, notes, BookingStatus.PENDING);", color: C },
  { text: "        bookings.put(b.getId(), b);", color: C },
  { text: "        return b;", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    // Confirm → vehicle goes ON_TRIP", color: CM },
  { text: "    public void confirmBooking(int bookingId) {", color: C },
  { text: "        Booking b = getBookingOrThrow(bookingId);", color: C },
  { text: "        b.confirm();", color: C },
  { text: "        Vehicle v = vehicles.get(b.getVehicleId());", color: C },
  { text: "        if (v != null) v.setOnTrip();", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    // Complete → update mileage, vehicle back to ACTIVE", color: CM },
  { text: "    public void completeBooking(int bookingId, double returnMileageKm) {", color: C },
  { text: "        Booking b = getBookingOrThrow(bookingId);", color: C },
  { text: "        b.complete();", color: C },
  { text: "        Vehicle v = vehicles.get(b.getVehicleId());", color: C },
  { text: "        if (v != null) {", color: C },
  { text: "            v.updateMileage(returnMileageKm);", color: C },
  { text: "            v.setActive();", color: C },
  { text: "        }", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    public void cancelBooking(int bookingId) {", color: C },
  { text: "        Booking b = getBookingOrThrow(bookingId);", color: C },
  { text: "        b.cancel();", color: C },
  { text: "        Vehicle v = vehicles.get(b.getVehicleId());", color: C },
  { text: "        if (v != null) v.setActive();", color: C },
  { text: "    }", color: C },
  { text: "", color: C },
  { text: "    private Booking getBookingOrThrow(int id) {", color: C },
  { text: "        Booking b = bookings.get(id);", color: C },
  { text: "        if (b == null) throw new IllegalArgumentException(\"Booking \" + id + \" not found\");", color: C },
  { text: "        return b;", color: C },
  { text: "    }", color: C },
  { text: "}", color: C },
]);

// ── 9. MAIN CLASS (DEMO) ───────────────────────────────────────────────────────
sectionHeader("9.  Main.java — Demo / Entry Point");

codeBlock([
  { text: "import java.time.LocalDate;", color: C },
  { text: "", color: C },
  { text: "public class Main {", color: C },
  { text: "    public static void main(String[] args) {", color: C },
  { text: "", color: C },
  { text: "        // --- Customer ---", color: CM },
  { text: "        Customer aryan = new Customer(1, \"Aryan\", \"Jamwal\",", color: C },
  { text: "            \"aryan@example.com\", \"555-0101\",", color: C },
  { text: "            \"123 Main St\", \"DL-001234\");", color: C },
  { text: "        System.out.println(aryan.getFullName()); // Aryan Jamwal", color: CM },
  { text: "", color: C },
  { text: "        // --- ElectricVehicle (polymorphism) ---", color: CM },
  { text: "        ElectricVehicle tesla = new ElectricVehicle(", color: C },
  { text: "            4, \"PQR-3456\", \"Tesla\", \"Model 3\", 2023, \"Red\",", color: C },
  { text: "            VehicleStatus.ACTIVE, 15300.0, 7, 1, 580.0, 82);", color: C },
  { text: "", color: C },
  { text: "        System.out.println(tesla.getDisplayName());", color: CM },
  { text: "        // 2023 Tesla Model 3", color: CM },
  { text: "        System.out.println(tesla.getFuelInfo());", color: CM },
  { text: "        // Battery: 82% | Range: 580 km", color: CM },
  { text: "", color: C },
  { text: "        // --- BookingManager ---", color: CM },
  { text: "        BookingManager mgr = new BookingManager();", color: C },
  { text: "        mgr.registerVehicle(tesla);", color: C },
  { text: "", color: C },
  { text: "        Booking booking = mgr.createBooking(1, 4, 1,", color: C },
  { text: "            LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 5),", color: C },
  { text: "            \"Business trip\", null);", color: C },
  { text: "", color: C },
  { text: "        System.out.println(booking.getTotalDays()); // 5", color: CM },
  { text: "        System.out.println(tesla.getStatus());      // ACTIVE", color: CM },
  { text: "", color: C },
  { text: "        mgr.confirmBooking(1);", color: C },
  { text: "        System.out.println(tesla.getStatus());      // ON_TRIP", color: CM },
  { text: "", color: C },
  { text: "        mgr.completeBooking(1, 15680.0);", color: C },
  { text: "        System.out.println(tesla.getMileageKm());   // 15680.0", color: CM },
  { text: "        System.out.println(tesla.getStatus());      // ACTIVE", color: CM },
  { text: "", color: C },
  { text: "        // Duplicate booking blocked", color: CM },
  { text: "        try {", color: C },
  { text: "            mgr.createBooking(2, 4, 1,", color: C },
  { text: "                LocalDate.of(2026, 5, 2), LocalDate.of(2026, 5, 4),", color: C },
  { text: "                \"Overlap test\", null);", color: C },
  { text: "        } catch (IllegalStateException e) {", color: C },
  { text: "            System.out.println(e.getMessage());", color: CM },
  { text: "            // Vehicle not available for selected dates", color: CM },
  { text: "        }", color: C },
  { text: "    }", color: C },
  { text: "}", color: C },
]);

// ── FOOTER ─────────────────────────────────────────────────────────────────────
doc.moveDown(1);
doc.rect(50, doc.y, 495, 1).fill("#E5E7EB");
doc.moveDown(0.4);
doc.fillColor(GRAY).fontSize(9).font("Helvetica")
  .text(
    `Vehicle Management System  |  Java OOP  |  Interfaces · Inheritance · Encapsulation · Polymorphism  |  ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    { align: "center" }
  );

doc.end();
output.on("finish", () => console.log("Java OOP PDF ready."));
