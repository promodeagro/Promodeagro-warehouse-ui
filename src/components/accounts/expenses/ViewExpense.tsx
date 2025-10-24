import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getExpenseAccounts, getPaymentMethodAccounts } from "@/lib/accounts";

export default function ViewExpense() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Load expense from localStorage with fallback to seed data
  const expense = useMemo(() => {
    try {
      const stored = localStorage.getItem("expenses");
      const list = stored ? JSON.parse(stored) : [];
      const found = list.find((e: any) => e.id === id);
      
      if (found) {
        return found;
      }
    } catch (error) {
      console.error("Error loading expense:", error);
    }

    // Fallback to seed data
    return {
      id: id || "EXP-001",
      expenseAccount: "5100",
      description: "Diesel for delivery van",
      vendor: "Fuel Station",
      date: "2025-10-05",
      amount: 2500,
      status: "paid",
      paymentAccount: "1010",
      uploadedImages: [],
    };
  }, [id]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/accounts/expenses")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Expense {expense.id}</h1>
            <p className="text-muted-foreground">View expense details</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/accounts/expenses/${id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Expense Information</CardTitle>
              <div className="flex gap-2">
                <Badge variant={expense.status === "paid" ? "default" : expense.status === "pending" ? "secondary" : "outline"}>
                  {expense.status === "paid" ? "Paid" : expense.status === "pending" ? "Pending" : expense.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Expense Account</p>
                <p className="font-medium">
                  {getExpenseAccounts().find(acc => acc.code === expense.expenseAccount)?.name || "Unknown Account"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendor/Payee</p>
                <p className="font-medium">{expense.vendor}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{expense.date}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-medium">₹{expense.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Account</p>
                <p className="font-medium">
                  {getPaymentMethodAccounts().find(acc => acc.code === expense.paymentAccount)?.name || "Unknown Account"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Description</p>
              <p>{expense.description}</p>
            </div>

            {expense.uploadedImages && expense.uploadedImages.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-3">Uploaded Images</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {expense.uploadedImages.map((image: any, index: number) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.data}
                        alt={image.name}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                        <p className="text-white text-xs opacity-0 group-hover:opacity-100 text-center px-2">
                          {image.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">₹{expense.amount.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}