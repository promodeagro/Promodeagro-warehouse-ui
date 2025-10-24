import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { getAllAccounts } from "@/lib/accounts";

export default function NewJournalEntry() {
  const navigate = useNavigate();
  const [lines, setLines] = useState([
    { account: "", debit: 0, credit: 0 },
    { account: "", debit: 0, credit: 0 },
  ]);
  const [date, setDate] = useState("");
  const [reference, setReference] = useState("");
  const [description, setDescription] = useState("");

  const addLine = () => setLines([...lines, { account: "", debit: 0, credit: 0 }]);
  const removeLine = (index: number) => setLines(lines.filter((_, i) => i !== index));
  const updateLine = (index: number, field: string, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const totalDebit = lines.reduce((sum, line) => sum + Number(line.debit), 0);
  const totalCredit = lines.reduce((sum, line) => sum + Number(line.credit), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      toast({ title: "Error", description: "Please select a date.", variant: "destructive" });
      return;
    }
    
    if (totalDebit !== totalCredit) {
      toast({ title: "Error", description: "Debits and credits must be equal.", variant: "destructive" });
      return;
    }

    // Validate that all lines have accounts selected
    const hasEmptyAccounts = lines.some(line => !line.account);
    if (hasEmptyAccounts) {
      toast({ title: "Error", description: "Please select accounts for all lines.", variant: "destructive" });
      return;
    }

    // Create journal entry
    const journalEntry = {
      id: `JE-${Date.now()}`,
      date: date,
      description: description || "Journal Entry",
      reference: reference || "",
      status: "posted",
      lines: lines.map(line => ({
        account: getAllAccounts().find(acc => acc.code === line.account)?.name || line.account,
        debit: Number(line.debit) || 0,
        credit: Number(line.credit) || 0
      }))
    };

    // Save to localStorage
    try {
      const existingEntries = JSON.parse(localStorage.getItem("journalEntries") || "[]");
      localStorage.setItem("journalEntries", JSON.stringify([journalEntry, ...existingEntries]));
      
      toast({ 
        title: "Journal Entry Created", 
        description: `Journal entry ${journalEntry.id} has been created successfully.` 
      });
      navigate("/accounts/journal-entries");
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast({ 
        title: "Error", 
        description: "Failed to save journal entry.", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/accounts/journal-entries")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Journal Entry</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Journal Entry Details</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Reference</Label>
                <Input 
                  id="reference" 
                  placeholder="Optional reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                placeholder="Enter description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Journal Lines</Label>
                <Button type="button" variant="outline" size="sm" onClick={addLine}>
                  <Plus className="h-4 w-4 mr-2" />Add Line
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3">Account</th>
                      <th className="text-right p-3 w-32">Debit</th>
                      <th className="text-right p-3 w-32">Credit</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">
                          <Select value={line.account} onValueChange={(value) => updateLine(index, "account", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="p-2 sticky top-0 bg-popover">
                                <Input
                                  placeholder="Search accounts..."
                                  className="h-8"
                                  onChange={(e) => {
                                    const term = e.target.value.toLowerCase();
                                    const options = Array.from(
                                      (e.currentTarget.parentElement?.parentElement as HTMLElement).querySelectorAll('[role="option"]') || []
                                    );
                                    options.forEach((opt) => {
                                      const text = opt.textContent?.toLowerCase() || "";
                                      (opt as HTMLElement).style.display = text.includes(term) ? "" : "none";
                                    });
                                  }}
                                />
                              </div>
                              {getAllAccounts().map((account) => (
                                <SelectItem key={account.code} value={account.code}>
                                  {account.code} - {account.name} (₹{account.balance.toLocaleString()})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2">
                          <Input type="number" value={line.debit} onChange={(e) => updateLine(index, "debit", e.target.value)} min="0" step="0.01" />
                        </td>
                        <td className="p-2">
                          <Input type="number" value={line.credit} onChange={(e) => updateLine(index, "credit", e.target.value)} min="0" step="0.01" />
                        </td>
                        <td className="p-2">
                          {lines.length > 2 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeLine(index)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted font-semibold">
                    <tr>
                      <td className="p-3">Total</td>
                      <td className="p-3 text-right">₹{totalDebit.toFixed(2)}</td>
                      <td className="p-3 text-right">₹{totalCredit.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              {totalDebit !== totalCredit && <p className="text-sm text-destructive">⚠️ Entry is not balanced!</p>}
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate("/accounts/journal-entries")}>Cancel</Button>
              <Button type="submit">Create Entry</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}