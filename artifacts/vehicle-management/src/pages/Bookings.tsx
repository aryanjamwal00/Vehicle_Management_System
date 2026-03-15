import React, { useState } from "react";
import { 
  useListBookings, 
  useCreateBooking, 
  useUpdateBookingStatus, 
  useListVehicles, 
  useListCustomers,
  getCheckVehicleAvailabilityUrl
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { CalendarDays, Plus, CheckCircle, XCircle, PlayCircle, Search } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDate } from "@/lib/utils";

const bookingSchema = z.object({
  vehicleId: z.coerce.number().min(1, "Vehicle is required"),
  customerId: z.coerce.number().min(1, "Customer is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  purpose: z.string().min(3, "Purpose is required"),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function Bookings() {
  const queryClient = useQueryClient();
  const { data: bookings = [], isLoading: loadingBookings } = useListBookings();
  const { data: vehicles = [] } = useListVehicles();
  const { data: customers = [] } = useListCustomers();
  
  const createBooking = useCreateBooking();
  const updateStatus = useUpdateBookingStatus();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [availabilityError, setAvailabilityError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  // Status Modals
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [returnMileage, setReturnMileage] = useState("");

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema)
  });

  const selectedVehicleId = useWatch({ control, name: "vehicleId" });
  const selectedStartDate = useWatch({ control, name: "startDate" });
  const selectedEndDate = useWatch({ control, name: "endDate" });

  const filteredBookings = bookings
    .filter(b => filter === "All" || b.status === filter)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const openNewModal = () => {
    reset({ vehicleId: 0, customerId: 0, startDate: "", endDate: "", purpose: "", notes: "" });
    setAvailabilityError("");
    setIsModalOpen(true);
  };

  const onSubmit = async (data: BookingFormData) => {
    setAvailabilityError("");
    setIsChecking(true);
    
    try {
      const url = getCheckVehicleAvailabilityUrl(data.vehicleId, { startDate: data.startDate, endDate: data.endDate });
      const res = await fetch(url);
      const availData = await res.json();
      
      if (!availData.available) {
        setAvailabilityError("Vehicle is not available for these dates.");
        setIsChecking(false);
        return;
      }

      createBooking.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
            setIsModalOpen(false);
          },
          onError: (err: any) => setAvailabilityError(err.message || "Failed to create booking")
        }
      );
    } catch (e) {
      setAvailabilityError("Failed to check availability");
    } finally {
      setIsChecking(false);
    }
  };

  const handleStatusChange = (id: number, status: string, mileageOnReturn?: number) => {
    updateStatus.mutate(
      { id, data: { status, mileageOnReturn } },
      { 
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
          queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
          setCompletingId(null);
          setReturnMileage("");
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground mt-1">Manage reservations and vehicle assignments</p>
        </div>
        <Button onClick={openNewModal} className="gap-2">
          <Plus size={18} /> New Booking
        </Button>
      </div>

      <Card className="glass-panel p-2 flex gap-2 overflow-x-auto">
        {["All", "Pending", "Active", "Completed", "Cancelled"].map(f => (
          <Button 
            key={f} 
            variant={filter === f ? "default" : "ghost"} 
            onClick={() => setFilter(f)}
            className="rounded-lg"
          >
            {f}
          </Button>
        ))}
      </Card>

      <Card className="glass-panel shadow-lg overflow-hidden">
        {loadingBookings ? (
          <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Vehicle</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Dates & Duration</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 bg-white/50">
                {filteredBookings.map(b => (
                  <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-muted-foreground">#{b.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">{b.vehicleName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{b.registrationNumber}</p>
                    </td>
                    <td className="px-6 py-4 font-medium">{b.customerName}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{formatDate(b.startDate)} - {formatDate(b.endDate)}</p>
                      <p className="text-xs text-muted-foreground">{b.totalDays} days • {b.purpose}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                        b.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        b.status === 'Active' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        b.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {b.status === "Pending" && (
                          <>
                            <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50" onClick={() => handleStatusChange(b.id, "Active")} title="Confirm">
                              <PlayCircle size={16} />
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleStatusChange(b.id, "Cancelled")} title="Cancel">
                              <XCircle size={16} />
                            </Button>
                          </>
                        )}
                        {b.status === "Active" && (
                          <>
                            <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-600 hover:bg-emerald-50" onClick={() => setCompletingId(b.id)} title="Complete">
                              <CheckCircle size={16} />
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleStatusChange(b.id, "Cancelled")} title="Cancel">
                              <XCircle size={16} />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No bookings found for the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Create New Booking"
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Customer</label>
              <select 
                {...register("customerId")}
                className="flex h-12 w-full rounded-xl border-2 border-input bg-background px-4 py-2 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                <option value="">Select Customer...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
              {errors.customerId && <p className="text-xs text-red-500">{errors.customerId.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Vehicle</label>
              <select 
                {...register("vehicleId")}
                className="flex h-12 w-full rounded-xl border-2 border-input bg-background px-4 py-2 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                <option value="">Select Vehicle...</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} ({v.registrationNumber}) - {v.mileageKm} km
                  </option>
                ))}
              </select>
              {errors.vehicleId && <p className="text-xs text-red-500">{errors.vehicleId.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Start Date</label>
              <Input type="date" {...register("startDate")} />
              {errors.startDate && <p className="text-xs text-red-500">{errors.startDate.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">End Date</label>
              <Input type="date" {...register("endDate")} />
              {errors.endDate && <p className="text-xs text-red-500">{errors.endDate.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Purpose</label>
            <Input {...register("purpose")} placeholder="e.g. Business trip, Client visit..." />
            {errors.purpose && <p className="text-xs text-red-500">{errors.purpose.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Notes (Optional)</label>
            <textarea 
              {...register("notes")} 
              className="flex w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 min-h-[80px]"
            />
          </div>

          {availabilityError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-200">
              {availabilityError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isChecking || createBooking.isPending}>
              {isChecking || createBooking.isPending ? "Processing..." : "Create Booking"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={completingId !== null}
        onClose={() => setCompletingId(null)}
        title="Complete Booking"
        description="Please provide the return mileage to complete this booking."
      >
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Return Mileage (km)</label>
            <Input 
              type="number" 
              required
              value={returnMileage}
              onChange={(e) => setReturnMileage(e.target.value)}
              className="text-xl h-14"
              placeholder="Enter final odometer reading"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setCompletingId(null)}>Cancel</Button>
            <Button 
              onClick={() => handleStatusChange(completingId!, "Completed", parseInt(returnMileage, 10))}
              disabled={!returnMileage || updateStatus.isPending}
            >
              {updateStatus.isPending ? "Saving..." : "Mark Completed"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
