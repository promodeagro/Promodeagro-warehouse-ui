import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Tag, CreditCard, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getIncomeAccounts, getPaymentMethodAccounts } from "@/lib/accounts";

export default function ViewIncome() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState<any>(null);

  // Load income from localStorage with fallback to seed data
  const income = useMemo(() => {
    if (!id) return null;
    
    try {
      const storedIncomes = JSON.parse(localStorage.getItem("otherIncomes") || "[]");
      const found = storedIncomes.find((inc: any) => inc.id === id);
      
      if (found) return found;
    } catch (error) {
      console.error("Error loading income:", error);
    }
    
    // Fallback to seed data
    const seedData = {
      id: "OI-001",
      incomeAccount: "4100",
      description: "Sold empty crates and boxes",
      date: "2025-10-03",
      amount: 1500,
      status: "received",
      paymentAccount: "1010",
      uploadedImages: []
    };
    
    return seedData;
  }, [id]);

  if (!income) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Income not found</h1>
          <p className="text-muted-foreground">The income record you're looking for doesn't exist.</p>
          <Button className="mt-4" onClick={() => navigate("/accounts/other-income")}>
            Back to Other Income
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/accounts/other-income")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{income.id}</h1>
            <p className="text-muted-foreground">View income details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/accounts/other-income/${income.id}/edit`)}>
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Income Information</CardTitle>
              <div className="flex gap-2">
                <Badge variant={income.status === "received" ? "default" : "secondary"}>
                  {income.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Income Account</p>
                <p className="font-medium">
                  {getIncomeAccounts().find(acc => acc.code === income.incomeAccount)?.name || "Unknown Account"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{income.date}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Account</p>
                <p className="font-medium">
                  {getPaymentMethodAccounts().find(acc => acc.code === income.paymentAccount)?.name || "Unknown Account"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{income.description || "No description"}</p>
              </div>
            </div>

            {/* Uploaded Images */}
            {income.uploadedImages && income.uploadedImages.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-3">Uploaded Images</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {income.uploadedImages.map((image: any, index: number) => (
                    <div key={index} className="relative cursor-pointer" onClick={() => setSelectedImage(image)}>
                      <img
                        src={image.data}
                        alt={image.name}
                        className="w-full h-32 object-cover rounded-lg border hover:opacity-80 transition-opacity"
                      />
                      <p className="text-xs text-muted-foreground mt-1 truncate">{image.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Amount</p>
            <h3 className="text-2xl font-bold mt-2 text-green-600">₹{income.amount.toLocaleString()}</h3>
          </CardContent>
        </Card>
      </div>

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