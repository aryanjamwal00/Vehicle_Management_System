import { useState } from "react";
import { useListVehicleTypes, useCreateVehicleType, useUpdateVehicleType, useDeleteVehicleType } from "@workspace/api-client-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Plus, Edit2, Trash2, Settings2, CarFront } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

const typeSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(5, "Description is required"),
  category: z.string().min(2, "Category is required"),
});

type TypeFormValues = z.infer<typeof typeSchema>;

export default function VehicleTypes() {
  const { data: types, isLoading } = useListVehicleTypes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useCreateVehicleType();
  const updateMutation = useUpdateVehicleType();
  const deleteMutation = useDeleteVehicleType();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TypeFormValues>({
    resolver: zodResolver(typeSchema)
  });

  const openAddModal = () => {
    setEditingId(null);
    reset({ name: '', description: '', category: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (type: any) => {
    setEditingId(type.id);
    reset({ name: type.name, description: type.description, category: type.category });
    setIsModalOpen(true);
  };

  const onSubmit = (data: TypeFormValues) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/vehicle-types"] });
          setIsModalOpen(false);
          toast({ title: "Success", description: "Vehicle type updated." });
        }
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/vehicle-types"] });
          setIsModalOpen(false);
          toast({ title: "Success", description: "Vehicle type created." });
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this vehicle type? Associated vehicles may be affected.")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/vehicle-types"] });
          toast({ title: "Success", description: "Vehicle type deleted." });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Vehicle Types</h1>
          <p className="text-muted-foreground mt-1">Configure categories and classifications for your fleet.</p>
        </div>
        <Button onClick={openAddModal} className="shrink-0">
          <Plus className="w-5 h-5 mr-2" />
          Add Type
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {types?.map((type) => (
            <div key={type.id} className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
              {/* Decorative background element */}
              <div className="absolute -right-6 -top-6 text-primary/5 group-hover:text-primary/10 transition-colors pointer-events-none">
                <CarFront className="w-32 h-32" />
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary/10 text-primary p-3 rounded-xl inline-flex">
                    <Settings2 className="w-6 h-6" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(type)} className="p-1.5 text-muted-foreground hover:text-primary bg-background rounded shadow-sm border border-border">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(type.id)} className="p-1.5 text-muted-foreground hover:text-destructive bg-background rounded shadow-sm border border-border">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold font-display text-foreground">{type.name}</h3>
                <span className="inline-block mt-2 px-2.5 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-full uppercase tracking-wider">
                  {type.category}
                </span>
                
                <p className="text-muted-foreground text-sm mt-4 leading-relaxed line-clamp-3">
                  {type.description}
                </p>
              </div>
            </div>
          ))}
          
          {types?.length === 0 && (
             <div className="col-span-full p-16 text-center bg-card rounded-2xl border border-border border-dashed">
             <Settings2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
             <h3 className="text-lg font-bold text-foreground">No vehicle types</h3>
             <p className="text-muted-foreground mt-2 mb-6">Create your first vehicle classification to get started.</p>
             <Button onClick={openAddModal} variant="outline">Create Type</Button>
           </div>
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Vehicle Type" : "Add Vehicle Type"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input label="Type Name (e.g. Sedan, Truck)" {...register("name")} error={errors.name?.message} />
          <Input label="Category" {...register("category")} error={errors.category?.message} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              {...register("description")}
              className="flex min-h-[100px] w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 transition-all resize-none"
              placeholder="Describe this vehicle classification..."
            />
            {errors.description && <span className="text-xs text-destructive font-medium">{errors.description.message}</span>}
          </div>
          
          <div className="pt-4 flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingId ? "Save Changes" : "Create Type"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
