import { useRoute } from "wouter";
import { useGetVehicle, useGetCustomer } from "@workspace/api-client-react";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, CarFront, User, FileText, Activity, MapPin, Calendar, Wrench } from "lucide-react";
import { Link } from "wouter";
import { formatDate } from "@/lib/utils";

export default function VehicleDetails() {
  const [, params] = useRoute("/vehicles/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  
  const { data: vehicle, isLoading, error } = useGetVehicle(id);
  const { data: customer } = useGetCustomer(vehicle?.customerId || 0, { query: { enabled: !!vehicle?.customerId }});

  if (isLoading) {
    return <div className="flex justify-center p-20"><div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div></div>;
  }

  if (error || !vehicle) {
    return (
      <div className="text-center p-20">
        <h2 className="text-2xl font-bold text-destructive">Vehicle not found</h2>
        <Link href="/vehicles">
          <Button className="mt-4" variant="outline">Back to Vehicles</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/vehicles">
          <button className="p-2.5 bg-card border border-border shadow-sm rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            {vehicle.make} {vehicle.model}
            <span className={`px-3 py-1 rounded-full text-xs font-bold font-sans uppercase tracking-widest border align-middle ${
                        vehicle.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        vehicle.status === 'Inactive' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
              {vehicle.status}
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">Registration: <span className="font-mono font-bold text-foreground">{vehicle.registrationNumber}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Info Card */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-indigo-500/5 px-8 py-6 border-b border-border flex justify-between items-center">
            <div className="flex items-center gap-4 text-primary">
              <div className="bg-primary text-white p-3 rounded-xl shadow-md shadow-primary/30">
                <CarFront className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold font-display">Vehicle Specifications</h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Type</p>
              <p className="font-bold text-lg text-foreground">{vehicle.vehicleTypeName}</p>
            </div>
          </div>
          
          <div className="p-8 grid grid-cols-2 sm:grid-cols-3 gap-y-8 gap-x-6">
            <SpecItem label="Make" value={vehicle.make} />
            <SpecItem label="Model" value={vehicle.model} />
            <SpecItem label="Year" value={vehicle.year} />
            <SpecItem label="Color" value={
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-border shadow-sm" style={{backgroundColor: vehicle.color.toLowerCase()}} />
                {vehicle.color}
              </div>
            } />
            <SpecItem label="Fuel Type" value={vehicle.fuelType} />
            <SpecItem label="Registered On" value={formatDate(vehicle.createdAt)} />
          </div>
        </div>

        {/* Owner Card */}
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-border flex items-center gap-3">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold font-display text-foreground">Current Owner</h2>
          </div>
          
          {customer ? (
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-800 to-slate-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
                   {customer.firstName[0]}{customer.lastName[0]}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{customer.firstName} {customer.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">License No.</p>
                    <p className="font-semibold text-foreground">{customer.licenseNumber}</p>
                  </div>
                </div>
                
                 <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Address</p>
                    <p className="font-semibold text-foreground line-clamp-2">{customer.address}</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <Link href="/customers">
                  <Button variant="outline" className="w-full">View Full Profile</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Loading owner details...
            </div>
          )}
        </div>

        {/* Maintenance / Logs placeholder */}
        <div className="lg:col-span-3 bg-card rounded-2xl border border-border shadow-sm p-8">
           <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
              <Wrench className="w-6 h-6 text-muted-foreground" />
              <h2 className="text-xl font-bold font-display text-foreground">Service History</h2>
             </div>
             <Button variant="outline" size="sm">Add Record</Button>
           </div>
           
           <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-muted/20">
             <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
             <p className="text-muted-foreground font-medium">No service records found for this vehicle.</p>
           </div>
        </div>

      </div>
    </div>
  );
}

function SpecItem({ label, value }: { label: string, value: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
      <div className="text-base font-bold text-foreground">{value}</div>
    </div>
  );
}
