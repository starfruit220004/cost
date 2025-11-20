import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,LineChart,Line,PieChart,Pie,Cell,Legend} from "recharts";
import {format,startOfWeek,endOfWeek,startOfMonth,endOfMonth,startOfYear,endOfYear,isWithinInterval,parseISO,subDays,subMonths,subYears} from "date-fns";
import { TrendingUp, TrendingDown, CircleDollarSign, Package, CalendarDays, Download, Filter } from "lucide-react";

// Sample
const sampleSales = [
  // Nov 18, 2025
  { id: 1, name: "Chicken Adobo", category: "Chicken", price: 120, quantity: 15, date: "2025-11-18", time: "08:30" },
  { id: 2, name: "Beef Steak", category: "Beef", price: 180, quantity: 10, date: "2025-11-18", time: "09:15" },
  { id: 3, name: "Combo Meal 1", category: "Combo Meal", price: 250, quantity: 5, date: "2025-11-18", time: "11:00" },
  { id: 4, name: "Silog Meal 1", category: "Silog Meal", price: 100, quantity: 12, date: "2025-11-18", time: "07:45" },
  { id: 5, name: "Extra Rice", category: "Adds On", price: 30, quantity: 18, date: "2025-11-18", time: "12:30" },
  { id: 6, name: "Chicken Adobo", category: "Chicken", price: 120, quantity: 8, date: "2025-11-18", time: "13:20" },
  
  // Nov 19, 2025
  { id: 7, name: "Fish Fillet", category: "Fish", price: 150, quantity: 8, date: "2025-11-19", time: "08:15" },
  { id: 8, name: "Veggie Salad", category: "Vegetables", price: 80, quantity: 20, date: "2025-11-19", time: "10:30" },
  { id: 9, name: "Extra Rice", category: "Adds On", price: 30, quantity: 25, date: "2025-11-19", time: "12:00" },
  { id: 10, name: "Beef Steak", category: "Beef", price: 180, quantity: 7, date: "2025-11-19", time: "14:45" },
  { id: 11, name: "Combo Meal 1", category: "Combo Meal", price: 250, quantity: 6, date: "2025-11-19", time: "18:30" },
  
  // Nov 17, 2025
  { id: 12, name: "Chicken Inasal", category: "Chicken", price: 130, quantity: 18, date: "2025-11-17", time: "09:00" },
  { id: 13, name: "Pork Sisig", category: "Beef", price: 140, quantity: 14, date: "2025-11-17", time: "11:30" },
  { id: 14, name: "Silog Meal 1", category: "Silog Meal", price: 100, quantity: 10, date: "2025-11-17", time: "07:30" },
  { id: 15, name: "Fish Fillet", category: "Fish", price: 150, quantity: 5, date: "2025-11-17", time: "13:00" },
  
  // Nov 16, 2025
  { id: 16, name: "Fried Rice", category: "Adds On", price: 35, quantity: 30, date: "2025-11-16", time: "08:00" },
  { id: 17, name: "Chicken Adobo", category: "Chicken", price: 120, quantity: 12, date: "2025-11-16", time: "10:15" },
  { id: 18, name: "Veggie Salad", category: "Vegetables", price: 80, quantity: 15, date: "2025-11-16", time: "12:45" },
  
  // Nov 20, 2025 (today)
  { id: 19, name: "Chicken Adobo", category: "Chicken", price: 120, quantity: 10, date: "2025-11-20", time: "08:00" },
  { id: 20, name: "Beef Steak", category: "Beef", price: 180, quantity: 8, date: "2025-11-20", time: "09:30" },
  { id: 21, name: "Silog Meal 1", category: "Silog Meal", price: 100, quantity: 15, date: "2025-11-20", time: "07:15" },
  { id: 22, name: "Extra Rice", category: "Adds On", price: 30, quantity: 22, date: "2025-11-20", time: "12:00" },
  { id: 23, name: "Combo Meal 1", category: "Combo Meal", price: 250, quantity: 7, date: "2025-11-20", time: "13:30" },
];

const categories = ["All", "Chicken", "Beef", "Fish", "Vegetables", "Value Meal", "Combo Meal", "Silog Meal", "Adds On"];
const periods = ["Daily", "Weekly", "Monthly", "Yearly"];
const chartTypes = ["Bar", "Line", "Pie"];

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function Sales() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchText, setSearchText] = useState("");
  const [filteredCategory, setFilteredCategory] = useState("All");
  const [filteredSales, setFilteredSales] = useState(sampleSales);
  const [period, setPeriod] = useState("Daily");
  const [chartType, setChartType] = useState("Bar");
  const [showCalendar, setShowCalendar] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [compareMode, setCompareMode] = useState(false);

  // Generate X-axis labels 
  const generateLabels = () => {
    if (period === "Daily") {
      return Array.from({ length: 14 }, (_, i) => `${i + 7}:00`);
    }
    if (period === "Weekly") {
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    }
    if (period === "Monthly") {
      const days = [];
      let current = startOfMonth(selectedDate);
      const end = endOfMonth(selectedDate);
      while (current <= end) {
        days.push(format(current, "MMM d"));
        current = new Date(current.setDate(current.getDate() + 1));
      }
      return days;
    }
    if (period === "Yearly") {
      return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    }
  };

  // Filter sales based on date, category, search
  useEffect(() => {
    const filtered = sampleSales.filter((sale) => {
      const saleDate = parseISO(sale.date);

      let matchDate = false;
      if (period === "Daily") {
        matchDate = sale.date === format(selectedDate, "yyyy-MM-dd");
      } else if (period === "Weekly") {
        matchDate = isWithinInterval(saleDate, {
          start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
          end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
        });
      } else if (period === "Monthly") {
        matchDate = isWithinInterval(saleDate, {
          start: startOfMonth(selectedDate),
          end: endOfMonth(selectedDate),
        });
      } else if (period === "Yearly") {
        matchDate = isWithinInterval(saleDate, {
          start: startOfYear(selectedDate),
          end: endOfYear(selectedDate),
        });
      }

      return (
        matchDate &&
        (filteredCategory === "All" || sale.category === filteredCategory) &&
        sale.name.toLowerCase().includes(searchText.toLowerCase())
      );
    });

    setFilteredSales(filtered);
  }, [selectedDate, searchText, filteredCategory, period]);

  // Chart Data
  const xLabels = generateLabels();
  const chartData = xLabels.map((label) => ({
    label,
    total: filteredSales.reduce((sum, sale) => {
      const saleDate = parseISO(sale.date);
      const saleHour = parseInt(sale.time?.split(':')[0] || "0");

      if (period === "Daily") {
        const labelHour = parseInt(label.split(':')[0]);
        if (saleHour === labelHour) return sum + sale.price * sale.quantity;
      }
      if (period === "Weekly") {
        const dayName = format(saleDate, "EEE");
        if (dayName === label) return sum + sale.price * sale.quantity;
      }
      if (period === "Monthly") {
        const dayLabel = format(saleDate, "MMM d");
        if (dayLabel === label) return sum + sale.price * sale.quantity;
      }
      if (period === "Yearly") {
        const monthLabel = format(saleDate, "MMM");
        if (monthLabel === label) return sum + sale.price * sale.quantity;
      }

      return sum;
    }, 0),
  }));

  // Category breakdown for pie chart
  const categoryData = categories.slice(1).map(cat => ({
    name: cat,
    value: filteredSales
      .filter(sale => sale.category === cat)
      .reduce((sum, sale) => sum + sale.price * sale.quantity, 0)
  })).filter(item => item.value > 0);

  // Calculate comparison with previous period
  const getPreviousPeriodSales = () => {
    let previousDate;
    if (period === "Daily") previousDate = subDays(selectedDate, 1);
    else if (period === "Weekly") previousDate = subDays(selectedDate, 7);
    else if (period === "Monthly") previousDate = subMonths(selectedDate, 1);
    else if (period === "Yearly") previousDate = subYears(selectedDate, 1);

    const previousSales = sampleSales.filter((sale) => {
      const saleDate = parseISO(sale.date);
      let matchDate = false;
      
      if (period === "Daily") {
        matchDate = sale.date === format(previousDate, "yyyy-MM-dd");
      } else if (period === "Weekly") {
        matchDate = isWithinInterval(saleDate, {
          start: startOfWeek(previousDate, { weekStartsOn: 1 }),
          end: endOfWeek(previousDate, { weekStartsOn: 1 }),
        });
      } else if (period === "Monthly") {
        matchDate = isWithinInterval(saleDate, {
          start: startOfMonth(previousDate),
          end: endOfMonth(previousDate),
        });
      } else if (period === "Yearly") {
        matchDate = isWithinInterval(saleDate, {
          start: startOfYear(previousDate),
          end: endOfYear(previousDate),
        });
      }
      
      return matchDate && (filteredCategory === "All" || sale.category === filteredCategory);
    });

    return previousSales.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  // Totals all calculated from actual filtered data
  const totalSales = filteredSales.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = filteredSales.reduce((acc, item) => acc + item.quantity, 0);
  
  // Get unique transactions
  const uniqueTransactions = new Set(filteredSales.map(sale => `${sale.date}-${sale.time}`)).size;
  const averageOrderValue = uniqueTransactions > 0 ? totalSales / uniqueTransactions : 0;
  
  const previousPeriodSales = getPreviousPeriodSales();
  const salesGrowth = previousPeriodSales > 0 ? ((totalSales - previousPeriodSales) / previousPeriodSales) * 100 : 0;

  // Top selling item 
  const itemSummary = {};
  filteredSales.forEach(sale => {
    if (!itemSummary[sale.name]) {
      itemSummary[sale.name] = { name: sale.name, price: sale.price, quantity: 0, total: 0 };
    }
    itemSummary[sale.name].quantity += sale.quantity;
    itemSummary[sale.name].total += sale.price * sale.quantity;
  });

  const topItem = Object.values(itemSummary).sort((a, b) => b.total - a.total)[0] || { name: "N/A", price: 0, quantity: 0, total: 0 };

  const handleDelete = (id) => {
    const updatedSales = sampleSales.filter(item => item.id !== id);
    const newFiltered = updatedSales.filter((sale) => {
      const saleDate = parseISO(sale.date);

      let matchDate = false;
      if (period === "Daily") {
        matchDate = sale.date === format(selectedDate, "yyyy-MM-dd");
      } else if (period === "Weekly") {
        matchDate = isWithinInterval(saleDate, {
          start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
          end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
        });
      } else if (period === "Monthly") {
        matchDate = isWithinInterval(saleDate, {
          start: startOfMonth(selectedDate),
          end: endOfMonth(selectedDate),
        });
      } else if (period === "Yearly") {
        matchDate = isWithinInterval(saleDate, {
          start: startOfYear(selectedDate),
          end: endOfYear(selectedDate),
        });
      }

      return (
        matchDate &&
        (filteredCategory === "All" || sale.category === filteredCategory) &&
        sale.name.toLowerCase().includes(searchText.toLowerCase())
      );
    });
    
    setFilteredSales(newFiltered);
  };

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedSales = [...filteredSales].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue = sortConfig.key === 'total' ? a.price * a.quantity : a[sortConfig.key];
    let bValue = sortConfig.key === 'total' ? b.price * b.quantity : b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Category', 'Price', 'Quantity', 'Total', 'Date', 'Time'];
    const rows = filteredSales.map(sale => [
      sale.name,
      sale.category,
      sale.price,
      sale.quantity,
      sale.price * sale.quantity,
      sale.date,
      sale.time
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-${format(selectedDate, 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="p-4 md:p-6 bg-linear-to-br from-gray-50 to-gray-100 min-h-screen">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Sales</h1>
        <p className="text-gray-600">Track and analyze your sales performance</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
        >
          <CalendarDays size={18} />
          {format(selectedDate, "MMM dd, yyyy")}
        </button>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
        >
          <Download size={18} />
          Export
        </button>
        <button
          onClick={() => setCompareMode(!compareMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-colors ${
            compareMode ? 'bg-red-500 text-white' : 'bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter size={18} />
          Compare
        </button>
      </div>

      {/* Calendar */}
      {showCalendar && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <Calendar onChange={setSelectedDate} value={selectedDate} className="mx-auto border-0" />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow-lg rounded-xl p-5 border-l-4 border-red-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-medium text-sm">Total Sales</h3>
            <CircleDollarSign className="text-red-500" size={24} />
          </div>
          <p className="text-red-500 font-bold text-3xl mb-1">₱ {totalSales.toLocaleString()}</p>
          {compareMode && (
            <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">Previous {period.toLowerCase()}:</span>
                <span className="text-gray-700 text-sm font-semibold">₱ {previousPeriodSales.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                {salesGrowth >= 0 ? (
                  <>
                    <TrendingUp size={16} className="text-green-500" />
                    <span className="text-green-500 font-semibold">+{salesGrowth.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown size={16} className="text-red-600" />
                    <span className="text-red-600 font-semibold">{salesGrowth.toFixed(1)}%</span>
                  </>
                )}
                <span className="text-gray-500 text-xs">change</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white shadow-lg rounded-xl p-5 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-medium text-sm">Items Sold</h3>
            <Package className="text-blue-500" size={24} />
          </div>
          <p className="text-blue-500 font-bold text-3xl">{totalItems}</p>
          <p className="text-gray-500 text-sm mt-1">{uniqueTransactions} transactions</p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-5 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-medium text-sm">Avg Order Value</h3>
            <CircleDollarSign className="text-green-500" size={24} />
          </div>
          <p className="text-green-500 font-bold text-3xl">₱ {averageOrderValue.toFixed(0)}</p>
          <p className="text-gray-500 text-sm mt-1">Per transaction</p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-5 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-medium text-sm">Top Seller</h3>
            <TrendingUp className="text-purple-500" size={24} />
          </div>
          <p className="text-purple-500 font-bold text-xl mb-1">{topItem?.name || "N/A"}</p>
          <p className="text-gray-500 text-sm">₱ {(topItem?.total || 0).toLocaleString()} revenue</p>
        </div>
      </div>

      {/* Period & Chart Type Selection */}
      <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
        <div className="flex flex-wrap gap-2">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                period === p 
                  ? "bg-red-500 text-white shadow-md scale-105" 
                  : "bg-white border border-gray-300 text-gray-700 hover:border-red-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          {chartTypes.map((type) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                chartType === type 
                  ? "bg-gray-800 text-white" 
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={320}>
            {chartType === "Bar" ? (
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(value) => `₱${value.toLocaleString()}`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(value) => `₱ ${value.toLocaleString()}`} />
                <Bar dataKey="total" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            ) : chartType === "Line" ? (
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(value) => `₱${value.toLocaleString()}`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(value) => `₱ ${value.toLocaleString()}`} />
                <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="w-full max-w-2xl">
                  <PieChart width={600} height={320}>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₱ ${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </div>
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Search  and Category Filters */}
      <div className="bg-white p-4 rounded-xl shadow-lg mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="🔍 Search food items..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilteredCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filteredCategory === cat 
                    ? "bg-red-500 text-white shadow-md" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-linear-to-r from-red-500 to-red-600 text-white">
                <th 
                  className="py-3 px-4 text-left font-semibold cursor-pointer hover:bg-red-700 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="py-3 px-4 text-left font-semibold cursor-pointer hover:bg-red-700 transition-colors"
                  onClick={() => handleSort('price')}
                >
                  Price {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="py-3 px-4 text-left font-semibold cursor-pointer hover:bg-red-700 transition-colors"
                  onClick={() => handleSort('quantity')}
                >
                  Quantity {sortConfig.key === 'quantity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="py-3 px-4 text-left font-semibold cursor-pointer hover:bg-red-700 transition-colors"
                  onClick={() => handleSort('total')}
                >
                  Total {sortConfig.key === 'total' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="py-3 px-4 text-left font-semibold">Time</th>
                <th className="py-3 px-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {sortedSales.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`border-b hover:bg-red-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="py-3 px-4 font-medium text-gray-800">{item.name}</td>
                  <td className="py-3 px-4 text-gray-700">₱ {item.price.toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-700">{item.quantity}</td>
                  <td className="py-3 px-4 font-semibold text-red-600">₱ {(item.price * item.quantity).toLocaleString()}</td>
                  <td className="py-3 px-4 text-gray-600">{item.time}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-white bg-red-500 px-4 py-1.5 rounded-lg hover:bg-red-600 transition-colors shadow-sm font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {sortedSales.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500">
                    <Package size={48} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-lg font-medium">No sales data found</p>
                    <p className="text-sm">Try adjusting your filters</p>
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