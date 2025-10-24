import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Download, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { loadAccounts } from "@/lib/accounts";

export default function ReportDetail() {
  const navigate = useNavigate();
  const { reportName } = useParams();
  const location = useLocation();
  const qs = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const autoPdf = useMemo(() => qs.get('auto') === 'pdf', [qs]);

  const [month, setMonth] = useState<string>(() => {
    const time = qs.get('time');
    if (time === 'custom') {
      // fallback to this month display
    }
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [timeFilter, setTimeFilter] = useState(qs.get('time') || 'this_month');
  const [customDateRange, setCustomDateRange] = useState({ from: qs.get('from') || '', to: qs.get('to') || '' });

  const monthLabel = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    return new Date(y, (m || 1) - 1, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });
  }, [month]);

  const selectedRange = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    const start = new Date(y, (m || 1) - 1, 1);
    const end = new Date(y, (m || 1), 0, 23, 59, 59, 999);
    return { start, end };
  }, [month]);

  // Mock data based on report type
  const getReportData = () => {
    if (reportName === "profit-&-loss-statement") {
      return {
        title: "Profit & Loss Statement",
        period: "October 2025",
        income: [
          { account: "Sales - Online", amount: 95430 },
          { account: "Sales - Cart", amount: 30000 },
          { account: "Other Income", amount: 4500 },
        ],
        expenses: [
          { account: "Cost of Goods Sold", amount: 55000 },
          { account: "Fuel Expense", amount: 2500 },
          { account: "Salary Expense", amount: 15000 },
          { account: "Rent Expense", amount: 8000 },
          { account: "Maintenance Expense", amount: 4500 },
          { account: "Damage/Loss", amount: 1200 },
        ],
      };
    }
    return {
      title: reportName?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || "Report",
      period: "October 2025",
    };
  };

  const reportData = getReportData();
  const placeholderIncome = reportData.income?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const placeholderExpenses = reportData.expenses?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const placeholderNet = placeholderIncome - placeholderExpenses;

  const { incomeRows, expenseRows, computedIncome, computedExpenses, computedNet, incomeDetails, expenseDetails } = useMemo(() => {
    if (reportName !== "profit-&-loss-statement") {
      return { incomeRows: [], expenseRows: [], computedIncome: 0, computedExpenses: 0, computedNet: 0, incomeDetails: {}, expenseDetails: {} };
    }
    const { start, end } = selectedRange;
    const entries = JSON.parse(localStorage.getItem("journalEntries") || "[]");
    const accountsMap: Record<string, { category: string }> = {};
    const accts = loadAccounts();
    Object.entries(accts).forEach(([cat, catObj]: any) => {
      catObj.accounts.forEach((a: any) => {
        accountsMap[a.name] = { category: cat };
        accountsMap[a.code] = { category: cat };
      });
    });

    const incomeAgg: Record<string, number> = {};
    const expenseAgg: Record<string, number> = {};
    const incomeDetails: Record<string, any[]> = {};
    const expenseDetails: Record<string, any[]> = {};

    entries.forEach((entry: any) => {
      const d = new Date(entry.date);
      if (isNaN(d.getTime()) || d < start || d > end) return;
      (entry.lines || []).forEach((line: any) => {
        const accountName = line.account;
        const meta = accountsMap[accountName] || { category: "" };
        const debit = Number(line.debit) || 0;
        const credit = Number(line.credit) || 0;
        if (meta.category === "income") {
          const delta = credit - debit;
          incomeAgg[accountName] = (incomeAgg[accountName] || 0) + delta;
          (incomeDetails[accountName] = incomeDetails[accountName] || []).push({
            date: entry.date,
            reference: entry.reference || entry.id || "",
            description: entry.description || "",
            debit, credit, amount: delta
          });
        } else if (meta.category === "expenses") {
          const delta = debit - credit;
          expenseAgg[accountName] = (expenseAgg[accountName] || 0) + delta;
          (expenseDetails[accountName] = expenseDetails[accountName] || []).push({
            date: entry.date,
            reference: entry.reference || entry.id || "",
            description: entry.description || "",
            debit, credit, amount: delta
          });
        }
      });
    });

    const incomeRows = Object.entries(incomeAgg).filter(([, v]) => v !== 0).map(([k, v]) => ({ account: k, amount: v }));
    const expenseRows = Object.entries(expenseAgg).filter(([, v]) => v !== 0).map(([k, v]) => ({ account: k, amount: v }));
    const computedIncome = incomeRows.reduce((s, r) => s + r.amount, 0);
    const computedExpenses = expenseRows.reduce((s, r) => s + r.amount, 0);
    const computedNet = computedIncome - computedExpenses;
    return { incomeRows, expenseRows, computedIncome, computedExpenses, computedNet, incomeDetails, expenseDetails };
  }, [reportName, selectedRange]);

  // Balance Sheet data from chart of accounts
  const accounts = loadAccounts();
  const assetAccounts = accounts.assets?.accounts || [];
  const liabilityAccounts = accounts.liabilities?.accounts || [];
  const equityAccounts = accounts.equity?.accounts || [];
  const totalAssets = assetAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = liabilityAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalEquity = equityAccounts.reduce((sum, a) => sum + a.balance, 0);

  // Helpers for Cash Flow Statement
  const cashAccountNames = useMemo(() => {
    const names: string[] = [];
    (assetAccounts || []).forEach(a => {
      const n = a.name.toLowerCase();
      if (n.includes('cash') || n.includes('bank')) names.push(a.name);
    });
    return names;
  }, [assetAccounts]);

  const cashFlowData = useMemo(() => {
    if (reportName !== 'cash-flow-statement') {
      return {
        operatingRows: [] as any[], investingRows: [] as any[], financingRows: [] as any[],
        totalOperating: 0, totalInvesting: 0, totalFinancing: 0,
        openingCash: 0, netChange: 0, closingCash: 0,
      };
    }
    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    const categorize = (flags: { hasFinancing: boolean; hasInvesting: boolean }) => {
      if (flags.hasFinancing) return 'financing';
      if (flags.hasInvesting) return 'investing';
      return 'operating';
    };
    // Build map name/code -> category
    const categoryBy = new Map<string,string>();
    Object.entries(accounts).forEach(([cat, catObj]: any) => {
      (catObj.accounts || []).forEach((a: any) => {
        categoryBy.set(a.name, cat);
        categoryBy.set(a.code, cat);
      });
    });

    const inRange = (dateStr: string) => {
      const d = new Date(dateStr);
      return !isNaN(d.getTime()) && d >= selectedRange.start && d <= selectedRange.end;
    };
    const beforeStart = (dateStr: string) => {
      const d = new Date(dateStr);
      return !isNaN(d.getTime()) && d < selectedRange.start;
    };

    // Opening cash = base cash (from accounts) minus deltas after month start up to now; simpler: compute from deltas up to start
    const baseCash = (assetAccounts || []).filter(a => cashAccountNames.includes(a.name)).reduce((s,a)=> s + a.balance, 0);
    let monthDelta = 0;
    let postMonthDelta = 0;

    const operatingRows: any[] = [];
    const investingRows: any[] = [];
    const financingRows: any[] = [];
    let totalOperating = 0, totalInvesting = 0, totalFinancing = 0;

    entries.forEach((entry: any) => {
      // cash delta for entry
      const cashLines = (entry.lines || []).filter((l: any) => cashAccountNames.includes(l.account));
      if (!cashLines.length) {
        // if cash account referenced by code-to-name mapping in data
        (entry.lines || []).forEach((l: any) => {
          // no-op
        });
      }
      const cashDelta = cashLines.reduce((s: number, l: any) => s + ((Number(l.debit)||0) - (Number(l.credit)||0)), 0);
      if (cashDelta === 0) {
        // could still be cash via codes; skip
      }
      // For categorization, prefer Financing if any counterpart hits liabilities/equity (or name hints),
      // else Investing if any counterpart hits assets, else Operating
      let hasFinancing = false;
      let hasInvesting = false;
      const financingHints = ['loan', 'capital', 'owner', 'draw', 'dividend', 'equity'];
      (entry.lines || []).forEach((l: any) => {
        if (cashAccountNames.includes(l.account)) return;
        const cat = categoryBy.get(l.account) || '';
        if (cat === 'liabilities' || cat === 'equity') hasFinancing = true;
        if (cat === 'assets') hasInvesting = true;
        const lname = String(l.account || '').toLowerCase();
        if (financingHints.some(h => lname.includes(h))) hasFinancing = true;
      });
      const bucket = categorize({ hasFinancing, hasInvesting });

      if (inRange(entry.date)) {
        if (cashDelta !== 0) {
          const row = {
            date: entry.date,
            reference: entry.reference || entry.id || '',
            description: entry.description || '',
            amount: cashDelta,
          };
          if (bucket === 'operating') { operatingRows.push(row); totalOperating += cashDelta; }
          else if (bucket === 'investing') { investingRows.push(row); totalInvesting += cashDelta; }
          else { financingRows.push(row); totalFinancing += cashDelta; }
        }
      } else if (beforeStart(entry.date)) {
        // affect opening cash
        monthDelta += cashDelta; // accumulated prior to month
      } else {
        // after month, contributes to postMonthDelta (not used here)
        postMonthDelta += cashDelta;
      }
    });

    // Opening derived from current balance minus deltas after start? Without historic base, estimate opening = baseCash - (net of in-month cash delta) - (deltas after month?)
    const netChange = totalOperating + totalInvesting + totalFinancing;
    // Try to compute opening by subtracting all deltas since start from current: current = opening + netChange + afterMonthDelta; so opening = current - netChange - afterMonthDelta
    const openingCash = baseCash - netChange - postMonthDelta;
    const closingCash = openingCash + netChange;

    return { operatingRows, investingRows, financingRows, totalOperating, totalInvesting, totalFinancing, openingCash, netChange, closingCash };
  }, [reportName, selectedRange, accounts, assetAccounts, cashAccountNames]);

  // Sales Report data (income accounts only)
  const salesData = useMemo(() => {
    if (reportName !== 'sales-report') {
      return { totalSales: 0, rows: [] as { account: string; amount: number; txns: any[] }[] };
    }
    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    const rowsMap: Record<string, { amount: number; txns: any[] }> = {};
    entries.forEach((entry: any) => {
      const d = new Date(entry.date);
      if (isNaN(d.getTime()) || d < selectedRange.start || d > selectedRange.end) return;
      (entry.lines || []).forEach((line: any) => {
        const acc = line.account;
        const cat = (accounts as any).income?.accounts?.some((a: any) => a.name === acc) ? 'income' : '';
        if (cat !== 'income') return;
        const amount = (Number(line.credit) || 0) - (Number(line.debit) || 0);
        if (!rowsMap[acc]) rowsMap[acc] = { amount: 0, txns: [] };
        rowsMap[acc].amount += amount;
        rowsMap[acc].txns.push({ date: entry.date, reference: entry.reference || entry.id || '', description: entry.description || '', amount });
      });
    });
    const rows = Object.entries(rowsMap).map(([account, v]) => ({ account, amount: v.amount, txns: v.txns }));
    const totalSales = rows.reduce((s, r) => s + r.amount, 0);
    return { totalSales, rows };
  }, [reportName, selectedRange, accounts]);

  // Expense Reports (expenses accounts only)
  const expenseReport = useMemo(() => {
    if (reportName !== 'expense-reports' && reportName !== 'expenses-reports') {
      return { totalExpenses: 0, rows: [] as { account: string; amount: number; txns: any[] }[] };
    }
    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    const rowsMap: Record<string, { amount: number; txns: any[] }> = {};
    entries.forEach((entry: any) => {
      const d = new Date(entry.date);
      if (isNaN(d.getTime()) || d < selectedRange.start || d > selectedRange.end) return;
      (entry.lines || []).forEach((line: any) => {
        const acc = line.account;
        const cat = (accounts as any).expenses?.accounts?.some((a: any) => a.name === acc) ? 'expenses' : '';
        if (cat !== 'expenses') return;
        const amount = (Number(line.debit) || 0) - (Number(line.credit) || 0);
        if (!rowsMap[acc]) rowsMap[acc] = { amount: 0, txns: [] };
        rowsMap[acc].amount += amount;
        rowsMap[acc].txns.push({ date: entry.date, reference: entry.reference || entry.id || '', description: entry.description || '', amount });
      });
    });
    const rows = Object.entries(rowsMap).map(([account, v]) => ({ account, amount: v.amount, txns: v.txns }));
    const totalExpenses = rows.reduce((s, r) => s + r.amount, 0);
    return { totalExpenses, rows };
  }, [reportName, selectedRange, accounts]);

  // Receivables/Payables Outstanding (aging simplified to month snapshot)
  const outstanding = useMemo(() => {
    if (reportName !== 'customer-outstanding' && reportName !== 'vendor-outstanding') return { rows: [] as any[], total: 0 };
    const isReceivable = reportName === 'customer-outstanding';
    const targetAccountName = isReceivable ? 'Accounts Receivable' : 'Accounts Payable';
    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    let balance = 0;
    const txns: any[] = [];
    entries.forEach((entry: any) => {
      const d = new Date(entry.date);
      if (isNaN(d.getTime()) || d > selectedRange.end) return; // up to selected month end
      const line = (entry.lines || []).find((l: any) => l.account === targetAccountName);
      if (!line) return;
      const debit = Number(line.debit) || 0;
      const credit = Number(line.credit) || 0;
      // Receivable increases with debits; payable increases with credits
      const delta = isReceivable ? (debit - credit) : (credit - debit);
      balance += delta;
      txns.push({ date: entry.date, reference: entry.reference || entry.id || '', description: entry.description || '', delta, balance });
    });
    return { rows: txns, total: balance };
  }, [reportName, selectedRange]);

  // Build balance sheet transaction details for the selected month
  const balanceDetailsByAccount = useMemo(() => {
    const map: Record<string, { date: string; reference: string; description: string; debit: number; credit: number; amount: number }[]> = {};
    const entries = JSON.parse(localStorage.getItem("journalEntries") || "[]");
    entries.forEach((entry: any) => {
      const d = new Date(entry.date);
      if (isNaN(d.getTime()) || d < selectedRange.start || d > selectedRange.end) return;
      (entry.lines || []).forEach((line: any) => {
        const accountName = line.account;
        const debit = Number(line.debit) || 0;
        const credit = Number(line.credit) || 0;
        (map[accountName] = map[accountName] || []).push({
          date: entry.date,
          reference: entry.reference || entry.id || "",
          description: entry.description || "",
          debit,
          credit,
          amount: debit - credit,
        });
      });
    });
    return map;
  }, [selectedRange]);

  // After defining salesData, expenseReport, balanceDetails, etc., add an export function
  const exportCurrentReportPdf = async () => {
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
    if (reportName === 'balance-sheet') {
      const container = document.createElement('div');
      const rowsHtml = (title: string, list: any[], color: string) => {
        const items = list.map((acc: any) => {
          const txns = (balanceDetailsByAccount[acc.name] || []).map(t => `<tr><td>${t.date}</td><td>${t.reference}</td><td>${t.description}</td><td style="text-align:right">${t.debit}</td><td style="text-align:right">${t.credit}</td><td style="text-align:right">${t.amount}</td></tr>`).join('');
          return `<div style="padding:8px;border:1px solid #eee;border-radius:6px;margin-bottom:8px"><div style="display:flex;justify-content:space-between"><strong>${acc.name}</strong><strong style="color:${color}">₹${Number(acc.balance).toLocaleString()}</strong></div>${txns ? `<table style="width:100%;margin-top:8px;border-collapse:collapse"><thead><tr><th align="left">Date</th><th align="left">Ref</th><th align="left">Description</th><th align="right">Debit</th><th align="right">Credit</th><th align="right">Amount</th></tr></thead><tbody>${txns}</tbody></table>`: ''}</div>`;
        }).join('');
        return `<h3>${title}</h3>${items}`;
      };
      container.innerHTML = `<div style="font-family:sans-serif;padding:16px;"><h1>Balance Sheet - ${monthLabel}</h1><div style="margin-bottom:12px"><strong>Accounting Equation:</strong> ₹${Number(totalAssets).toLocaleString()} = ₹${Number(totalLiabilities + totalEquity).toLocaleString()}</div>${rowsHtml('Assets', assetAccounts, '#3b82f6')}${rowsHtml('Liabilities', liabilityAccounts, '#ef4444')}${rowsHtml('Equity', equityAccounts, '#16a34a')}</div>`;
      w.html2pdf().set({ filename: `balance-sheet-${month}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'pt', format: 'a4' } }).from(container).save();
    } else if (reportName === 'profit-&-loss-statement') {
      const container = document.createElement('div');
      const rowsHtml = (label: string, rows: any, details: Record<string, any[]>, color: string) => {
        const items = rows.map((r: any) => {
          const txns = (details[r.account] || []).map(t => `<tr><td>${t.date}</td><td>${t.reference}</td><td>${t.description}</td><td style="text-align:right">${t.debit}</td><td style="text-align:right">${t.credit}</td><td style="text-align:right">${t.amount}</td></tr>`).join('');
          return `<div style="padding:8px;border:1px solid #eee;border-radius:6px;margin-bottom:8px"><div style="display:flex;justify-content:space-between"><strong>${r.account}</strong><strong style="color:${color}">₹${Number(r.amount).toLocaleString()}</strong></div>${txns ? `<table style="width:100%;margin-top:8px;border-collapse:collapse"><thead><tr><th align="left">Date</th><th align="left">Ref</th><th align="left">Description</th><th align="right">Debit</th><th align="right">Credit</th><th align="right">Amount</th></tr></thead><tbody>${txns}</tbody></table>`: ''}</div>`;
        }).join('');
        return `<h3>${label}</h3>${items}`;
      };
      container.innerHTML = `<div style="font-family:sans-serif;padding:16px;"><h1>Profit & Loss - ${monthLabel}</h1><div>Total Income: ₹${(computedIncome || 0).toLocaleString()}</div><div>Total Expenses: ₹${(computedExpenses || 0).toLocaleString()}</div><div>Net Profit: ₹${(computedNet || 0).toLocaleString()}</div>${rowsHtml('Income', incomeRows, incomeDetails, 'green')}${rowsHtml('Expenses', expenseRows, expenseDetails, 'red')}</div>`;
      w.html2pdf().set({ filename: `profit-and-loss-${month}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'pt', format: 'a4' } }).from(container).save();
    } else if (reportName === 'sales-report') {
      const container = document.createElement('div');
      const items = salesData.rows.map(r => {
        const txns = r.txns.map(t => `<tr><td>${t.date}</td><td>${t.reference}</td><td>${t.description}</td><td style="text-align:right">${t.amount}</td></tr>`).join('');
        return `<div style="padding:8px;border:1px solid #eee;border-radius:6px;margin-bottom:8px"><div style="display:flex;justify-content:space-between"><strong>${r.account}</strong><strong>₹${Number(r.amount).toLocaleString()}</strong></div>${txns ? `<table style="width:100%;margin-top:8px;border-collapse:collapse"><thead><tr><th align="left">Date</th><th align="left">Ref</th><th align="left">Description</th><th align="right">Amount</th></tr></thead><tbody>${txns}</tbody></table>`: ''}</div>`;
      }).join('');
      container.innerHTML = `<div style="font-family:sans-serif;padding:16px;"><h1>Sales Report - ${monthLabel}</h1><div>Total Sales: ₹${salesData.totalSales.toLocaleString()}</div>${items}</div>`;
      w.html2pdf().set({ filename: `sales-report-${month}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'pt', format: 'a4' } }).from(container).save();
    } else if (reportName === 'expense-reports' || reportName === 'expenses-reports') {
      const container = document.createElement('div');
      const items = expenseReport.rows.map(r => {
        const txns = r.txns.map(t => `<tr><td>${t.date}</td><td>${t.reference}</td><td>${t.description}</td><td style="text-align:right">${t.amount}</td></tr>`).join('');
        return `<div style="padding:8px;border:1px solid #eee;border-radius:6px;margin-bottom:8px"><div style="display:flex;justify-content:space-between"><strong>${r.account}</strong><strong>₹${Number(r.amount).toLocaleString()}</strong></div>${txns ? `<table style="width:100%;margin-top:8px;border-collapse:collapse"><thead><tr><th align="left">Date</th><th align="left">Ref</th><th align="left">Description</th><th align="right">Amount</th></tr></thead><tbody>${txns}</tbody></table>`: ''}</div>`;
      }).join('');
      container.innerHTML = `<div style="font-family:sans-serif;padding:16px;"><h1>Expenses Reports - ${monthLabel}</h1><div>Total Expenses: ₹${expenseReport.totalExpenses.toLocaleString()}</div>${items}</div>`;
      w.html2pdf().set({ filename: `expenses-reports-${month}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'pt', format: 'a4' } }).from(container).save();
    } else if (reportName === 'customer-outstanding') {
      const container = document.createElement('div');
      const items = outstanding.rows.map(t => {
        return `<div style="padding:8px;border:1px solid #eee;border-radius:6px;margin-bottom:8px"><div style="display:flex;justify-content:space-between"><strong>${targetAccountName}</strong><strong>₹${Number(t.balance).toLocaleString()}</strong></div><p>Date: ${t.date}, Ref: ${t.reference}, Description: ${t.description}, Delta: ${t.delta}, Running Balance: ${t.balance}</p></div>`;
      }).join('');
      container.innerHTML = `<div style="font-family:sans-serif;padding:16px;"><h1>Customer Outstanding (A/R) - ${monthLabel}</h1><div>Total Receivables: ₹${outstanding.total.toLocaleString()}</div>${items}</div>`;
      w.html2pdf().set({ filename: `customer-outstanding-${month}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'pt', format: 'a4' } }).from(container).save();
    } else if (reportName === 'vendor-outstanding') {
      const container = document.createElement('div');
      const items = outstanding.rows.map(t => {
        return `<div style="padding:8px;border:1px solid #eee;border-radius:6px;margin-bottom:8px"><div style="display:flex;justify-content:space-between"><strong>${targetAccountName}</strong><strong>₹${Number(t.balance).toLocaleString()}</strong></div><p>Date: ${t.date}, Ref: ${t.reference}, Description: ${t.description}, Delta: ${t.delta}, Running Balance: ${t.balance}</p></div>`;
      }).join('');
      container.innerHTML = `<div style="font-family:sans-serif;padding:16px;"><h1>Vendor Outstanding (A/P) - ${monthLabel}</h1><div>Total Payables: ₹${outstanding.total.toLocaleString()}</div>${items}</div>`;
      w.html2pdf().set({ filename: `vendor-outstanding-${month}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'pt', format: 'a4' } }).from(container).save();
    }
  };

  useEffect(() => {
    if (autoPdf) {
      exportCurrentReportPdf().finally(() => {
        const close = new URLSearchParams(location.search).get('close') === '1';
        if (close) {
          window.close();
        }
      });
    }
  }, [autoPdf]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/reports")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{reportName === "profit-&-loss-statement" ? "Profit & Loss Statement" : (reportName === "balance-sheet" ? "Balance Sheet" : reportName === "cash-flow-statement" ? "Cash Flow Statement" : reportData.title)}</h1>
            <p className="text-muted-foreground">{monthLabel}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={timeFilter} onValueChange={(v) => {
            setTimeFilter(v);
            const d = new Date();
            if (v === 'today' || v === 'this_week' || v === 'this_month') {
              const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,'0'); setMonth(`${y}-${m}`);
            } else if (v === 'last_month') {
              const nd = new Date(d.getFullYear(), d.getMonth()-1, 1); const y = nd.getFullYear(); const m = String(nd.getMonth()+1).padStart(2,'0'); setMonth(`${y}-${m}`);
            } else if (v === 'this_year') {
              const y = d.getFullYear(); setMonth(`${y}-01`);
            }
          }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>
          {/* Month input removed; time filter dropdown controls the period */}
          <Button variant="outline" onClick={async () => {
            try { await exportCurrentReportPdf(); } catch {}
          }}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => {
            const download = (filename: string, mime: string, content: string) => {
              const blob = new Blob([content], { type: mime });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
            };
            if (reportName === 'balance-sheet') {
              const rows: string[] = [];
              rows.push('Section,Account,Amount');
              const accts = loadAccounts();
              (accts.assets?.accounts || []).forEach(a => rows.push(`Assets,${a.name},${a.balance}`));
              rows.push(`Assets,Total Assets,${(accts.assets?.accounts || []).reduce((s:any,a:any)=>s+a.balance,0)}`);
              (accts.liabilities?.accounts || []).forEach(a => rows.push(`Liabilities,${a.name},${a.balance}`));
              rows.push(`Liabilities,Total Liabilities,${(accts.liabilities?.accounts || []).reduce((s:any,a:any)=>s+a.balance,0)}`);
              rows.push(`Equity,Total Equity,${(accts.equity?.accounts || []).reduce((s:any,a:any)=>s+a.balance,0)}`);
              download(`balance-sheet-${month}.csv`, 'text/csv;charset=utf-8;', rows.join('\n'));
            } else if (reportName === 'profit-&-loss-statement') {
              const rows: string[] = [];
              rows.push('Section,Account,Amount');
              incomeRows.forEach((r:any)=> {
                rows.push(`Income,${r.account},${r.amount}`);
                rows.push(',,Date,Ref,Description,Debit,Credit,Amount');
                (incomeDetails[r.account] || []).forEach(t => rows.push(`,,${t.date},${t.reference},${t.description},${t.debit},${t.credit},${t.amount}`));
              });
              rows.push(`Income,Total Income,${(computedIncome || 0)}`);
              expenseRows.forEach((r:any)=> {
                rows.push(`Expenses,${r.account},${r.amount}`);
                rows.push(',,Date,Ref,Description,Debit,Credit,Amount');
                (expenseDetails[r.account] || []).forEach(t => rows.push(`,,${t.date},${t.reference},${t.description},${t.debit},${t.credit},${t.amount}`));
              });
              rows.push(`Expenses,Total Expenses,${(computedExpenses || 0)}`);
              rows.push(`Summary,Net Profit,${(computedNet || 0)}`);
              download(`profit-and-loss-${month}.csv`, 'text/csv;charset=utf-8;', rows.join('\n'));
            } else if (reportName === 'sales-report') {
              const rows: string[] = [];
              rows.push('Account,Amount');
              salesData.rows.forEach(r => {
                rows.push(`${r.account},${r.amount}`);
                rows.push(',,Date,Ref,Description,Amount');
                r.txns.forEach((t:any) => rows.push(`,,${t.date},${t.reference},${t.description},${t.amount}`));
              });
              rows.push(`Total Sales,${salesData.totalSales}`);
              download(`sales-report-${month}.csv`, 'text/csv;charset=utf-8;', rows.join('\n'));
            } else if (reportName === 'expense-reports') {
              const rows: string[] = [];
              rows.push('Account,Amount');
              expenseReport.rows.forEach(r => {
                rows.push(`${r.account},${r.amount}`);
                rows.push(',,Date,Ref,Description,Amount');
                r.txns.forEach((t:any) => rows.push(`,,${t.date},${t.reference},${t.description},${t.amount}`));
              });
              rows.push(`Total Expenses,${expenseReport.totalExpenses}`);
              download(`expense-reports-${month}.csv`, 'text/csv;charset=utf-8;', rows.join('\n'));
            } else if (reportName === 'customer-outstanding') {
              const rows: string[] = [];
              rows.push('Account,Running Balance');
              outstanding.rows.forEach(t => {
                rows.push(`${targetAccountName},${t.balance}`);
                rows.push(',,Date,Ref,Description,Delta,Running Balance');
                rows.push(`,,${t.date},${t.reference},${t.description},${t.delta},${t.balance}`);
              });
              download(`customer-outstanding-${month}.csv`, 'text/csv;charset=utf-8;', rows.join('\n'));
            } else if (reportName === 'vendor-outstanding') {
              const rows: string[] = [];
              rows.push('Account,Running Balance');
              outstanding.rows.forEach(t => {
                rows.push(`${targetAccountName},${t.balance}`);
                rows.push(',,Date,Ref,Description,Delta,Running Balance');
                rows.push(`,,${t.date},${t.reference},${t.description},${t.delta},${t.balance}`);
              });
              download(`vendor-outstanding-${month}.csv`, 'text/csv;charset=utf-8;', rows.join('\n'));
            }
          }}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {reportName === "profit-&-loss-statement" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="pl-report">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Total Income</p>
                <h3 className="text-2xl font-bold mt-2 text-success">₹{(computedIncome || placeholderIncome).toLocaleString()}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <h3 className="text-2xl font-bold mt-2 text-destructive">₹{(computedExpenses || placeholderExpenses).toLocaleString()}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <h3 className="text-2xl font-bold mt-2 text-success">₹{(computedNet || placeholderNet).toLocaleString()}</h3>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3" id="pl-report">
                {incomeRows.map((item: any, index: number) => (
                  <div key={index} className="p-3 bg-muted rounded-lg cursor-pointer" onClick={(e) => {
                    const detailsEl = (e.currentTarget as HTMLElement).querySelector('.details');
                    if (detailsEl) detailsEl.classList.toggle('hidden');
                  }}>
                    <div className="flex items-center justify-between">
                    <p className="font-medium">{item.account}</p>
                    <p className="font-semibold text-success">₹{item.amount.toLocaleString()}</p>
                    </div>
                    <div className="details hidden mt-2">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-muted-foreground">
                              <th className="text-left py-1">Date</th>
                              <th className="text-left py-1">Ref</th>
                              <th className="text-left py-1">Description</th>
                              <th className="text-right py-1">Debit</th>
                              <th className="text-right py-1">Credit</th>
                              <th className="text-right py-1">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(incomeDetails[item.account] || []).map((t, i) => (
                              <tr key={i} className="border-t">
                                <td className="py-1">{t.date}</td>
                                <td className="py-1">{t.reference}</td>
                                <td className="py-1">{t.description}</td>
                                <td className="py-1 text-right">{t.debit}</td>
                                <td className="py-1 text-right">{t.credit}</td>
                                <td className="py-1 text-right">{t.amount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border-2 border-success/20">
                  <p className="font-bold">Total Income</p>
                  <p className="font-bold text-success">₹{(computedIncome || placeholderIncome).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-destructive" />
                Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3" id="pl-report">
                {expenseRows.map((item: any, index: number) => (
                  <div key={index} className="p-3 bg-muted rounded-lg cursor-pointer" onClick={(e) => {
                    const detailsEl = (e.currentTarget as HTMLElement).querySelector('.details');
                    if (detailsEl) detailsEl.classList.toggle('hidden');
                  }}>
                    <div className="flex items-center justify-between">
                    <p className="font-medium">{item.account}</p>
                    <p className="font-semibold text-destructive">₹{item.amount.toLocaleString()}</p>
                    </div>
                    <div className="details hidden mt-2">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-muted-foreground">
                              <th className="text-left py-1">Date</th>
                              <th className="text-left py-1">Ref</th>
                              <th className="text-left py-1">Description</th>
                              <th className="text-right py-1">Debit</th>
                              <th className="text-right py-1">Credit</th>
                              <th className="text-right py-1">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(expenseDetails[item.account] || []).map((t, i) => (
                              <tr key={i} className="border-t">
                                <td className="py-1">{t.date}</td>
                                <td className="py-1">{t.reference}</td>
                                <td className="py-1">{t.description}</td>
                                <td className="py-1 text-right">{t.debit}</td>
                                <td className="py-1 text-right">{t.credit}</td>
                                <td className="py-1 text-right">{t.amount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border-2 border-destructive/20">
                  <p className="font-bold">Total Expenses</p>
                  <p className="font-bold text-destructive">₹{(computedExpenses || placeholderExpenses).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3" id="pl-report">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <p className="font-medium">Total Income</p>
                  <p className="font-semibold text-success">₹{(computedIncome || placeholderIncome).toLocaleString()}</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <p className="font-medium">Total Expenses</p>
                  <p className="font-semibold text-destructive">₹{(computedExpenses || placeholderExpenses).toLocaleString()}</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                  <p className="text-lg font-bold">Net Profit</p>
                  <p className="text-2xl font-bold text-success">₹{(computedNet || placeholderNet).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {reportName === 'cash-flow-statement' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="cashflow-report">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Opening Cash</p>
                <h3 className="text-2xl font-bold mt-2">₹{cashFlowData.openingCash.toLocaleString()}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Net Change</p>
                <h3 className="text-2xl font-bold mt-2">₹{cashFlowData.netChange.toLocaleString()}</h3>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Closing Cash</p>
                <h3 className="text-2xl font-bold mt-2 text-success">₹{cashFlowData.closingCash.toLocaleString()}</h3>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Operating Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cashFlowData.operatingRows.map((row, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <p className="font-medium">{row.date} {row.reference && `- ${row.reference}`} {row.description && `- ${row.description}`}</p>
                    <p className="font-semibold">₹{row.amount.toLocaleString()}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <p className="font-bold">Net Cash from Operating</p>
                  <p className="font-bold">₹{cashFlowData.totalOperating.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Investing Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cashFlowData.investingRows.map((row, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <p className="font-medium">{row.date} {row.reference && `- ${row.reference}`} {row.description && `- ${row.description}`}</p>
                    <p className="font-semibold">₹{row.amount.toLocaleString()}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <p className="font-bold">Net Cash from Investing</p>
                  <p className="font-bold">₹{cashFlowData.totalInvesting.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financing Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cashFlowData.financingRows.map((row, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <p className="font-medium">{row.date} {row.reference && `- ${row.reference}`} {row.description && `- ${row.description}`}</p>
                    <p className="font-semibold">₹{row.amount.toLocaleString()}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <p className="font-bold">Net Cash from Financing</p>
                  <p className="font-bold">₹{cashFlowData.totalFinancing.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {reportName === 'sales-report' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="sales-report">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <h3 className="text-2xl font-bold mt-2 text-success">₹{salesData.totalSales.toLocaleString()}</h3>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sales by Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {salesData.rows.map((r, idx) => (
                  <div key={idx} className="p-3 bg-muted rounded-lg cursor-pointer" onClick={(e) => {
                    const detailsEl = (e.currentTarget as HTMLElement).querySelector('.details');
                    if (detailsEl) detailsEl.classList.toggle('hidden');
                  }}>
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{r.account}</p>
                      <p className="font-semibold text-success">₹{r.amount.toLocaleString()}</p>
                    </div>
                    <div className="details hidden mt-2">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-muted-foreground">
                              <th className="text-left py-1">Date</th>
                              <th className="text-left py-1">Ref</th>
                              <th className="text-left py-1">Description</th>
                              <th className="text-right py-1">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {r.txns.map((t:any, i:number) => (
                              <tr key={i} className="border-t">
                                <td className="py-1">{t.date}</td>
                                <td className="py-1">{t.reference}</td>
                                <td className="py-1">{t.description}</td>
                                <td className="py-1 text-right">{t.amount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {(reportName === 'expense-reports' || reportName === 'expenses-reports') && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="expense-reports">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <h3 className="text-2xl font-bold mt-2 text-destructive">₹{expenseReport.totalExpenses.toLocaleString()}</h3>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Expenses by Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expenseReport.rows.map((r, idx) => (
                  <div key={idx} className="p-3 bg-muted rounded-lg cursor-pointer" onClick={(e) => {
                    const detailsEl = (e.currentTarget as HTMLElement).querySelector('.details');
                    if (detailsEl) detailsEl.classList.toggle('hidden');
                  }}>
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{r.account}</p>
                      <p className="font-semibold text-destructive">₹{r.amount.toLocaleString()}</p>
                    </div>
                    <div className="details hidden mt-2">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-muted-foreground">
                              <th className="text-left py-1">Date</th>
                              <th className="text-left py-1">Ref</th>
                              <th className="text-left py-1">Description</th>
                              <th className="text-right py-1">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {r.txns.map((t:any, i:number) => (
                              <tr key={i} className="border-t">
                                <td className="py-1">{t.date}</td>
                                <td className="py-1">{t.reference}</td>
                                <td className="py-1">{t.description}</td>
                                <td className="py-1 text-right">{t.amount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {reportName === 'customer-outstanding' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Customer Outstanding (A/R)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg mb-3">
                <p className="font-bold">Total Receivables</p>
                <p className="font-bold">₹{outstanding.total.toLocaleString()}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="text-left py-1">Date</th>
                      <th className="text-left py-1">Ref</th>
                      <th className="text-left py-1">Description</th>
                      <th className="text-right py-1">Delta</th>
                      <th className="text-right py-1">Running Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outstanding.rows.map((t:any, i:number) => (
                      <tr key={i} className="border-t">
                        <td className="py-1">{t.date}</td>
                        <td className="py-1">{t.reference}</td>
                        <td className="py-1">{t.description}</td>
                        <td className="py-1 text-right">{t.delta}</td>
                        <td className="py-1 text-right">{t.balance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {reportName === 'vendor-outstanding' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Vendor Outstanding (A/P)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg mb-3">
                <p className="font-bold">Total Payables</p>
                <p className="font-bold">₹{outstanding.total.toLocaleString()}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="text-left py-1">Date</th>
                      <th className="text-left py-1">Ref</th>
                      <th className="text-left py-1">Description</th>
                      <th className="text-right py-1">Delta</th>
                      <th className="text-right py-1">Running Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outstanding.rows.map((t:any, i:number) => (
                      <tr key={i} className="border-t">
                        <td className="py-1">{t.date}</td>
                        <td className="py-1">{t.reference}</td>
                        <td className="py-1">{t.description}</td>
                        <td className="py-1 text-right">{t.delta}</td>
                        <td className="py-1 text-right">{t.balance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {reportName !== "profit-&-loss-statement" && (
        <>
          {reportName === "balance-sheet" ? (
            <>
            <Card>
              <CardHeader>
                <CardTitle>Accounting Equation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Total Assets</p>
                    <p className="text-2xl font-bold text-primary">₹{totalAssets.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-center text-2xl font-bold">=</div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Liabilities + Equity</p>
                    <p className="text-2xl font-bold text-success">₹{(totalLiabilities + totalEquity).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-primary">Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                    {assetAccounts.map(acc => (
                      <div key={acc.code} className="py-2 border-b last:border-b-0 cursor-pointer" onClick={(e) => {
                        const detailsEl = (e.currentTarget as HTMLElement).querySelector('.details');
                        if (detailsEl) detailsEl.classList.toggle('hidden');
                      }}>
                        <div className="flex items-center justify-between">
                          <span>{acc.name}</span>
                          <span className="font-semibold">₹{acc.balance.toLocaleString()}</span>
                        </div>
                        <div className="details hidden mt-2">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-muted-foreground">
                                  <th className="text-left py-1">Date</th>
                                  <th className="text-left py-1">Ref</th>
                                  <th className="text-left py-1">Description</th>
                                  <th className="text-right py-1">Debit</th>
                                  <th className="text-right py-1">Credit</th>
                                  <th className="text-right py-1">Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(balanceDetailsByAccount[acc.name] || []).map((t, i) => (
                                  <tr key={i} className="border-t">
                                    <td className="py-1">{t.date}</td>
                                    <td className="py-1">{t.reference}</td>
                                    <td className="py-1">{t.description}</td>
                                    <td className="py-1 text-right">{t.debit}</td>
                                    <td className="py-1 text-right">{t.credit}</td>
                                    <td className="py-1 text-right">{t.amount}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="font-bold">Total Assets</span>
                      <span className="font-bold text-primary">₹{totalAssets.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-destructive">Liabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                      {liabilityAccounts.map(acc => (
                        <div key={acc.code} className="py-2 border-b last:border-b-0 cursor-pointer" onClick={(e) => {
                          const detailsEl = (e.currentTarget as HTMLElement).querySelector('.details');
                          if (detailsEl) detailsEl.classList.toggle('hidden');
                        }}>
                          <div className="flex items-center justify-between">
                            <span>{acc.name}</span>
                            <span className="font-semibold">₹{acc.balance.toLocaleString()}</span>
                          </div>
                          <div className="details hidden mt-2">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-muted-foreground">
                                    <th className="text-left py-1">Date</th>
                                    <th className="text-left py-1">Ref</th>
                                    <th className="text-left py-1">Description</th>
                                    <th className="text-right py-1">Debit</th>
                                    <th className="text-right py-1">Credit</th>
                                    <th className="text-right py-1">Amount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(balanceDetailsByAccount[acc.name] || []).map((t, i) => (
                                    <tr key={i} className="border-t">
                                      <td className="py-1">{t.date}</td>
                                      <td className="py-1">{t.reference}</td>
                                      <td className="py-1">{t.description}</td>
                                      <td className="py-1 text-right">{t.debit}</td>
                                      <td className="py-1 text-right">{t.credit}</td>
                                      <td className="py-1 text-right">{t.amount}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      ))}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="font-bold">Total Liabilities</span>
                      <span className="font-bold text-destructive">₹{totalLiabilities.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-success">Equity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                      {(equityAccounts || []).map(acc => (
                        <div key={acc.code} className="py-2 border-b last:border-b-0 cursor-pointer" onClick={(e) => {
                          const detailsEl = (e.currentTarget as HTMLElement).querySelector('.details');
                          if (detailsEl) detailsEl.classList.toggle('hidden');
                        }}>
                          <div className="flex items-center justify-between">
                            <span>{acc.name}</span>
                            <span className="font-semibold">₹{acc.balance.toLocaleString()}</span>
                          </div>
                          <div className="details hidden mt-2">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-muted-foreground">
                                    <th className="text-left py-1">Date</th>
                                    <th className="text-left py-1">Ref</th>
                                    <th className="text-left py-1">Description</th>
                                    <th className="text-right py-1">Debit</th>
                                    <th className="text-right py-1">Credit</th>
                                    <th className="text-right py-1">Amount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(balanceDetailsByAccount[acc.name] || []).map((t, i) => (
                                    <tr key={i} className="border-t">
                                      <td className="py-1">{t.date}</td>
                                      <td className="py-1">{t.reference}</td>
                                      <td className="py-1">{t.description}</td>
                                      <td className="py-1 text-right">{t.debit}</td>
                                      <td className="py-1 text-right">{t.credit}</td>
                                      <td className="py-1 text-right">{t.amount}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      ))}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="font-bold">Total Equity</span>
                      <span className="font-bold text-success">₹{totalEquity.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              Report data visualization for "{reportData.title}" will be displayed here.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Professional charts, tables, and analytics coming soon.
            </p>
          </CardContent>
        </Card>
          )}
        </>
      )}
    </div>
  );
}