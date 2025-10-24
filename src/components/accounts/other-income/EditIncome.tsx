import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { getIncomeAccounts, getPaymentMethodAccounts } from "@/lib/accounts";

export default function EditIncome() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [incomeAccount, setIncomeAccount] = useState("4100");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState("");
  const [paymentAccount, setPaymentAccount] = useState("1010");
  const [description, setDescription] = useState("");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<any>(null);

  useEffect(() => {
    const loadIncome = () => {
      if (!id) return;
      
      try {
        const storedIncomes = JSON.parse(localStorage.getItem("otherIncomes") || "[]");
        const found = storedIncomes.find((inc: any) => inc.id === id);
        
        if (found) {
          setIncomeAccount(found.incomeAccount || "4100");
          setDate(found.date || "");
          setAmount(found.amount || 0);
          setStatus(found.status || "");
          setPaymentAccount(found.paymentAccount || "1010");
          setDescription(found.description || "");
          setExistingImages(found.uploadedImages || []);
        }
      } catch (error) {
        console.error("Error loading income:", error);
      }
      
      setLoading(false);
    };

    loadIncome();
  }, [id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!status) {
      toast({
        title: "Error",
        description: "Please select a payment status.",
        variant: "destructive"
      });
      return;
    }
    
    if (!date || amount <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const storedIncomes = JSON.parse(localStorage.getItem("otherIncomes") || "[]");
      const updatedIncomes = storedIncomes.map((inc: any) => 
        inc.id === id 
          ? {
              ...inc,
              incomeAccount,
              date,
              amount,
              status,
              paymentAccount,
              description,
              uploadedImages: [
                ...existingImages,
                ...uploadedImages.map(file => ({
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  lastModified: file.lastModified,
                  data: URL.createObjectURL(file)
                }))
              ]
            }
          : inc
      );
      
      localStorage.setItem("otherIncomes", JSON.stringify(updatedIncomes));

      // Update journal entries
      const existingEntries = JSON.parse(localStorage.getItem("journalEntries") || "[]");
      const filteredEntries = existingEntries.filter((entry: any) => 
        !entry.description.includes(`Other Income - ${getIncomeAccounts().find(acc => acc.code === incomeAccount)?.name}`)
      );
      
      const newJournalEntry = {
        id: `JE-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        description: `Other Income - ${getIncomeAccounts().find(acc => acc.code === incomeAccount)?.name}`,
        entries: [
          {
            account: paymentAccount,
            accountName: getPaymentMethodAccounts().find(acc => acc.code === paymentAccount)?.name || "Unknown",
            debit: amount,
            credit: 0
          },
          {
            account: incomeAccount,
            accountName: getIncomeAccounts().find(acc => acc.code === incomeAccount)?.name || "Unknown",
            debit: 0,
            credit: amount
          }
        ]
      };
      
      filteredEntries.push(newJournalEntry);
      localStorage.setItem("journalEntries", JSON.stringify(filteredEntries));

      toast({
        title: "Success!",
        description: "Income updated successfully.",
      });
      navigate(`/accounts/other-income/${id}`);
    } catch (error) {
      console.error("Error updating income:", error);
      toast({
        title: "Error",
        description: "Failed to update income. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading...</h1>
          <p className="text-muted-foreground">Please wait while we load the income record.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(`/accounts/other-income/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Income - {id}</h1>
          <p className="text-muted-foreground">Update income record</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Income Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="incomeAccount">Income Account</Label>
                <Select value={incomeAccount} onValueChange={setIncomeAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select income account" />
                  </SelectTrigger>
                  <SelectContent>
                    {getIncomeAccounts().map((account) => (
                      <SelectItem key={account.code} value={account.code}>
                        {account.name} (₹{account.balance.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input 
                  id="amount" 
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setAmount(0);
                    } else {
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue)) {
                        setAmount(numValue);
                      }
                    }
                  }}
                  required 
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Payment Status</Label>
                <Select 
                  value={status} 
                  onValueChange={(value) => {
                    setStatus(value);
                    // Auto-select payment account based on status
                    if (value === "pending") {
                      setPaymentAccount("2010"); // Accounts Payable
                    } else if (value === "received") {
                      setPaymentAccount("1010"); // Cash in Hand
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentAccount">Payment Account</Label>
                <Select value={paymentAccount} onValueChange={setPaymentAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment account" />
                  </SelectTrigger>
                  <SelectContent>
                    {getPaymentMethodAccounts().map((account) => (
                      <SelectItem key={account.code} value={account.code}>
                        {account.name} (₹{account.balance.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter income description..."
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <Label>Attach Images (Optional)</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Images
                </Button>
                <p className="text-sm text-muted-foreground">
                  Upload receipts, invoices, or supporting documents
                </p>
              </div>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Existing Images</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((image: any, index: number) => (
                      <div key={`existing-${index}`} className="relative group">
                        <div 
                          className="cursor-pointer" 
                          onClick={() => setSelectedImage(image)}
                        >
                          <img
                            src={image.data}
                            alt={image.name}
                            className="w-full h-24 object-cover rounded-lg border hover:opacity-80 transition-opacity"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeExistingImage(index);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{image.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Image Preview */}
              {uploadedImages.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">New Images</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((file, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <div 
                          className="cursor-pointer" 
                          onClick={() => setSelectedImage({
                            name: file.name,
                            data: URL.createObjectURL(file)
                          })}
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-24 object-cover rounded-lg border hover:opacity-80 transition-opacity"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate(`/accounts/other-income/${id}`)}>
                Cancel
              </Button>
              <Button type="submit">Update Income</Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedImage?.name}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {selectedImage && (
              <img
                src={selectedImage.data}
                alt={selectedImage.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}