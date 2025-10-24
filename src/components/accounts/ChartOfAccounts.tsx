import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronDown, ChevronRight, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { loadAccounts } from "@/lib/accounts";

export default function ChartOfAccounts() {
  const navigate = useNavigate();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["assets", "liabilities", "income"]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Load accounts from localStorage and compute balances from journal entries
  const baseAccounts = useMemo(() => loadAccounts(), []);
  const computed = useMemo(() => {
    // read journal entries
    let entries: any[] = [];
    try { entries = JSON.parse(localStorage.getItem("journalEntries") || "[]"); } catch (_) {}
    // helper to compute delta for an account name based on its category
    const categoryBy: Record<string, string> = {};
    Object.entries(baseAccounts).forEach(([cat, catObj]: any) => {
      (catObj.accounts || []).forEach((a: any) => { categoryBy[a.name] = cat; });
    });
    const deltas: Record<string, number> = {};
    const details: Record<string, any[]> = {};
    const computeDelta = (accName: string, debit: number, credit: number) => {
      const cat = categoryBy[accName];
      if (cat === 'assets' || cat === 'expenses') return debit - credit; // increase with debits
      if (cat === 'liabilities' || cat === 'equity' || cat === 'income') return credit - debit; // increase with credits
      return debit - credit;
    };
    entries.forEach((entry: any) => {
      (entry.lines || []).forEach((line: any) => {
        const name = line.account;
        if (!categoryBy[name]) return;
        const debit = Number(line.debit) || 0;
        const credit = Number(line.credit) || 0;
        const delta = computeDelta(name, debit, credit);
        deltas[name] = (deltas[name] || 0) + delta;
        (details[name] = details[name] || []).push({
          date: entry.date,
          reference: entry.reference || entry.id || '',
          description: entry.description || '',
          debit, credit, delta
        });
      });
    });
    // clone accounts and apply deltas
    const clone: any = JSON.parse(JSON.stringify(baseAccounts));
    Object.entries(clone).forEach(([cat, catObj]: any) => {
      catObj.accounts = (catObj.accounts || []).map((a: any) => ({
        ...a,
        balance: (a.balance || 0) + (deltas[a.name] || 0),
        __txns: details[a.name] || []
      }));
    });
    return clone;
  }, [baseAccounts]);
  const accounts = computed;
  const [expandedAccountCodes, setExpandedAccountCodes] = useState<Record<string, boolean>>({});
  const toggleAccountRow = (code: string) => setExpandedAccountCodes(prev => ({ ...prev, [code]: !prev[code] }));

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chart of Accounts</h1>
          <p className="text-muted-foreground">Complete list of accounts used in your business</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/accounts/chart-of-accounts/new')}>
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* Account Categories */}
      <div className="space-y-4">
        {Object.entries(accounts).map(([key, category]) => {
          const isExpanded = expandedCategories.includes(key);
          const totalBalance = category.accounts.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0);
          
          return (
            <Card key={key}>
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleCategory(key)}
              >
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    <span className={category.color}>{category.name}</span>
                    <Badge variant="outline">{category.accounts.length} accounts</Badge>
                  </div>
                  <span className={`font-bold ${category.color}`}>
                    ₹{totalBalance.toLocaleString()}
                  </span>
                </CardTitle>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {category.accounts.map((account: any) => (
                      <div 
                        key={account.code}
                        className={`p-3 rounded-lg transition-colors ${
                          account.name.includes("(INACTIVE)") 
                            ? "bg-muted/50 opacity-60 hover:bg-muted/60" 
                            : "bg-muted hover:bg-muted/70"
                        }`}
                        onClick={() => toggleAccountRow(account.code)}
                      >
                        <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-sm text-muted-foreground w-16">
                            {account.code}
                          </span>
                          <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {account.name.replace(/ \(INACTIVE\)$/, "")}
                                {account.name.includes("(INACTIVE)") ? (
                                  <span className="text-red-600"> (Inactive)</span>
                                ) : (
                                  <span className="text-green-600"> (Active)</span>
                                )}
                              </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                              ₹{(account.balance || 0).toLocaleString()}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                              onClick={(e) => { e.stopPropagation(); navigate(`/accounts/chart-of-accounts/${account.code}/edit`); }}
                              aria-label="Edit account"
                              className="ml-4 gap-1 text-primary hover:text-primary/90 hover:bg-primary/10"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                          </Button>
                          </div>
                        </div>
                        {expandedAccountCodes[account.code] && (
                          <div className="mt-3 bg-white rounded-md p-3">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-muted-foreground">
                                    <th className="text-left py-1">Date</th>
                                    <th className="text-left py-1">Ref</th>
                                    <th className="text-left py-1">Description</th>
                                    <th className="text-right py-1">Debit</th>
                                    <th className="text-right py-1">Credit</th>
                                    <th className="text-right py-1">Δ</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(account.__txns || []).map((t: any, i: number) => (
                                    <tr key={i} className="border-t">
                                      <td className="py-1">{t.date}</td>
                                      <td className="py-1">{t.reference}</td>
                                      <td className="py-1">{t.description}</td>
                                      <td className="py-1 text-right">{t.debit}</td>
                                      <td className="py-1 text-right">{t.credit}</td>
                                      <td className="py-1 text-right">{t.delta}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Accounting Equation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Assets</p>
              <p className="text-2xl font-bold text-primary">
                ₹{accounts.assets.accounts.reduce((sum, a) => sum + a.balance, 0).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center justify-center text-2xl font-bold">=</div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Liabilities + Equity</p>
              <p className="text-2xl font-bold text-success">
                ₹{(
                  accounts.liabilities.accounts.reduce((sum, a) => sum + a.balance, 0) +
                  accounts.equity.accounts.reduce((sum, a) => sum + a.balance, 0)
                ).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}