import { useState } from "react";
import { useListVehicles, useListCustomers, useListVehicleTypes, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from "@workspace/api-client-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Plus, Edit2, Trash2, Search, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

const vehicleSchema = z.object({
  registrationNumber: z.string().min(3, "Required"),
  make: z.string().min(2, "Required"),
  model: z.string().min(2, "Required"),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().min(2, "Required"),
  fuelType: z.string().min(2, "Required"),
  status: z.string().min(2, "Required"),
  vehicleTypeId: z.coerce.number().min(1, "Required"),
  customerId: z.coerce.number().min(1, "Required"),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

export default function Vehicles() {
  const { data: vehicles, isLoading: loadingVehicles } = useListVehicles();
  const { data: customers } = useListCustomers();
  const { data: types } = useListVehicleTypes();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const deleteMutation = useDeleteVehicle();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema)
  });

  const filteredVehicles = vehicles?.filter(v => {
    const matchesSearch = `${v.registrationNumber} ${v.make} ${v.model} ${v.customerName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || v.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const openAddModal = () => {
    setEditingId(null);
    reset({ 
      registrationNumber: '', make: '', model: '', year: new Date().getFullYear(), 
      color: '', fuelType: '', status: 'Active', vehicleTypeId: 0, customerId: 0 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: any) => {
    setEditingId(vehicle.id);
    reset({
      registrationNumber: vehicle.registrationNumber, make: vehicle.make, model: vehicle.model,
      year: vehicle.year, color: vehicle.color, fuelType: vehicle.fuelType, status: vehicle.status,
      vehicleTypeId: vehicle.vehicleTypeId, customerId: vehicle.customerId
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: VehicleFormValues) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
          setIsModalOpen(false);
          toast({ title: "Success", description: "Vehicle updated." });
        }
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
          setIsModalOpen(false);
          toast({ title: "Success", description: "Vehicle registered successfully." });
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this vehicle permanently?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
          toast({ title: "Success", description: "Vehicle deleted." });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Fleet Vehicles</h1>
          <p className="text-muted-foreground mt-1">Manage registration, assignments, and statuses.</p>
        </div>
        <Button onClick={openAddModal} className="shrink-0">
          <Plus className="w-5 h-5 mr-2" />
          Register Vehicle
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm flex flex-col">
        <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by registration, make, model or owner..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-48 px-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm appearance-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Under Maintenance">Under Maintenance</option>
          </select>
        </div>

        {loadingVehicles ? (
          <div className="p-12 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>
        ) : filteredVehicles?.length === 0 ? (
           <div className="p-16 text-center">
            <h3 className="text-lg font-bold text-foreground">No vehicles found</h3>
            <p className="text-muted-foreground mt-2">No matching vehicles. Try a different search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-background text-muted-foreground uppercase text-xs font-semibold tracking-wider">
                <tr className="border-b border-border">
                  <th className="px-6 py-5">Registration</th>
                  <th className="px-6 py-5">Vehicle Details</th>
                  <th className="px-6 py-5">Owner</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y border-border">
                {filteredVehicles?.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-base text-foreground bg-muted inline-block px-3 py-1 rounded-md border border-border/50 shadow-sm">
                        {vehicle.registrationNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground text-base">{vehicle.make} {vehicle.model}</div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1 gap-2">
                        <span className="font-semibold text-primary/80">{vehicle.vehicleTypeName}</span>
                        <span>•</span>
                        <span>{vehicle.year}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                           <div className="w-2.5 h-2.5 rounded-full border border-border shadow-sm" style={{backgroundColor: vehicle.color.toLowerCase()}} />
                           {vehicle.color}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{vehicle.customerName}</div>
                      <Link href={`/customers`}>
                        <span className="text-xs text-primary hover:underline cursor-pointer">View profile</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        vehicle.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        vehicle.status === 'Inactive' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/vehicles/${vehicle.id}`}>
                          <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="View Details">
                            <Info className="w-4 h-4" />
                          </button>
                        </Link>
                        <button onClick={() => openEditModal(vehicle)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(vehicle.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Vehicle" : "Register Vehicle"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select 
              label="Owner / Customer" 
              {...register("customerId")} 
              error={errors.customerId?.message}
              options={customers?.map(c => ({ label: `${c.firstName} ${c.lastName}`, value: c.id })) || []}
            />
            <Select 
              label="Vehicle Type" 
              {...register("vehicleTypeId")} 
              error={errors.vehicleTypeId?.message}
              options={types?.map(t => ({ label: t.name, value: t.id })) || []}
            />
          </div>

          <div className="border-t border-border pt-4">
             <Input label="Registration Number (Plate)" {...register("registrationNumber")} error={errors.registrationNumber?.message} className="font-mono text-lg uppercase" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Make (Brand)" {...register("make")} error={errors.make?.message} />
            <Input label="Model" {...register("model")} error={errors.model?.message} />
            <Input type="number" label="Year" {...register("year")} error={errors.year?.message} />
            <Input label="Color" {...register("color")} error={errors.color?.message} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Fuel Type" 
              {...register("fuelType")} 
              error={errors.fuelType?.message}
              options={[
                {label: "Petrol", value: "Petrol"},
                {label: "Diesel", value: "Diesel"},
                {label: "Electric", value: "Electric"},
                {label: "Hybrid", value: "Hybrid"}
              ]}
            />
             <Select 
              label="Status" 
              {...register("status")} 
              error={errors.status?.message}
              options={[
                {label: "Active", value: "Active"},
                {label: "Inactive", value: "Inactive"},
                {label: "Under Maintenance", value: "Under Maintenance"}
              ]}
            />
          </div>
          
          <div className="pt-4 flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingId ? "Save Changes" : "Register Vehicle"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
