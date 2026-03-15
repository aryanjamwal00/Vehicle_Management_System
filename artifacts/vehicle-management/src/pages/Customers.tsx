import React, { useState } from "react";
import { useListCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { Plus, Edit2, Trash2, Search, Mail, Phone, MapPin, CreditCard } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDateTime } from "@/lib/utils";

const customerSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(5, "Phone is required"),
  address: z.string().min(5, "Address is required"),
  licenseNumber: z.string().min(3, "License number is required"),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function Customers() {
  const queryClient = useQueryClient();
  const { data: customers = [], isLoading } = useListCustomers();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema)
  });

  const filteredCustomers = customers.filter(c => 
    `${c.firstName} ${c.lastName} ${c.email} ${c.licenseNumber}`.toLowerCase().includes(search.toLowerCase())
  );

  const openNewModal = () => {
    setEditingId(null);
    reset({ firstName: "", lastName: "", email: "", phone: "", address: "", licenseNumber: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (customer: any) => {
    setEditingId(customer.id);
    reset(customer);
    setIsModalOpen(true);
  };

  const onSubmit = (data: CustomerFormData) => {
    if (editingId) {
      updateCustomer.mutate(
        { id: editingId, data },
        { 
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
            setIsModalOpen(false);
          } 
        }
      );
    } else {
      createCustomer.mutate(
        { data },
        { 
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
            setIsModalOpen(false);
          } 
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteCustomer.mutate(
        { id },
        { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/customers"] }) }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your client database</p>
        </div>
        <Button onClick={openNewModal} className="gap-2">
          <Plus size={18} /> New Customer
        </Button>
      </div>

      <Card className="p-4 glass-panel">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input 
            placeholder="Search customers by name, email, or license..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 max-w-md border-border/50 bg-background/50 backdrop-blur-sm"
          />
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCustomers.map(customer => (
            <Card key={customer.id} className="card-hover glass-panel relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button onClick={() => openEditModal(customer)} className="p-2 bg-white text-blue-600 rounded-full shadow hover:bg-blue-50 transition"><Edit2 size={16}/></button>
                <button onClick={() => handleDelete(customer.id)} className="p-2 bg-white text-red-600 rounded-full shadow hover:bg-red-50 transition"><Trash2 size={16}/></button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20">
                    {customer.firstName[0]}{customer.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{customer.firstName} {customer.lastName}</h3>
                    <p className="text-sm text-muted-foreground font-medium">Joined {formatDateTime(customer.createdAt).split(' ')[0]}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mt-6">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground font-mono">{customer.licenseNumber}</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-foreground">{customer.address}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {filteredCustomers.length === 0 && (
            <div className="col-span-full p-12 text-center text-muted-foreground bg-white/50 rounded-2xl border border-dashed">
              No customers found. Try a different search or add a new customer.
            </div>
          )}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Customer" : "Add New Customer"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">First Name</label>
              <Input {...register("firstName")} />
              {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Last Name</label>
              <Input {...register("lastName")} />
              {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <Input type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Phone</label>
              <Input {...register("phone")} />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">License Number</label>
              <Input {...register("licenseNumber")} />
              {errors.licenseNumber && <p className="text-xs text-red-500">{errors.licenseNumber.message}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Address</label>
            <Input {...register("address")} />
            {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createCustomer.isPending || updateCustomer.isPending}>
              {createCustomer.isPending || updateCustomer.isPending ? "Saving..." : "Save Customer"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
