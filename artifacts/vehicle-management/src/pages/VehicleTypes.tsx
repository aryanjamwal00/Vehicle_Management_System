import React, { useState } from "react";
import { useListVehicleTypes, useCreateVehicleType, useUpdateVehicleType, useDeleteVehicleType } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { Plus, Edit2, Trash2, Tag } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const typeSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(5, "Description is required"),
  category: z.string().min(2, "Category is required"),
});

type TypeFormData = z.infer<typeof typeSchema>;

export default function VehicleTypes() {
  const queryClient = useQueryClient();
  const { data: types = [], isLoading } = useListVehicleTypes();
  const createType = useCreateVehicleType();
  const updateType = useUpdateVehicleType();
  const deleteType = useDeleteVehicleType();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TypeFormData>({
    resolver: zodResolver(typeSchema)
  });

  const openNewModal = () => {
    setEditingId(null);
    reset({ name: "", description: "", category: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (type: any) => {
    setEditingId(type.id);
    reset(type);
    setIsModalOpen(true);
  };

  const onSubmit = (data: TypeFormData) => {
    if (editingId) {
      updateType.mutate(
        { id: editingId, data },
        { 
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/vehicle-types"] });
            setIsModalOpen(false);
          } 
        }
      );
    } else {
      createType.mutate(
        { data },
        { 
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/vehicle-types"] });
            setIsModalOpen(false);
          } 
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure? This might fail if vehicles are linked to this type.")) {
      deleteType.mutate(
        { id },
        { 
          onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/vehicle-types"] }),
          onError: (err) => alert("Failed to delete. Make sure no vehicles are using this type.")
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicle Types</h1>
          <p className="text-muted-foreground mt-1">Manage categories and classifications</p>
        </div>
        <Button onClick={openNewModal} className="gap-2">
          <Plus size={18} /> Add Type
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {types.map(type => (
            <Card key={type.id} className="card-hover glass-panel">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Tag className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(type)} className="p-1.5 text-muted-foreground hover:text-blue-600 transition"><Edit2 size={16}/></button>
                    <button onClick={() => handleDelete(type.id)} className="p-1.5 text-muted-foreground hover:text-red-600 transition"><Trash2 size={16}/></button>
                  </div>
                </div>
                <h3 className="font-bold text-lg">{type.name}</h3>
                <span className="inline-block px-2 py-1 mt-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded-md border">
                  {type.category}
                </span>
                <p className="text-sm text-muted-foreground mt-4 line-clamp-2">{type.description}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Vehicle Type" : "Add Vehicle Type"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Name (e.g., Compact Sedan)</label>
            <Input {...register("name")} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Category (e.g., Car, Truck)</label>
            <Input {...register("category")} />
            {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <textarea 
              {...register("description")} 
              className="flex w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 min-h-[100px]"
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createType.isPending || updateType.isPending}>
              {createType.isPending || updateType.isPending ? "Saving..." : "Save Type"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
