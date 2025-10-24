import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export default function ViewJournalEntry() {
  const navigate = useNavigate();
  const { id } = useParams();

  const entry = useMemo(() => {
    if (!id) {
      navigate("/accounts/journal-entries");
      return null;
    }

    try {
      const existingEntries = JSON.parse(localStorage.getItem("journalEntries") || "[]");
      const foundEntry = existingEntries.find((e: any) => e.id === id);
      
      if (!foundEntry) {
        toast({
          title: "Error",
          description: "Journal entry not found.",
          variant: "destructive"
        });
        navigate("/accounts/journal-entries");
        return null;
      }

      return foundEntry;
    } catch (error) {
      console.error("Error loading journal entry:", error);
      toast({
        title: "Error",
        description: "Failed to load journal entry.",
        variant: "destructive"
      });
      navigate("/accounts/journal-entries");
      return null;
    }
  }, [id, navigate]);

  if (!entry) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/accounts/journal-entries")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Loading...</h1>
            <p className="text-muted-foreground">Please wait while we load the journal entry</p>
          </div>
        </div>
      </div>
    );
  }

  const totalDebit = entry.lines.reduce((sum: number, line: any) => sum + (line.debit || 0), 0);
  const totalCredit = entry.lines.reduce((sum: number, line: any) => sum + (line.credit || 0), 0);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/accounts/journal-entries")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{entry.id}</h1>
            <p className="text-muted-foreground">Journal Entry Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/accounts/journal-entries/${entry.id}/edit`)}>
            Edit
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Entry Information</CardTitle>
            <Badge variant="default">{entry.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Date</span>
              </div>
              <p className="text-sm text-muted-foreground">{entry.date}</p>
            </div>
            {entry.reference && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Reference</span>
                <p className="text-sm text-muted-foreground">{entry.reference}</p>
              </div>
            )}
          </div>
          {entry.description && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Description</span>
              <p className="text-sm text-muted-foreground">{entry.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Journal Lines</CardTitle>
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
                {entry.lines.map((line: any, index: number) => (
                  <tr key={index} className="border-t">
                    <td className="p-3">{line.account}</td>
                    <td className="p-3 text-right font-mono">
                      {line.debit > 0 ? `₹${line.debit.toLocaleString()}` : "-"}
                    </td>
                    <td className="p-3 text-right font-mono">
                      {line.credit > 0 ? `₹${line.credit.toLocaleString()}` : "-"}
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
    </div>
  );
}