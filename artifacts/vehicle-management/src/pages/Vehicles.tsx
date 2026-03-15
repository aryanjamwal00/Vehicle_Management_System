import React, { useState } from "react";
import { Link } from "wouter";
import { useListVehicles, useListCustomers, useListVehicleTypes, useCreateVehicle, useUpdateVehicle, useDeleteVehicle, useListBookings } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { Plus, Edit2, Trash2, Search, Car, Gauge, Fuel } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/Badge";

const vehicleSchema = z.object({
  registrationNumber: z.string().min(2, "Required"),
  make: z.string().min(1, "Required"),
  model: z.string().min(1, "Required"),
  year: z.coerce.number().min(1900).max(2100),
  color: z.string().min(1, "Required"),
  fuelType: z.string().min(1, "Required"),
  status: z.string().min(1, "Required"),
  mileageKm: z.coerce.number().min(0).default(0),
  vehicleTypeId: z.coerce.number().min(1, "Required"),
  customerId: z.coerce.number().min(1, "Required"),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

export default function Vehicles() {
  const queryClient = useQueryClient();
  const { data: vehicles = [], isLoading } = useListVehicles();
  const { data: customers = [] } = useListCustomers();
  const { data: types = [] } = useListVehicleTypes();
  const { data: bookings = [] } = useListBookings();
  
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema)
  });

  const filteredVehicles = vehicles.filter(v => 
    `${v.make} ${v.model} ${v.registrationNumber}`.toLowerCase().includes(search.toLowerCase())
  );

  const openNewModal = () => {
    setEditingId(null);
    reset({ make: "", model: "", registrationNumber: "", year: new Date().getFullYear(), color: "", fuelType: "Petrol", status: "Active", mileageKm: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (e: React.MouseEvent, vehicle: any) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(vehicle.id);
    reset(vehicle);
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this vehicle?")) {
      deleteVehicle.mutate(
        { id },
        { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] }) }
      );
    }
  };

  const onSubmit = (data: VehicleFormData) => {
    if (editingId) {
      updateVehicle.mutate(
        { id: editingId, data },
        { 
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
            setIsModalOpen(false);
          } 
        }
      );
    } else {
      createVehicle.mutate(
        { data },
        { 
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
            setIsModalOpen(false);
          } 
        }
      );
    }
  };

  const getAvailability = (vehicleId: number) => {
    const today = new Date().toISOString().split('T')[0];
    const activeBooking = bookings.find(b => 
      b.vehicleId === vehicleId && 
      b.status === "Active" && 
      b.startDate <= today && 
      b.endDate >= today
    );
    return activeBooking ? { status: "Booked", color: "bg-red-100 text-red-800 border-red-200" } : { status: "Available", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicles</h1>
          <p className="text-muted-foreground mt-1">Manage fleet and view details</p>
        </div>
        <Button onClick={openNewModal} className="gap-2">
          <Plus size={18} /> Register Vehicle
        </Button>
      </div>

      <Card className="p-4 glass-panel">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input 
            placeholder="Search make, model, or registration..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 max-w-md border-border/50 bg-background/50 backdrop-blur-sm"
          />
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map(vehicle => {
            const avail = getAvailability(vehicle.id);
            return (
              <Link key={vehicle.id} href={`/vehicles/${vehicle.id}`}>
                <Card className="card-hover glass-panel relative overflow-hidden group cursor-pointer h-full flex flex-col">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                    <button onClick={(e) => openEditModal(e, vehicle)} className="p-2 bg-white text-blue-600 rounded-full shadow hover:bg-blue-50 transition"><Edit2 size={16}/></button>
                    <button onClick={(e) => handleDelete(e, vehicle.id)} className="p-2 bg-white text-red-600 rounded-full shadow hover:bg-red-50 transition"><Trash2 size={16}/></button>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-primary/10 p-3 rounded-xl text-primary">
                        <Car className="h-8 w-8" />
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${avail.color}`}>
                        {vehicle.status === "Under Maintenance" ? "Maintenance" : avail.status}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-xl">{vehicle.make} {vehicle.model}</h3>
                    <div className="text-sm font-mono font-semibold text-muted-foreground mt-1 bg-muted inline-block px-2 py-1 rounded-md border">
                      {vehicle.registrationNumber}
                    </div>

                    <div className="mt-auto pt-6 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Gauge size={16}/> Mileage</span>
                        <span className="font-semibold">{vehicle.mileageKm?.toLocaleString() ?? 0} km</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Fuel size={16}/> Fuel</span>
                        <span className="font-semibold">{vehicle.fuelType}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm border-t pt-3 mt-3">
                        <span className="text-muted-foreground">Owner</span>
                        <span className="font-semibold truncate max-w-[120px]" title={vehicle.customerName}>{vehicle.customerName}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Vehicle" : "Register Vehicle"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Make</label>
              <Input {...register("make")} placeholder="e.g. Toyota" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Model</label>
              <Input {...register("model")} placeholder="e.g. Camry" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Reg. Number</label>
              <Input {...register("registrationNumber")} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Year</label>
              <Input type="number" {...register("year")} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Color</label>
              <Input {...register("color")} />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-sm font-medium">Fuel Type</label>
              <select 
                {...register("fuelType")}
                className="flex h-12 w-full rounded-xl border-2 border-input bg-background px-4 py-2 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Customer (Owner)</label>
              <select 
                {...register("customerId")}
                className="flex h-12 w-full rounded-xl border-2 border-input bg-background px-4 py-2 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                <option value="">Select...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Vehicle Type</label>
              <select 
                {...register("vehicleTypeId")}
                className="flex h-12 w-full rounded-xl border-2 border-input bg-background px-4 py-2 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                <option value="">Select...</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Status</label>
              <select 
                {...register("status")}
                className="flex h-12 w-full rounded-xl border-2 border-input bg-background px-4 py-2 text-sm focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Current Mileage (km)</label>
              <Input type="number" {...register("mileageKm")} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createVehicle.isPending || updateVehicle.isPending}>
              {createVehicle.isPending || updateVehicle.isPending ? "Saving..." : "Save Vehicle"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
