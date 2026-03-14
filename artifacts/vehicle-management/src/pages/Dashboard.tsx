import { useListCustomers, useListVehicles, useListVehicleTypes } from "@workspace/api-client-react";
import { Car, Users, Settings2, Activity } from "lucide-react";
import { Link } from "wouter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#4f46e5', '#8b5cf6', '#ec4899', '#0ea5e9'];

export default function Dashboard() {
  const { data: customers, isLoading: isCustomersLoading } = useListCustomers();
  const { data: vehicles, isLoading: isVehiclesLoading } = useListVehicles();
  const { data: vehicleTypes, isLoading: isTypesLoading } = useListVehicleTypes();

  const isLoading = isCustomersLoading || isVehiclesLoading || isTypesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Analytics logic
  const statusData = vehicles?.reduce((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = statusData ? Object.entries(statusData).map(([name, value]) => ({ name, value })) : [];

  const typeData = vehicles?.reduce((acc, v) => {
    acc[v.vehicleTypeName] = (acc[v.vehicleTypeName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barData = typeData ? Object.entries(typeData).map(([name, count]) => ({ name, count })) : [];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-2 text-lg">Welcome back. Here's what's happening with your fleet today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Vehicles" 
          value={vehicles?.length || 0} 
          icon={<Car className="w-6 h-6 text-blue-500" />} 
          trend="+12%" 
          bg="bg-blue-500/10" 
        />
        <StatCard 
          title="Active Customers" 
          value={customers?.length || 0} 
          icon={<Users className="w-6 h-6 text-indigo-500" />} 
          trend="+5%" 
          bg="bg-indigo-500/10" 
        />
        <StatCard 
          title="Vehicle Categories" 
          value={vehicleTypes?.length || 0} 
          icon={<Settings2 className="w-6 h-6 text-violet-500" />} 
          trend="Stable" 
          bg="bg-violet-500/10" 
        />
        <StatCard 
          title="System Health" 
          value="100%" 
          icon={<Activity className="w-6 h-6 text-emerald-500" />} 
          trend="Optimal" 
          bg="bg-emerald-500/10" 
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <h3 className="text-lg font-bold font-display mb-6">Vehicles by Type</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <h3 className="text-lg font-bold font-display mb-6">Fleet Status</h3>
          <div className="h-72 w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend */}
            <div className="absolute flex flex-col gap-3 ml-48">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-sm font-medium text-muted-foreground">{entry.name}</span>
                  <span className="text-sm font-bold text-foreground ml-auto pl-4">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Vehicles Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-bold font-display">Recently Added Vehicles</h3>
          <Link href="/vehicles">
            <span className="text-sm font-medium text-primary hover:underline cursor-pointer">View All</span>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Registration</th>
                <th className="px-6 py-4 font-medium">Vehicle</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y border-border">
              {vehicles?.slice(0, 5).map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{vehicle.registrationNumber}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{vehicle.make} {vehicle.model}</div>
                    <div className="text-xs text-muted-foreground">{vehicle.year} • {vehicle.color}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{vehicle.customerName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      vehicle.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                      vehicle.status === 'Inactive' ? 'bg-slate-100 text-slate-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {vehicle.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!vehicles || vehicles.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No vehicles registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, bg }: { title: string, value: string | number, icon: React.ReactNode, trend: string, bg: string }) {
  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between group hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold font-display text-foreground mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${bg} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className="text-emerald-500 font-semibold">{trend}</span>
        <span className="text-muted-foreground ml-2">vs last month</span>
      </div>
    </div>
  );
}
