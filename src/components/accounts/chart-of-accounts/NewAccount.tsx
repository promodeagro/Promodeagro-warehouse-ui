import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { generateAccountCode, addAccount, validateAccountCode } from "@/lib/accounts";

export default function NewAccount() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [codeInput, setCodeInput] = useState("");

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    const suggested = generateAccountCode(value);
    setGeneratedCode(suggested);
    setCodeInput(suggested);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category) {
      toast({
        title: "Error",
        description: "Please select a category.",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const balance = parseFloat(formData.get("balance") as string) || 0;
    const code = (formData.get("code") as string) || codeInput;
    const description = (formData.get("description") as string) || undefined;

    if (!name) {
      toast({
        title: "Error", 
        description: "Please enter an account name.",
        variant: "destructive"
      });
      return;
    }

    const codeValidation = validateAccountCode(category, code);
    if (!codeValidation.valid) {
      toast({
        title: "Invalid code",
        description: codeValidation.message || "Please enter a valid account code.",
        variant: "destructive"
      });
      return;
    }

    const newAccount = {
      code,
      name,
      balance,
      description
    };

    addAccount(newAccount, category);
    
    toast({ 
      title: "Account Created", 
      description: `New account ${code} - ${name} has been created successfully.` 
    });
    navigate("/accounts/chart-of-accounts");
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/accounts/chart-of-accounts")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Account</h1>
          <p className="text-muted-foreground">Add a new account to chart of accounts</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Account Details</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={handleCategoryChange} required>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assets">Assets</SelectItem>
                    <SelectItem value="liabilities">Liabilities</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expenses">Expenses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Account Name</Label>
                <Input id="name" name="name" placeholder="e.g., Petty Cash" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Account Code</Label>
                <Input 
                  id="code" 
                  name="code"
                  value={codeInput} 
                  disabled
                  className="bg-muted"
                  placeholder="Auto-generated"
                />
                <p className="text-xs text-muted-foreground">Code is automatically generated based on category.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance">Opening Balance (₹)</Label>
                <Input 
                  id="balance" 
                  name="balance"
                  type="number" 
                  step="0.01" 
                  defaultValue="0" 
                  required 
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea id="description" name="description" placeholder="Short description (optional)" className="min-h-[96px]" />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate("/accounts/chart-of-accounts")}>Cancel</Button>
              <Button type="submit">Create Account</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}