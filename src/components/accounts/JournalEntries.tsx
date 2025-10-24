import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function JournalEntries() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({
    from: "",
    to: ""
  });

  // Seed + localStorage journal entries
  const seed = [
    {
      id: "JE-001",
      date: "2025-01-15",
      description: "Record online sales for the day",
      reference: "INV-001, INV-002",
      status: "posted",
      lines: [
        { account: "Bank - Current Account", debit: 2095, credit: 0 },
        { account: "Direct Sales", debit: 0, credit: 2095 },
      ]
    },
    {
      id: "JE-002",
      date: "2025-01-14",
      description: "Purchase from Green Farm Co.",
      reference: "PO-001",
      status: "posted",
      lines: [
        { account: "Inventory", debit: 12500, credit: 0 },
        { account: "Accounts Payable", debit: 0, credit: 12500 },
      ]
    },
    {
      id: "JE-003",
      date: "2025-01-14",
      description: "Fuel expense payment",
      reference: "EXP-001",
      status: "posted",
      lines: [
        { account: "Fuel Expense", debit: 2500, credit: 0 },
        { account: "Cash in Hand", debit: 0, credit: 2500 },
      ]
    },
    {
      id: "JE-004",
      date: "2025-01-15",
      description: "Cart sales revenue",
      reference: "CS-001",
      status: "posted",
      lines: [
        { account: "Cash in Hand", debit: 12450, credit: 0 },
        { account: "Sales - Cart", debit: 0, credit: 12450 },
      ]
    },
  ];

  const entries = useMemo(() => {
    try {
      setLoading(false);
      const stored = localStorage.getItem("journalEntries");
      const parsed = stored ? JSON.parse(stored) : [];
      
      // Filter out malformed entries and ensure they have required properties
      const validParsed = parsed.filter(entry => 
        entry && 
        entry.id && 
        entry.date && 
        entry.description && 
        entry.lines && 
        Array.isArray(entry.lines) &&
        entry.lines.length > 0
      );
      
      const allEntries = [...validParsed, ...seed];
      console.log("Journal entries loaded:", allEntries.length, "entries");
      console.log("Valid entries:", validParsed.length, "Invalid entries filtered:", parsed.length - validParsed.length);
      
      // Clean up localStorage if we found invalid entries
      if (validParsed.length !== parsed.length) {
        console.log("Cleaning up localStorage - removing invalid entries");
        localStorage.setItem("journalEntries", JSON.stringify(validParsed));
      }
      
      return allEntries;
    } catch (error) {
      console.error("Error loading journal entries:", error);
      setLoading(false);
      return seed;
    }
  }, []);

  // Filter entries based on search term and time filter
  const filteredEntries = useMemo(() => {
    let filtered = entries;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.lines.some(line => line.account.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Time filter
    if (timeFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        
        switch (timeFilter) {
          case "today":
            return entryDate >= today;
          case "this_week":
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            return entryDate >= weekStart;
          case "this_month":
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            return entryDate >= monthStart;
          case "last_month":
            const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
            return entryDate >= lastMonthStart && entryDate <= lastMonthEnd;
          case "this_year":
            const yearStart = new Date(today.getFullYear(), 0, 1);
            return entryDate >= yearStart;
          case "custom":
            if (customDateRange.from && customDateRange.to) {
              const fromDate = new Date(customDateRange.from);
              const toDate = new Date(customDateRange.to);
              return entryDate >= fromDate && entryDate <= toDate;
            }
            return true;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [entries, searchTerm, timeFilter, customDateRange]);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Journal Entries</h1>
            <p className="text-muted-foreground">Loading journal entries...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Journal Entries</h1>
          <p className="text-muted-foreground">Record and manage accounting transactions</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/accounts/journal-entries/new')}>
          <Plus className="h-4 w-4" />
          New Journal Entry
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search journal entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="this_year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Custom Date Range */}
            {timeFilter === "custom" && (
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    placeholder="From Date"
                    value={customDateRange.from}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, from: e.target.value }))}
                    className="w-40"
                  />
                </div>
                <span className="text-muted-foreground">to</span>
                <Input
                  type="date"
                  placeholder="To Date"
                  value={customDateRange.to}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="w-40"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Journal Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                {entries.length === 0 
                  ? "No journal entries found." 
                  : "No journal entries match your filters."
                }
              </p>
              <Button 
                className="mt-4" 
                onClick={() => navigate('/accounts/journal-entries/new')}
              >
                Create First Journal Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.filter(entry => entry && entry.lines && Array.isArray(entry.lines)).map((entry) => {
          const totalDebit = entry.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
          const totalCredit = entry.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
          
          return (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{entry.id}</CardTitle>
                      <Badge variant="default">{entry.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Date: {entry.date}</p>
                    <p className="text-sm font-medium mt-1">{entry.description}</p>
                    {entry.reference && (
                      <p className="text-sm text-muted-foreground">Ref: {entry.reference}</p>
                    )}
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/accounts/journal-entries/${entry.id}`)}>View</Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/accounts/journal-entries/${entry.id}/edit`)}>Edit</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-medium">Account</th>
                        <th className="text-right p-3 font-medium">Debit</th>
                        <th className="text-right p-3 font-medium">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.lines.map((line, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">{line.account || "Unknown Account"}</td>
                          <td className="p-3 text-right font-mono">
                            {(line.debit || 0) > 0 ? `₹${(line.debit || 0).toLocaleString()}` : "-"}
                          </td>
                          <td className="p-3 text-right font-mono">
                            {(line.credit || 0) > 0 ? `₹${(line.credit || 0).toLocaleString()}` : "-"}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t bg-muted font-semibold">
                        <td className="p-3">Total</td>
                        <td className="p-3 text-right font-mono">₹{totalDebit.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono">₹{totalCredit.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {totalDebit !== totalCredit && (
                  <p className="text-sm text-destructive mt-2">⚠️ Entry is not balanced!</p>
                )}
              </CardContent>
            </Card>
          );
        })
        )}
      </div>
    </div>
  );
}