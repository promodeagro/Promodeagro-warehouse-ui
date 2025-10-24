import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { loadAccounts, updateAccount, getAccountByCode, validateAccountCode, hasJournalEntries, activateAccount, deactivateAccount } from "@/lib/accounts";

export default function EditAccount() {
  const navigate = useNavigate();
  const { code } = useParams();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
    balance: "",
    description: ""
  });
  const [isInactive, setIsInactive] = useState(false);

  useEffect(() => {
    const loadAccountData = () => {
      if (!code) {
        navigate("/accounts/chart-of-accounts");
        return;
      }

      const accounts = loadAccounts();
      const account = getAccountByCode(code);
      
      if (!account) {
        toast({
          title: "Error",
          description: "Account not found.",
          variant: "destructive"
        });
        navigate("/accounts/chart-of-accounts");
        return;
      }

      // Find which category this account belongs to
      let accountCategory = "";
      for (const [categoryKey, category] of Object.entries(accounts)) {
        if (category.accounts.some(acc => acc.code === code)) {
          accountCategory = categoryKey;
          break;
        }
      }

      const cleanName = account.name.replace(/ \(INACTIVE\)$/, "");
      setFormData({
        code: account.code,
        name: cleanName,
        category: accountCategory,
        balance: account.balance.toString(),
        description: account.description || ""
      });
      setIsInactive(account.name.includes("(INACTIVE)"));
      setLoading(false);
    };

    loadAccountData();
  }, [code, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const codeValidation = validateAccountCode(formData.category, formData.code);
    if (!codeValidation.valid) {
      toast({
        title: "Invalid code",
        description: codeValidation.message || "Please enter a valid account code.",
        variant: "destructive"
      });
      return;
    }

    const nameToSave = isInactive ? `${formData.name} (INACTIVE)` : formData.name;
    const updatedAccount = {
      code: formData.code,
      name: nameToSave,
      balance: parseFloat(formData.balance) || 0,
      description: formData.description || undefined
    };
    updateAccount(code!, updatedAccount, formData.category);
    
    toast({
      title: "Account Updated",
      description: `Account ${formData.code} has been updated successfully.`,
    });
    navigate("/accounts/chart-of-accounts");
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/accounts/chart-of-accounts")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Loading...</h1>
            <p className="text-muted-foreground">Please wait while we load the account details</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/accounts/chart-of-accounts")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Account - {formData.code}</h1>
          <p className="text-muted-foreground">Update account details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input 
                  id="category"
                  value={formData.category.charAt(0).toUpperCase() + formData.category.slice(1)}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Category cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Account Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Cash in Hand"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Account Code</Label>
                <Input 
                  id="code" 
                  value={formData.code}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Code is system-generated and cannot be changed.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance">Opening Balance (₹)</Label>
                <Input 
                  id="balance" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  placeholder="0.00"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  required 
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea 
                  id="description"
                  placeholder="Short description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[96px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={isInactive ? "inactive" : "active"}
                  onValueChange={(val) => {
                    const makeInactive = val === "inactive";
                    if (makeInactive !== isInactive) {
                      if (makeInactive) {
                        deactivateAccount(formData.code, formData.category);
                      } else {
                        activateAccount(formData.code, formData.category);
                      }
                    }
                    setIsInactive(makeInactive);
                    // Keep input name clean (without suffix)
                    setFormData({ ...formData, name: formData.name.replace(/ \(INACTIVE\)$/, "") });
                  }}
                >
                  <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active"><span className="text-green-600">Active</span></SelectItem>
                    <SelectItem value="inactive"><span className="text-red-600">Inactive</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>


            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate("/accounts/chart-of-accounts")}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}