import React from "react";
import { useListCustomers, useListVehicles, useListVehicleTypes, useListBookings } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Users, CarFront, Tags, CalendarDays, TrendingUp, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: customers = [], isLoading: loadingCustomers } = useListCustomers();
  const { data: vehicles = [], isLoading: loadingVehicles } = useListVehicles();
  const { data: vehicleTypes = [], isLoading: loadingTypes } = useListVehicleTypes();
  const { data: bookings = [], isLoading: loadingBookings } = useListBookings();

  const activeBookings = bookings.filter(b => b.status === "Active" || b.status === "Pending");
  const maintenanceVehicles = vehicles.filter(v => v.status === "Under Maintenance");
  
  const stats = [
    { title: "Total Customers", value: customers.length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Fleet Size", value: vehicles.length, icon: CarFront, color: "text-primary", bg: "bg-primary/10" },
    { title: "Active Bookings", value: activeBookings.length, icon: CalendarDays, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Vehicle Types", value: vehicleTypes.length, icon: Tags, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  if (loadingCustomers || loadingVehicles || loadingTypes || loadingBookings) {
    return <div className="flex items-center justify-center h-[60vh]"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-lg">Welcome back! Here's what's happening with your fleet today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="card-hover">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                  <p className="text-4xl font-bold mt-2 text-foreground">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bg}`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass-panel">
          <div className="p-6 border-b border-border/50">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Recent Bookings
            </h3>
          </div>
          <div className="p-0">
            {bookings.slice(0, 5).map((booking, i) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-semibold text-foreground">{booking.customerName}</p>
                  <p className="text-sm text-muted-foreground">{booking.vehicleName} ({booking.registrationNumber})</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    booking.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                    booking.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                    booking.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">{booking.startDate} to {booking.endDate}</p>
                </div>
              </div>
            ))}
            {bookings.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">No bookings found.</div>
            )}
          </div>
        </Card>

        <Card className="glass-panel">
          <div className="p-6 border-b border-border/50">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Vehicles Needing Attention
            </h3>
          </div>
          <div className="p-0">
            {maintenanceVehicles.length > 0 ? maintenanceVehicles.map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between p-4 border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-semibold text-foreground">{vehicle.make} {vehicle.model}</p>
                  <p className="text-sm text-muted-foreground">{vehicle.registrationNumber}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                    Maintenance
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">{vehicle.mileageKm.toLocaleString()} km</p>
                </div>
              </div>
            )) : (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="bg-emerald-100 p-3 rounded-full mb-3">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="font-medium text-foreground">All good!</p>
                <p className="text-sm text-muted-foreground mt-1">No vehicles currently require maintenance.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
