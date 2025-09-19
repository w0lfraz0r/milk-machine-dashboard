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
  Cell,
} from "recharts";
import {
  Activity,
  Layers,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";
import StatsOverview from "./StatsOverview";

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
  conveyorBeltNumber: number;
  trayId: number;
  identifiedPacketCount: number;
  identifiedColor: string | null;
  type: string | null;
  timeOfDetection: string;
}

interface TimeSeriesPoint {
  time: string;
  line1: number;
  line2: number;
  total: number;
}

interface PacketTypeCount {
  type: string;
  count: number;
  color: string;
}

// Color mapping function for packet types
const getColorForType = (type: string): string => {
  const colorMap: { [key: string]: string } = {
    half: "#3b82f6", // blue
    one: "#10b981", // green
    six: "#f59e0b", // amber
    unknown: "#94a3b8", // gray
  };
  return colorMap[type.toLowerCase()] || colorMap.unknown;
};

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
              className={`text-xs flex items-center gap-1 mt-1 ${change > 0 ? "text-green-600" : "text-red-600"
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

const AssemblyLineChart = ({ lineNumber, data, isLoading }) => {
  // Only render if it's line 1 or 2
  if (lineNumber > 2) return null;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              Conveyor Belt {lineNumber}
            </CardTitle>
            <CardDescription>Packet count over time</CardDescription>
          </div>
          <Badge variant="outline" className="bg-blue-50">
            <Activity className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>
      </CardHeader>
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
    </Card>
  );
};

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
  const processTimeSeriesData = (data: TrayData[]): TimeSeriesPoint[] => {
    const timeMap = new Map<string, { line1: number; line2: number }>();

    // Initialize all hours
    for (let hour = 0; hour < 24; hour++) {
      const formattedHour = hour.toString().padStart(2, "0") + ":00";
      timeMap.set(formattedHour, { line1: 0, line2: 0 });
    }

    // Process data
    data.forEach((record) => {
      if (!record.timeOfDetection) return;

      // Parse MySQL datetime string
      const date = new Date(record.timeOfDetection.replace(" ", "T") + "Z");
      if (isNaN(date.getTime())) return;

      const hour = date.getHours().toString().padStart(2, "0");
      const timeKey = `${hour}:00`;

      const current = timeMap.get(timeKey) || { line1: 0, line2: 0 };
      if (record.conveyorBeltNumber === 1) {
        current.line1 += record.identifiedPacketCount;
      } else if (record.conveyorBeltNumber === 2) {
        current.line2 += record.identifiedPacketCount;
      }
      timeMap.set(timeKey, current);
    });

    return Array.from(timeMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([time, values]) => ({
        time,
        line1: values.line1,
        line2: values.line2,
        total: values.line1 + values.line2,
      }));
  };

  // Process packet types from tray data
  const processPacketTypes = (trayData: TrayData[]): PacketTypeCount[] => {
    const typeMap = new Map<string, number>();

    trayData.forEach((tray) => {
      const type = tray.type || "unknown";
      typeMap.set(type, (typeMap.get(type) || 0) + tray.identifiedPacketCount);
    });

    return Array.from(typeMap.entries())
      .map(([type, count]) => ({
        type: type,
        count,
        color: getColorForType(type),
      }))
      .sort((a, b) => b.count - a.count);
  };

  // Process tray data for hourly analysis
  const processTrayAnalysis = (data: TrayData[]) => {
    const hourlyTrayData = new Map<
      string,
      { trays: number; capacity: number }
    >();

    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, "0");
      hourlyTrayData.set(`${hour}:00`, { trays: 0, capacity: 150 });
    }

    data.forEach((tray) => {
      if (!tray.timeOfDetection) return;

      // Parse MySQL datetime string
      const date = new Date(tray.timeOfDetection.replace(" ", "T") + "Z");
      if (isNaN(date.getTime())) return;

      const hour = date.getHours().toString().padStart(2, "0");
      const timeKey = `${hour}:00`;

      const current = hourlyTrayData.get(timeKey)!;
      current.trays += 1;
      hourlyTrayData.set(timeKey, current);
    });

    return Array.from(hourlyTrayData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hour, data]) => ({
        hour,
        trays: data.trays,
        capacity: data.capacity,
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

    // polling commented for now
    // Set up auto-refresh every 30 seconds
    // const interval = setInterval(() => {
    //   fetchAllData();
    //   setCurrentTime(new Date());
    // }, 30000);

    // return () => clearInterval(interval);
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
  const totalPacketsToday = trayData.reduce(
    (sum, record) => sum + record.identifiedPacketCount,
    0
  );
  const activeLines = new Set(
    trayData.map((record) => record.conveyorBeltNumber)
  ).size;
  const totalTrays = trayData.length;
  const hourlyTrayData = processTrayAnalysis(trayData);
  const avgTraysPerHour =
    hourlyTrayData.length > 0
      ? Math.round(totalTrays / Math.max(hourlyTrayData.length, 1))
      : 0;
  const capacityUtilization =
    hourlyTrayData.length > 0 ? Math.round((avgTraysPerHour / 150) * 100) : 0;

  const stats = {
    totalPackets: totalPacketsToday,
    activeLines,
    totalTrays,
    capacityUtilization,
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-rose-200 via-red-100 to-red-50 dark:from-gray-800 dark:via-red-900/20 dark:to-gray-800">
        <div className="max-w-[1440px] mx-auto">
          <div className="px-8 pt-8 pb-28">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-500 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">A</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-gray-600">
                  Last updated: {currentTime.toLocaleTimeString()}
                </span>
              </div>
            </div>
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                Good morning, Team!
              </h1>
              <p className="text-gray-600">
                Explore your team's latest production metrics to see how you're
                driving results.
              </p>
            </div>
          </div>
        </div>

        {/* Overlapping Stats Card */}
        <div className="absolute left-0 right-0 -bottom-16">
          <div className="max-w-[1440px] mx-auto px-8">
            <StatsOverview />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-8 pt-28 pb-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-white p-1 rounded-lg shadow-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lines">Assembly Lines</TabsTrigger>
            <TabsTrigger value="trays">Tray Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
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
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {packetTypesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
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
                        name="Conveyor Belt 1"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="line2"
                        stroke="#10b981"
                        name="Conveyor Belt 2"
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
