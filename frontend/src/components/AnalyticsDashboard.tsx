import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area } from 'recharts';
import { Activity, Package, Layers, TrendingUp, Clock } from 'lucide-react';

// Mock data - replace with actual API calls
const generateTimeSeriesData = (hours = 24) => {
  const now = new Date();
  return Array.from({ length: hours }, (_, i) => {
    const time = new Date(now.getTime() - (hours - 1 - i) * 60 * 60 * 1000);
    return {
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: time.toISOString(),
      line1: Math.floor(Math.random() * 100) + 150,
      line2: Math.floor(Math.random() * 80) + 120,
      line3: Math.floor(Math.random() * 90) + 140,
      line4: Math.floor(Math.random() * 70) + 110,
      total: 0
    };
  }).map(item => ({
    ...item,
    total: item.line1 + item.line2 + item.line3 + item.line4
  }));
};

const packetTypesData = [
  { type: '1L Whole Milk', count: 2847, color: '#3b82f6' },
  { type: '500ml Whole Milk', count: 1923, color: '#10b981' },
  { type: '1L Skim Milk', count: 1456, color: '#f59e0b' },
  { type: '500ml Skim Milk', count: 1089, color: '#ef4444' },
  { type: '250ml Flavored', count: 876, color: '#8b5cf6' },
  { type: '1L Organic', count: 654, color: '#06b6d4' }
];

const trayData = Array.from({ length: 12 }, (_, i) => ({
  hour: `${String(i + 1).padStart(2, '0')}:00`,
  trays: Math.floor(Math.random() * 50) + 80,
  capacity: 150
}));

const assemblyLines = ['Assembly Line 1', 'Assembly Line 2', 'Assembly Line 3', 'Assembly Line 4'];

const StatCard = ({ title, value, icon: Icon, change, description }) => (
  <Card className="hover:shadow-lg transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      {change && (
        <div className={`text-xs flex items-center gap-1 mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className="h-3 w-3" />
          {change > 0 ? '+' : ''}{change}% from last hour
        </div>
      )}
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </CardContent>
  </Card>
);

const AssemblyLineChart = ({ lineNumber, data }) => (
  <Card className="hover:shadow-lg transition-shadow duration-300">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-lg">Assembly Line {lineNumber}</CardTitle>
          <CardDescription>Packet count over time</CardDescription>
        </div>
        <Badge variant="outline" className="bg-blue-50">
          <Activity className="h-3 w-3 mr-1" />
          Active
        </Badge>
      </div>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`colorLine${lineNumber}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="time" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Area
            type="monotone"
            dataKey={`line${lineNumber}`}
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#colorLine${lineNumber})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default function AnalyticsDashboard() {
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Simulate real-time data updates
    const updateData = () => {
      setTimeSeriesData(generateTimeSeriesData(24));
      setCurrentTime(new Date());
    };

    updateData();
    const interval = setInterval(updateData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const totalPackets = timeSeriesData.length > 0 ? timeSeriesData[timeSeriesData.length - 1]?.total || 0 : 0;
  const totalTrayCount = trayData.reduce((sum, item) => sum + item.trays, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Production Analytics</h1>
            <p className="text-gray-600 mt-1">Real-time monitoring of milk packaging operations</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            Last updated: {currentTime.toLocaleTimeString()}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Packets Today"
            value={totalPackets * 12}
            icon={Package}
            change={5.2}
            description="Across all assembly lines"
          />
          <StatCard
            title="Active Lines"
            value={4}
            icon={Activity}
            description="All systems operational"
          />
          <StatCard
            title="Total Trays"
            value={totalTrayCount}
            icon={Layers}
            change={3.1}
            description="Last 12 hours"
          />
          <StatCard
            title="Efficiency Rate"
            value="94.8%"
            icon={TrendingUp}
            change={1.3}
            description="Above target threshold"
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lines">Assembly Lines</TabsTrigger>
            <TabsTrigger value="packets">Packet Types</TabsTrigger>
            <TabsTrigger value="trays">Tray Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overall Production Line Chart */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl">Overall Production Timeline</CardTitle>
                <CardDescription>Combined packet count across all assembly lines</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={timeSeriesData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Multi-line Chart */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl">Assembly Line Comparison</CardTitle>
                <CardDescription>Individual performance of each assembly line</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="line1" stroke="#3b82f6" name="Line 1" strokeWidth={2} />
                    <Line type="monotone" dataKey="line2" stroke="#10b981" name="Line 2" strokeWidth={2} />
                    <Line type="monotone" dataKey="line3" stroke="#f59e0b" name="Line 3" strokeWidth={2} />
                    <Line type="monotone" dataKey="line4" stroke="#ef4444" name="Line 4" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lines" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {assemblyLines.map((line, index) => (
                <AssemblyLineChart 
                  key={index} 
                  lineNumber={index + 1} 
                  data={timeSeriesData} 
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="packets" className="space-y-6">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl">Packet Type Distribution</CardTitle>
                <CardDescription>Count of different packet types processed today</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={packetTypesData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="type" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      radius={[4, 4, 0, 0]}
                      fill="#3b82f6"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Packet Types Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packetTypesData.map((packet, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{packet.type}</p>
                        <p className="text-2xl font-bold text-gray-900">{packet.count.toLocaleString()}</p>
                      </div>
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: packet.color }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trays" className="space-y-6">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl">Tray Production Analysis</CardTitle>
                <CardDescription>Hourly tray count with capacity comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={trayData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="hour" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="trays" 
                      fill="#10b981" 
                      name="Trays Produced"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="capacity" 
                      fill="#e5e7eb" 
                      name="Max Capacity"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tray Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">{totalTrayCount}</div>
                  <div className="text-sm text-gray-600">Total Trays (12h)</div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{Math.round(totalTrayCount / 12)}</div>
                  <div className="text-sm text-gray-600">Average per Hour</div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {Math.round((totalTrayCount / (150 * 12)) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Capacity Utilization</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}