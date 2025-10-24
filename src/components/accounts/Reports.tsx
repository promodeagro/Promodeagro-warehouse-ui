import React from "react";
import { useNavigate } from "react-router-dom";
import { loadAccounts } from "@/lib/accounts";
import { FileText, Download, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function Reports() {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = React.useState("this_month");
  const [customDateRange, setCustomDateRange] = React.useState({ from: "", to: "" });
  const [month, setMonth] = React.useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const computeRange = () => {
    const now = new Date();
    if (timeFilter === "today") {
      const y = now.getFullYear(); const m = now.getMonth(); const d = now.getDate();
      const start = new Date(y, m, d, 0,0,0,0); const end = new Date(y, m, d, 23,59,59,999);
      return { start, end, label: start.toLocaleString(undefined,{month:'long', day:'2-digit', year:'numeric'}) };
    }
    if (timeFilter === "this_week") {
      const day = now.getDay();
      const diff = (day+6)%7; // start Monday
      const start = new Date(now); start.setDate(now.getDate()-diff); start.setHours(0,0,0,0);
      const end = new Date(start); end.setDate(start.getDate()+6); end.setHours(23,59,59,999);
      return { start, end, label: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}` };
    }
    if (timeFilter === "last_month") {
      const start = new Date(now.getFullYear(), now.getMonth()-1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23,59,59,999);
      const label = start.toLocaleString(undefined,{month:'long', year:'numeric'});
      return { start, end, label };
    }
    if (timeFilter === "this_year") {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31, 23,59,59,999);
      const label = `${start.getFullYear()}`;
      return { start, end, label };
    }
    if (timeFilter === "custom" && customDateRange.from && customDateRange.to) {
      const start = new Date(customDateRange.from);
      const end = new Date(customDateRange.to + "T23:59:59.999");
      const label = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
      return { start, end, label };
    }
    // default this_month
    const y = now.getFullYear(); const m = now.getMonth();
    const start = new Date(y, m, 1);
    const end = new Date(y, m+1, 0, 23,59,59,999);
    const label = start.toLocaleString(undefined,{month:'long', year:'numeric'});
    return { start, end, label };
  };
  const exportReport = async (reportName: string) => {
    const { start, end, label: monthLabel } = computeRange();
    const w = window as any;
    const ensureLib = () => new Promise<void>((resolve, reject) => {
      if (w.html2pdf) return resolve();
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load PDF library'));
      document.head.appendChild(s);
    });
    await ensureLib();

    const accounts = loadAccounts();
    const assetAccounts = accounts.assets?.accounts || [];
    const liabilityAccounts = accounts.liabilities?.accounts || [];
    const equityAccounts = accounts.equity?.accounts || [];
    const totalAssets = assetAccounts.reduce((s,a)=>s+a.balance,0);
    const totalLiabilities = liabilityAccounts.reduce((s,a)=>s+a.balance,0);
    const totalEquity = equityAccounts.reduce((s,a)=>s+a.balance,0);

    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    const container = document.createElement('div');

    if (reportName === 'Balance Sheet') {
      const rowsHtml = (title: string, list: any[], color: string) => {
        const items = list.map((acc: any) => `<div style=\"padding:6px 0;border-bottom:1px solid #eee;display:flex;justify-content:space-between\"><span>${acc.name}</span><strong style=\"color:${color}\">₹${Number(acc.balance).toLocaleString()}</strong></div>`).join('');
        return `<h3>${title}</h3>${items}`;
      };
      container.innerHTML = `<div style=\"font-family:sans-serif;padding:16px;\"><h1>Balance Sheet - ${monthLabel}</h1><div style=\"margin-bottom:12px\"><strong>Accounting Equation:</strong> ₹${Number(totalAssets).toLocaleString()} = ₹${Number(totalLiabilities + totalEquity).toLocaleString()}</div>${rowsHtml('Assets', assetAccounts, '#3b82f6')}${rowsHtml('Liabilities', liabilityAccounts, '#ef4444')}<h3>Equity</h3><div style=\"display:flex;justify-content:space-between\"><span>Total Equity</span><strong style=\"color:#16a34a\">₹${Number(totalEquity).toLocaleString()}</strong></div></div>`;
      w.html2pdf().set({ filename: `balance-sheet-${month}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit:'pt', format:'a4' } }).from(container).save();
      return;
    }

    // helper maps for categories
    const isIncome = (name: string) => (accounts as any).income?.accounts?.some((a:any)=>a.name===name);
    const isExpense = (name: string) => (accounts as any).expenses?.accounts?.some((a:any)=>a.name===name);

    if (reportName === 'Sales Report') {
      const rowsMap: Record<string, { amount:number; txns:any[] }> = {};
      entries.forEach((entry:any) => {
        const d = new Date(entry.date);
        if (isNaN(d.getTime()) || d < start || d > end) return;
        (entry.lines||[]).forEach((l:any)=>{
          if (!isIncome(l.account)) return;
          const amt = (Number(l.credit)||0) - (Number(l.debit)||0);
          if (!rowsMap[l.account]) rowsMap[l.account] = { amount:0, txns:[] };
          rowsMap[l.account].amount += amt;
          rowsMap[l.account].txns.push({ date: entry.date, reference: entry.reference || entry.id || '', description: entry.description || '', amount: amt });
        });
      });
      const rows = Object.entries(rowsMap).map(([account, v])=>({account, ...v}));
      const totalSales = rows.reduce((s,r)=>s+r.amount,0);
      const items = rows.map(r=>{
        const tx = r.txns.map(t=>`<tr><td>${t.date}</td><td>${t.reference}</td><td>${t.description}</td><td style=\"text-align:right\">${t.amount}</td></tr>`).join('');
        return `<div style=\"margin-bottom:10px;border:1px solid #eee;border-radius:6px;padding:8px\"><div style=\"display:flex;justify-content:space-between\"><strong>${r.account}</strong><strong>₹${Number(r.amount).toLocaleString()}</strong></div>${tx?`<table style=\"width:100%;margin-top:6px;border-collapse:collapse\"><thead><tr><th align=\"left\">Date</th><th align=\"left\">Ref</th><th align=\"left\">Description</th><th align=\"right\">Amount</th></tr></thead><tbody>${tx}</tbody></table>`:''}</div>`;
      }).join('');
      container.innerHTML = `<div style=\"font-family:sans-serif;padding:16px;\"><h1>Sales Report - ${monthLabel}</h1><div>Total Sales: ₹${totalSales.toLocaleString()}</div>${items}</div>`;
      w.html2pdf().set({ filename: `sales-report-${month}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit:'pt', format:'a4' } }).from(container).save();
      return;
    }

    if (reportName === 'Profit & Loss Statement') {
      const incomeMap: Record<string, { amount:number; txns:any[] }> = {};
      const expenseMap: Record<string, { amount:number; txns:any[] }> = {};
      entries.forEach((entry:any) => {
        const d = new Date(entry.date);
        if (d < start || d > end) return;
        (entry.lines||[]).forEach((l:any)=>{
          if (isIncome(l.account)) {
            const amt = (Number(l.credit)||0) - (Number(l.debit)||0);
            if (!incomeMap[l.account]) incomeMap[l.account] = { amount:0, txns:[] };
            incomeMap[l.account].amount += amt;
            incomeMap[l.account].txns.push({ date: entry.date, ref: entry.reference||entry.id||'', desc: entry.description||'', amount: amt });
          } else if (isExpense(l.account)) {
            const amt = (Number(l.debit)||0) - (Number(l.credit)||0);
            if (!expenseMap[l.account]) expenseMap[l.account] = { amount:0, txns:[] };
            expenseMap[l.account].amount += amt;
            expenseMap[l.account].txns.push({ date: entry.date, ref: entry.reference||entry.id||'', desc: entry.description||'', amount: amt });
          }
        });
      });
      const incomeRows = Object.entries(incomeMap).map(([account,v])=>({account,...v}));
      const expenseRows = Object.entries(expenseMap).map(([account,v])=>({account,...v}));
      const totalIncome = incomeRows.reduce((s,r)=>s+r.amount,0);
      const totalExpenses = expenseRows.reduce((s,r)=>s+r.amount,0);
      const net = totalIncome - totalExpenses;
      const section = (title:string, rows:any[], color:string) => rows.map(r=>{
        const tx = r.txns.map((t:any)=>`<tr><td>${t.date}</td><td>${t.ref}</td><td>${t.desc}</td><td style=\"text-align:right\">${t.amount}</td></tr>`).join('');
        return `<div style=\"margin-bottom:10px;border:1px solid #eee;border-radius:6px;padding:8px\"><div style=\"display:flex;justify-content:space-between\"><strong>${r.account}</strong><strong style=\"color:${color}\">₹${Number(r.amount).toLocaleString()}</strong></div>${tx?`<table style=\"width:100%;margin-top:6px;border-collapse:collapse\"><thead><tr><th align=\"left\">Date</th><th align=\"left\">Ref</th><th align=\"left\">Description</th><th align=\"right\">Amount</th></tr></thead><tbody>${tx}</tbody></table>`:''}</div>`;
      }).join('');
      container.innerHTML = `<div style=\"font-family:sans-serif;padding:16px;\"><h1>Profit & Loss - ${monthLabel}</h1><h2>Income</h2>${section('Income', incomeRows, 'green')}<div><strong>Total Income:</strong> ₹${totalIncome.toLocaleString()}</div><h2 style=\"margin-top:12px\">Expenses</h2>${section('Expenses', expenseRows, 'red')}<div><strong>Total Expenses:</strong> ₹${totalExpenses.toLocaleString()}</div><div style=\"margin-top:12px\"><strong>Net Profit:</strong> ₹${net.toLocaleString()}</div></div>`;
      w.html2pdf().set({ filename: `profit-and-loss-${(month as string)}.pdf`, html2canvas:{scale:2}, jsPDF:{unit:'pt',format:'a4'} }).from(container).save();
      return;
    }

    if (reportName === 'Cash Flow Statement') {
      const cashNames = (accounts.assets?.accounts||[]).map((a:any)=>a.name.toLowerCase()).filter((n:string)=> n.includes('cash')||n.includes('bank'));
      const isCash = (name:string)=> cashNames.includes(String(name).toLowerCase());
      const financingHints = ['loan','capital','owner','draw','dividend','equity'];
      const categoryBy = new Map<string,string>();
      Object.entries(accounts).forEach(([cat,catObj]:any)=> (catObj.accounts||[]).forEach((a:any)=>{categoryBy.set(a.name,cat); categoryBy.set(a.code,cat);}));
      const rows = { op:[] as any[], inv:[] as any[], fin:[] as any[] };
      let op=0, inv=0, fin=0;
      entries.forEach((e:any)=>{
        const d = new Date(e.date); if (d<start||d>end) return;
        const cashDelta = (e.lines||[]).filter((l:any)=> isCash(l.account)).reduce((s:number,l:any)=> s + ((Number(l.debit)||0)-(Number(l.credit)||0)),0);
        if (!cashDelta) return;
        let hasFin=false, hasInv=false;
        (e.lines||[]).forEach((l:any)=>{
          if (isCash(l.account)) return;
          const cat = categoryBy.get(l.account)||'';
          if (cat==='liabilities'||cat==='equity') hasFin=true; if (cat==='assets') hasInv=true;
          const lname = String(l.account||'').toLowerCase(); if (financingHints.some(h=>lname.includes(h))) hasFin=true;
        });
        const row = { date:e.date, reference:e.reference||e.id||'', description:e.description||'', amount: cashDelta };
        if (hasFin) { rows.fin.push(row); fin+=cashDelta; }
        else if (hasInv) { rows.inv.push(row); inv+=cashDelta; }
        else { rows.op.push(row); op+=cashDelta; }
      });
      const renderRows = (arr:any[])=> arr.map(r=>`<div style=\"display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee\"><span>${r.date} ${r.reference?'- '+r.reference:''} ${r.description?'- '+r.description:''}</span><strong>₹${Number(r.amount).toLocaleString()}</strong></div>`).join('');
      container.innerHTML = `<div style=\"font-family:sans-serif;padding:16px;\"><h1>Cash Flow Statement - ${monthLabel}</h1><h3>Operating</h3>${renderRows(rows.op)}<div><strong>Net Operating:</strong> ₹${op.toLocaleString()}</div><h3 style=\"margin-top:12px\">Investing</h3>${renderRows(rows.inv)}<div><strong>Net Investing:</strong> ₹${inv.toLocaleString()}</div><h3 style=\"margin-top:12px\">Financing</h3>${renderRows(rows.fin)}<div><strong>Net Financing:</strong> ₹${fin.toLocaleString()}</div></div>`;
      w.html2pdf().set({ filename: `cash-flow-${(month as string)}.pdf`, html2canvas:{scale:2}, jsPDF:{unit:'pt',format:'a4'} }).from(container).save();
      return;
    }

    if (reportName === 'Customer Outstanding' || reportName === 'Vendor Outstanding') {
      const receivable = reportName === 'Customer Outstanding';
      const target = receivable ? 'Accounts Receivable' : 'Accounts Payable';
      let bal = 0; const rows:any[] = [];
      entries.forEach((e:any)=>{
        const d = new Date(e.date); if (d>end) return;
        const l = (e.lines||[]).find((x:any)=> x.account === target); if (!l) return;
        const debit = Number(l.debit)||0; const credit = Number(l.credit)||0;
        const delta = receivable ? (debit - credit) : (credit - debit);
        bal += delta; rows.push({ date:e.date, ref:e.reference||e.id||'', desc:e.description||'', delta, bal });
      });
      const items = rows.map(r=>`<tr><td>${r.date}</td><td>${r.ref}</td><td>${r.desc}</td><td style=\"text-align:right\">${r.delta}</td><td style=\"text-align:right\">${r.bal}</td></tr>`).join('');
      container.innerHTML = `<div style=\"font-family:sans-serif;padding:16px;\"><h1>${reportName} - ${monthLabel}</h1><div><strong>Total ${receivable?'Receivables':'Payables'}:</strong> ₹${bal.toLocaleString()}</div><table style=\"width:100%;margin-top:8px;border-collapse:collapse\"><thead><tr><th align=\"left\">Date</th><th align=\"left\">Ref</th><th align=\"left\">Description</th><th align=\"right\">Delta</th><th align=\"right\">Running Balance</th></tr></thead><tbody>${items}</tbody></table></div>`;
      w.html2pdf().set({ filename: `${receivable?'customer':'vendor'}-outstanding-${(month as string)}.pdf`, html2canvas:{scale:2}, jsPDF:{unit:'pt',format:'a4'} }).from(container).save();
      return;
    }
    if (reportName === 'Expenses Reports' || reportName === 'Expense Reports') {
      const rowsMap: Record<string, { amount:number; txns:any[] }> = {};
      entries.forEach((entry:any) => {
        const d = new Date(entry.date);
        if (isNaN(d.getTime()) || d < start || d > end) return;
        (entry.lines||[]).forEach((l:any)=>{
          if (!isExpense(l.account)) return;
          const amt = (Number(l.debit)||0) - (Number(l.credit)||0);
          if (!rowsMap[l.account]) rowsMap[l.account] = { amount:0, txns:[] };
          rowsMap[l.account].amount += amt;
          rowsMap[l.account].txns.push({ date: entry.date, reference: entry.reference || entry.id || '', description: entry.description || '', amount: amt });
        });
      });
      const rows = Object.entries(rowsMap).map(([account, v])=>({account, ...v}));
      const totalExpenses = rows.reduce((s,r)=>s+r.amount,0);
      const items = rows.map(r=>{
        const tx = r.txns.map(t=>`<tr><td>${t.date}</td><td>${t.reference}</td><td>${t.description}</td><td style=\"text-align:right\">${t.amount}</td></tr>`).join('');
        return `<div style=\"margin-bottom:10px;border:1px solid #eee;border-radius:6px;padding:8px\"><div style=\"display:flex;justify-content:space-between\"><strong>${r.account}</strong><strong>₹${Number(r.amount).toLocaleString()}</strong></div>${tx?`<table style=\"width:100%;margin-top:6px;border-collapse:collapse\"><thead><tr><th align=\"left\">Date</th><th align=\"left\">Ref</th><th align=\"left\">Description</th><th align=\"right\">Amount</th></tr></thead><tbody>${tx}</tbody></table>`:''}</div>`;
      }).join('');
      container.innerHTML = `<div style=\"font-family:sans-serif;padding:16px;\"><h1>Expenses Reports - ${monthLabel}</h1><div>Total Expenses: ₹${totalExpenses.toLocaleString()}</div>${items}</div>`;
      w.html2pdf().set({ filename: `expenses-reports-${month}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit:'pt', format:'a4' } }).from(container).save();
      return;
    }
  };
  const reports = [
    {
      name: "Profit & Loss Statement",
      description: "Income and expenses summary for a period",
      icon: TrendingUp,
      category: "Financial"
    },
    {
      name: "Balance Sheet",
      description: "Assets, liabilities, and equity at a point in time",
      icon: FileText,
      category: "Financial"
    },
    {
      name: "Cash Flow Statement",
      description: "Cash inflows and outflows analysis",
      icon: TrendingDown,
      category: "Financial"
    },
    {
      name: "Sales Report",
      description: "Sales analysis by products",
      icon: TrendingUp,
      category: "Sales"
    },
    {
      name: "Expenses Reports",
      description: "Expenses analysis by category and period",
      icon: FileText,
      category: "Expenses"
    },
    {
      name: "Customer Outstanding",
      description: "Accounts receivable aging report",
      icon: FileText,
      category: "Receivables"
    },
    {
      name: "Vendor Outstanding",
      description: "Accounts payable aging report",
      icon: FileText,
      category: "Payables"
    },
  ];

  const quickStats = {
    totalSales: 125430,
    totalExpenses: 78920,
    netProfit: 46510,
    cashBalance: 280000,
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate financial and business reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeFilter} onValueChange={(v)=> setTimeFilter(v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          {timeFilter === 'custom' && (
            <div className="flex items-center gap-2">
              <Input type="date" value={customDateRange.from} onChange={(e)=> setCustomDateRange(prev=>({...prev, from: e.target.value}))} />
              <Input type="date" value={customDateRange.to} onChange={(e)=> setCustomDateRange(prev=>({...prev, to: e.target.value}))} />
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Sales</p>
            <h3 className="text-2xl font-bold mt-2 text-success">₹{quickStats.totalSales.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <h3 className="text-2xl font-bold mt-2 text-destructive">₹{quickStats.totalExpenses.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Net Profit</p>
            <h3 className="text-2xl font-bold mt-2 text-success">₹{quickStats.netProfit.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Cash Balance</p>
            <h3 className="text-2xl font-bold mt-2">₹{quickStats.cashBalance.toLocaleString()}</h3>
          </CardContent>
        </Card>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.name} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <report.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{report.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">Category: {report.category}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button 
                  className="flex-1 gap-2" 
                  size="sm"
                  onClick={() => {
                    const slug = report.name.toLowerCase().replace(/\s+/g, '-');
                    const params = new URLSearchParams();
                    params.set('time', timeFilter);
                    if (timeFilter === 'custom') {
                      if (customDateRange.from) params.set('from', customDateRange.from);
                      if (customDateRange.to) params.set('to', customDateRange.to);
                    }
                    navigate(`/accounts/reports/${slug}?${params.toString()}`);
                  }}
                >
                  <FileText className="h-4 w-4" />
                  View Report
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => exportReport(report.name)}>
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}