import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetVehicle, useListBookings, useUpdateVehicleMileage } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Gauge, Calendar, User, Info, Settings } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function VehicleDetails() {
  const { id } = useParams();
  const vehicleId = parseInt(id || "0", 10);
  const queryClient = useQueryClient();

  const { data: vehicle, isLoading: isVehicleLoading } = useGetVehicle(vehicleId);
  const { data: allBookings = [], isLoading: isBookingsLoading } = useListBookings();
  const updateMileage = useUpdateVehicleMileage();

  const [isMileageModalOpen, setIsMileageModalOpen] = useState(false);
  const [newMileage, setNewMileage] = useState("");

  const vehicleBookings = allBookings.filter(b => b.vehicleId === vehicleId).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const handleUpdateMileage = (e: React.FormEvent) => {
    e.preventDefault();
    const km = parseInt(newMileage, 10);
    if (!km || isNaN(km)) return;
    
    if (vehicle && km <= vehicle.mileageKm) {
      alert("New mileage must be greater than current mileage");
      return;
    }

    updateMileage.mutate(
      { id: vehicleId, data: { mileageKm: km } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}`] });
          queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
          setIsMileageModalOpen(false);
          setNewMileage("");
        }
      }
    );
  };

  if (isVehicleLoading) {
    return <div className="flex justify-center p-20"><div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!vehicle) {
    return <div className="text-center p-20">Vehicle not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Link href="/vehicles" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vehicles
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight font-display">{vehicle.make} {vehicle.model}</h1>
            <p className="text-xl text-muted-foreground mt-1 font-mono">{vehicle.registrationNumber}</p>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
            vehicle.status === 'Active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
            vehicle.status === 'Under Maintenance' ? 'bg-amber-100 text-amber-800 border-amber-200' :
            'bg-gray-100 text-gray-800 border-gray-200'
          }`}>
            {vehicle.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="glass-panel border-t-4 border-t-primary md:col-span-2 shadow-lg">
          <div className="p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Info className="h-5 w-5 text-primary" /> Vehicle Specifications
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Make</p>
                <p className="font-semibold text-lg">{vehicle.make}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Model</p>
                <p className="font-semibold text-lg">{vehicle.model}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Year</p>
                <p className="font-semibold text-lg">{vehicle.year}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Color</p>
                <p className="font-semibold text-lg flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border shadow-sm block" style={{ backgroundColor: vehicle.color.toLowerCase() }}></span>
                  {vehicle.color}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Fuel Type</p>
                <p className="font-semibold text-lg">{vehicle.fuelType}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Category</p>
                <p className="font-semibold text-lg">{vehicle.vehicleTypeName}</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-muted-foreground uppercase tracking-wider">
                <User className="h-4 w-4" /> Ownership
              </h3>
              <p className="font-semibold text-lg">{vehicle.customerName}</p>
              <p className="text-sm text-muted-foreground">Added on {formatDate(vehicle.createdAt)}</p>
            </div>
          </div>
        </Card>

        <Card className="glass-panel border-t-4 border-t-blue-500 shadow-lg relative overflow-hidden group flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
          <div className="p-6 flex-1 flex flex-col justify-center items-center text-center relative z-10">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <Gauge className="h-10 w-10 text-blue-500" />
            </div>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Current Odometer</p>
            <div className="text-5xl font-display font-black tracking-tight text-foreground bg-clip-text">
              {vehicle.mileageKm?.toLocaleString() ?? 0}
              <span className="text-2xl text-muted-foreground ml-1">km</span>
            </div>
            
            <Button 
              variant="outline" 
              className="mt-8 w-full border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => setIsMileageModalOpen(true)}
            >
              Update Mileage
            </Button>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" /> Booking History
        </h2>
        <Card className="glass-panel">
          {isBookingsLoading ? (
            <div className="p-10 text-center text-muted-foreground">Loading history...</div>
          ) : vehicleBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date Range</th>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Duration</th>
                    <th className="px-6 py-4 font-semibold">Purpose</th>
                    <th className="px-6 py-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {vehicleBookings.map(b => (
                    <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{formatDate(b.startDate)} - {formatDate(b.endDate)}</td>
                      <td className="px-6 py-4">{b.customerName}</td>
                      <td className="px-6 py-4">{b.totalDays} days</td>
                      <td className="px-6 py-4 truncate max-w-[200px]">{b.purpose}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          b.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          b.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                          b.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              No booking history for this vehicle.
            </div>
          )}
        </Card>
      </div>

      <Modal
        isOpen={isMileageModalOpen}
        onClose={() => setIsMileageModalOpen(false)}
        title="Update Vehicle Mileage"
        description="Record the latest odometer reading. Value must be higher than current."
      >
        <form onSubmit={handleUpdateMileage} className="space-y-6 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">New Mileage (km)</label>
            <Input 
              type="number" 
              required
              min={(vehicle.mileageKm || 0) + 1}
              value={newMileage}
              onChange={(e) => setNewMileage(e.target.value)}
              placeholder={`Current: ${vehicle.mileageKm}`}
              className="text-xl h-14"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsMileageModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={updateMileage.isPending || !newMileage}>
              {updateMileage.isPending ? "Saving..." : "Save Update"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
