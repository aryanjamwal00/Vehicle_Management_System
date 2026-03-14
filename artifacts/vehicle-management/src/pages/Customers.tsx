import { useState } from "react";
import { useListCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from "@workspace/api-client-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Plus, Edit2, Trash2, Search, Mail, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateInitials, formatDate } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

const customerSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  licenseNumber: z.string().min(3, "License number is required"),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function Customers() {
  const { data: customers, isLoading } = useListCustomers();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema)
  });

  const filteredCustomers = customers?.filter(c => 
    `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingId(null);
    reset({ firstName: '', lastName: '', email: '', phone: '', address: '', licenseNumber: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (customer: any) => {
    setEditingId(customer.id);
    reset({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      licenseNumber: customer.licenseNumber,
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: CustomerFormValues) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
          setIsModalOpen(false);
          toast({ title: "Success", description: "Customer updated successfully." });
        }
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
          setIsModalOpen(false);
          toast({ title: "Success", description: "Customer created successfully." });
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
          toast({ title: "Success", description: "Customer deleted successfully." });
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your customer database and profiles.</p>
        </div>
        <Button onClick={openAddModal} className="shrink-0 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
          <Plus className="w-5 h-5 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="relative max-w-md">
            <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search customers by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-border bg-background focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>
        ) : filteredCustomers?.length === 0 ? (
          <div className="p-16 text-center">
            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No customers found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search or add a new customer.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
            {filteredCustomers?.map((customer) => (
              <div key={customer.id} className="bg-background rounded-2xl border border-border p-6 shadow-subtle hover:shadow-card hover:border-primary/30 transition-all duration-300 group flex flex-col">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-primary/20">
                      {generateInitials(`${customer.firstName} ${customer.lastName}`)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                        {customer.firstName} {customer.lastName}
                      </h3>
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                        ID: {customer.id}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(customer)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(customer.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-6 space-y-3 flex-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 mr-3 text-primary/70" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 mr-3 text-primary/70" />
                    {customer.phone}
                  </div>
                  <div className="flex items-start text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-3 mt-0.5 text-primary/70 shrink-0" />
                    <span className="line-clamp-2">{customer.address}</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-medium">
                  <span>License: <span className="text-foreground">{customer.licenseNumber}</span></span>
                  <span>Added {formatDate(customer.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Customer" : "Add New Customer"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" {...register("firstName")} error={errors.firstName?.message} />
            <Input label="Last Name" {...register("lastName")} error={errors.lastName?.message} />
          </div>
          <Input label="Email Address" type="email" {...register("email")} error={errors.email?.message} />
          <Input label="Phone Number" {...register("phone")} error={errors.phone?.message} />
          <Input label="License Number" {...register("licenseNumber")} error={errors.licenseNumber?.message} />
          <Input label="Full Address" {...register("address")} error={errors.address?.message} />
          
          <div className="pt-4 flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingId ? "Save Changes" : "Create Customer"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
