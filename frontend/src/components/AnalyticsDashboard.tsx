import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  Activity,
  Package,
  Layers,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";

// API base URL - adjust according to your backend setup
const API_BASE_URL = "http://localhost:3001/api";

// Interfaces for type safety
interface OpticalCountData {
  name: string;
  creation: string;
  assemblyLine: number;
  machineId: number;
  fromTime: string;
  toTime: string;
  countedPackets: number;
}

interface TrayData {
  name: string;
  creation: string;
  convery_id: string;
  trayid: string;
  packetsnumber: number;
  packettype: string; // 'half', 'one', 'six'
}

interface TimeSeriesPoint {
  time: string;
  timestamp: string;
  line1: number;
  line2: number;
  line3: number;
  line4: number;
  total: number;
}

interface PacketTypeCount {
  type: string;
  count: number;
  color: string;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  change,
  description,
  isLoading = false,
}) => (
  <Card className="hover:shadow-lg transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      ) : (
        <>
          <div className="text-2xl font-bold">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          {change && (
            <div
              className={`text-xs flex items-center gap-1 mt-1 ${
                change > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              <TrendingUp className="h-3 w-3" />
              {change > 0 ? "+" : ""}
              {change}% from last hour
            </div>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </>
      )}
    </CardContent>
  </Card>
);

const AssemblyLineChart = ({ lineNumber, data, isLoading }) => (
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
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient
                id={`colorLine${lineNumber}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
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
      )}
    </CardContent>
  </Card>
);

export default function AnalyticsDashboard() {
  const [opticalData, setOpticalData] = useState<OpticalCountData[]>([]);
  const [trayData, setTrayData] = useState<TrayData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesPoint[]>([]);
  const [packetTypesData, setPacketTypesData] = useState<PacketTypeCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch optical count data
  const fetchOpticalData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/optical-counts`);
      if (!response.ok) throw new Error("Failed to fetch optical data");
      const data = await response.json();
      setOpticalData(data);
    } catch (err) {
      console.error("Error fetching optical data:", err);
      setError("Failed to load optical data");
    }
  };

  // Fetch tray data
  const fetchTrayData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/trays`);
      if (!response.ok) throw new Error("Failed to fetch tray data");
      const data = await response.json();
      setTrayData(data);
    } catch (err) {
      console.error("Error fetching tray data:", err);
      setError("Failed to load tray data");
    }
  };

  // Process optical data into time series for charts
  const processTimeSeriesData = (
    opticalData: OpticalCountData[]
  ): TimeSeriesPoint[] => {
    const timeMap = new Map<string, { [key: string]: number }>();

    opticalData.forEach((record) => {
      if (!record.fromTime) return;

      const date = new Date(record.fromTime);
      if (isNaN(date.getTime())) return;

      const hour = date.getHours().toString().padStart(2, "0");
      const formattedHour = `${hour}:00`;

      if (!timeMap.has(formattedHour)) {
        timeMap.set(formattedHour, {
          line1: 0,
          line2: 0,
          line3: 0,
          line4: 0,
        });
      }

      const lineKey = `line${record.assemblyLine}`;
      const current = timeMap.get(formattedHour)!;
      current[lineKey] = (current[lineKey] || 0) + record.countedPackets;
    });

    const sortedData = Array.from(timeMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([time, values]) => ({
        time,
        line1: values.line1 || 0,
        line2: values.line2 || 0,
        line3: values.line3 || 0,
        line4: values.line4 || 0,
        total: Object.values(values).reduce((sum, val) => sum + (val || 0), 0),
      }));

    if (sortedData.length === 0) {
      // Add placeholder data if no data exists
      const hours = Array.from(
        { length: 24 },
        (_, i) => `${i.toString().padStart(2, "0")}:00`
      );
      return hours.map((hour) => ({
        time: hour,
        line1: 0,
        line2: 0,
        line3: 0,
        line4: 0,
        total: 0,
      }));
    }

    return sortedData;
  };

  // Process packet types from tray data
  const processPacketTypes = (trayData: TrayData[]): PacketTypeCount[] => {
    const typeMap = new Map<string, number>();

    trayData.forEach((tray) => {
      const type = tray.packettype || "unknown";
      typeMap.set(type, (typeMap.get(type) || 0) + tray.packetsnumber);
    });

    const colors = {
      half: "#3b82f6", // 0.5L - Blue
      one: "#10b981", // 1L - Green
      six: "#f59e0b", // 6L - Orange
      unknown: "#6b7280", // Unknown - Gray
    };

    const typeNames = {
      half: "0.5L Packets",
      one: "1L Packets",
      six: "6L Packets",
      unknown: "Unknown Type",
    };

    return Array.from(typeMap.entries()).map(([type, count]) => ({
      type: typeNames[type] || type,
      count,
      color: colors[type] || colors.unknown,
    }));
  };

  // Process tray data for hourly analysis
  const processTrayAnalysis = (data: TrayData[]) => {
    const hourlyTrayData: { [key: string]: number } = {};

    data.forEach((tray) => {
      const date = new Date(tray.creation);
      if (isNaN(date.getTime())) return; // Skip invalid dates

      const hour = date.getHours().toString().padStart(2, "0");
      const formattedTime = `${hour}:00`;

      hourlyTrayData[formattedTime] = (hourlyTrayData[formattedTime] || 0) + 1;
    });

    return Object.entries(hourlyTrayData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hour, trays]) => ({
        hour,
        trays,
        capacity: 150, // Maximum capacity per hour
      }));
  };

  // Initial data fetch
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchOpticalData(), fetchTrayData()]);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAllData();
      setCurrentTime(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Process data when raw data changes
  useEffect(() => {
    if (opticalData.length > 0) {
      setTimeSeriesData(processTimeSeriesData(opticalData));
    }
    if (trayData.length > 0) {
      setPacketTypesData(processPacketTypes(trayData));
    }
  }, [opticalData, trayData]);

  // Calculate statistics
  const totalPacketsToday = opticalData.reduce(
    (sum, record) => sum + record.countedPackets,
    0
  );
  const activeLines = new Set(opticalData.map((record) => record.assemblyLine))
    .size;
  const totalTrays = trayData.length;
  const hourlyTrayData = processTrayAnalysis(trayData);
  const avgTraysPerHour =
    hourlyTrayData.length > 0
      ? Math.round(totalTrays / Math.max(hourlyTrayData.length, 1))
      : 0;
  const capacityUtilization =
    hourlyTrayData.length > 0 ? Math.round((avgTraysPerHour / 150) * 100) : 0;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Zap className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bamul Production Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time monitoring of milk packaging operations
            </p>
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
            value={totalPacketsToday}
            icon={Package}
            description="Across all assembly lines"
            isLoading={isLoading}
          />
          <StatCard
            title="Active Assembly Lines"
            value={activeLines}
            icon={Activity}
            description={`${activeLines} lines operational`}
            isLoading={isLoading}
          />
          <StatCard
            title="Total Trays"
            value={totalTrays}
            icon={Layers}
            description="Processed today"
            isLoading={isLoading}
          />
          <StatCard
            title="Capacity Utilization"
            value={`${capacityUtilization}%`}
            icon={TrendingUp}
            description="Tray production efficiency"
            isLoading={isLoading}
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
                <CardTitle className="text-xl">
                  Overall Production Timeline
                </CardTitle>
                <CardDescription>
                  Combined packet count across all assembly lines
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse h-96 bg-gray-200 rounded"></div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={timeSeriesData}>
                      <defs>
                        <linearGradient
                          id="colorTotal"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#64748b" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#64748b" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Multi-line Chart */}
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl">
                  Assembly Line Comparison
                </CardTitle>
                <CardDescription>
                  Individual performance of each assembly line
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse h-96 bg-gray-200 rounded"></div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#64748b" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#64748b" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="line1"
                        stroke="#3b82f6"
                        name="Line 1"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="line2"
                        stroke="#10b981"
                        name="Line 2"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="line3"
                        stroke="#f59e0b"
                        name="Line 3"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="line4"
                        stroke="#ef4444"
                        name="Line 4"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lines" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((lineNumber) => (
                <AssemblyLineChart
                  key={lineNumber}
                  lineNumber={lineNumber}
                  data={timeSeriesData}
                  isLoading={isLoading}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="packets" className="space-y-6">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl">
                  Packet Type Distribution
                </CardTitle>
                <CardDescription>
                  Count of different packet types processed today
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse h-96 bg-gray-200 rounded"></div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={packetTypesData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="type"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#64748b" }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#64748b" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Bar
                        dataKey="count"
                        radius={[4, 4, 0, 0]}
                        fill="#3b82f6"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Packet Types Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading
                ? Array.from({ length: 3 }, (_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </CardContent>
                    </Card>
                  ))
                : packetTypesData.map((packet, index) => (
                    <Card
                      key={index}
                      className="hover:shadow-md transition-shadow duration-200"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{packet.type}</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {packet.count.toLocaleString()}
                            </p>
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
                <CardTitle className="text-xl">
                  Tray Production Analysis
                </CardTitle>
                <CardDescription>
                  Hourly tray count with capacity comparison
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse h-96 bg-gray-200 rounded"></div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={hourlyTrayData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="hour"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#64748b" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#64748b" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
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
                )}
              </CardContent>
            </Card>

            {/* Tray Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Trays Today"
                value={totalTrays}
                icon={Layers}
                description="All conveyor belts"
                isLoading={isLoading}
              />
              <StatCard
                title="Average per Hour"
                value={avgTraysPerHour}
                icon={Clock}
                description="Based on current data"
                isLoading={isLoading}
              />
              <StatCard
                title="Capacity Utilization"
                value={`${capacityUtilization}%`}
                icon={TrendingUp}
                description="Of maximum capacity"
                isLoading={isLoading}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}