import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  FileText, 
  TrendingUp, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  Package,
  Target,
  ArrowLeft,
  Save,
  Edit,
  Upload,
  Eye,
  Download
} from "lucide-react";
import { packers } from "@/data/packerData";

export default function PackerDetails() {
  const { packerId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedPacker, setEditedPacker] = useState<any>(null);

  // Find the packer
  const packer = packers.find(p => p.id === packerId);

  if (!packer) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Packer not found</h2>
          <Button onClick={() => navigate('/order-management/packer-overview')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Packer Overview
          </Button>
        </div>
      </div>
    );
  }

  // Initialize edited packer
  if (!editedPacker) {
    setEditedPacker(packer);
  }

  const handleSave = () => {
    // Save logic here - would sync with backend
    console.log("Saving packer data:", editedPacker);
    setIsEditing(false);
    // In real app, this would update the packer data in context/state
  };

  const handleCancel = () => {
    setEditedPacker(packer);
    setIsEditing(false);
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'bg-success/10 text-success border-success/20';
      case 'active': return 'bg-warning/10 text-warning border-warning/20';
      case 'offline': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return '🟢';
      case 'active': return '🟡';
      case 'offline': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/order-management/packer-overview')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Packer Details</h1>
            <p className="text-sm text-muted-foreground">
              Manage personal info, documents, and performance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getSyncStatusColor(packer.sync_status)}>
            {getSyncStatusIcon(packer.sync_status)} {packer.sync_status.toUpperCase()}
          </Badge>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-success hover:bg-success/90">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal" className="gap-2">
            <User className="h-4 w-4" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Verification & Documents
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance & Stats
          </TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="packer-id">Packer ID</Label>
                  <Input id="packer-id" value={packer.id} disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={editedPacker?.name || ''}
                    onChange={(e) => setEditedPacker({ ...editedPacker, name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={editedPacker?.phone || ''}
                      onChange={(e) => setEditedPacker({ ...editedPacker, phone: e.target.value })}
                      className="pl-10"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alt-phone">Alternate Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="alt-phone"
                      value={editedPacker?.alternate_phone || ''}
                      onChange={(e) => setEditedPacker({ ...editedPacker, alternate_phone: e.target.value })}
                      className="pl-10"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={editedPacker?.email || ''}
                      onChange={(e) => setEditedPacker({ ...editedPacker, email: e.target.value })}
                      className="pl-10"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dob"
                      type="date"
                      value={editedPacker?.date_of_birth || ''}
                      onChange={(e) => setEditedPacker({ ...editedPacker, date_of_birth: e.target.value })}
                      className="pl-10"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blood-group">Blood Group</Label>
                  <Input
                    id="blood-group"
                    value={editedPacker?.blood_group || ''}
                    onChange={(e) => setEditedPacker({ ...editedPacker, blood_group: e.target.value })}
                    placeholder="e.g., O+, A-, B+"
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="joining-date">Joining Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="joining-date"
                      type="date"
                      value={editedPacker?.joining_date || ''}
                      onChange={(e) => setEditedPacker({ ...editedPacker, joining_date: e.target.value })}
                      className="pl-10"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      value={editedPacker?.address || ''}
                      onChange={(e) => setEditedPacker({ ...editedPacker, address: e.target.value })}
                      className="pl-10"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={editedPacker?.pincode || ''}
                    onChange={(e) => setEditedPacker({ ...editedPacker, pincode: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zone">Zone</Label>
                  <Input
                    id="zone"
                    value="Promode Agro"
                    disabled={true}
                    className="bg-muted"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verification & Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="aadhar">Aadhar Number</Label>
                  <Input
                    id="aadhar"
                    value={editedPacker?.aadhar_number || ''}
                    onChange={(e) => setEditedPacker({ ...editedPacker, aadhar_number: e.target.value })}
                    placeholder="XXXX-XXXX-XXXX"
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pan">PAN Number</Label>
                  <Input
                    id="pan"
                    value={editedPacker?.pan_number || ''}
                    onChange={(e) => setEditedPacker({ ...editedPacker, pan_number: e.target.value })}
                    placeholder="ABCDE1234F"
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank-name">Bank Name</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="bank-name"
                      value={editedPacker?.bank_name || ''}
                      onChange={(e) => setEditedPacker({ ...editedPacker, bank_name: e.target.value })}
                      className="pl-10"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-number">Account Number</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="account-number"
                      value={editedPacker?.account_number || ''}
                      onChange={(e) => setEditedPacker({ ...editedPacker, account_number: e.target.value })}
                      className="pl-10"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ifsc">IFSC Code</Label>
                  <Input
                    id="ifsc"
                    value={editedPacker?.ifsc_code || ''}
                    onChange={(e) => setEditedPacker({ ...editedPacker, ifsc_code: e.target.value })}
                    placeholder="ABCD0123456"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="border-t pt-6 mt-6">
                <h4 className="font-semibold mb-4">Uploaded Documents</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: 'Aadhar Front', key: 'aadhar_front' },
                    { name: 'Aadhar Back', key: 'aadhar_back' },
                    { name: 'PAN Card', key: 'pan' },
                    { name: 'Bank Passbook', key: 'bank_passbook' },
                  ].map((doc) => (
                    <div key={doc.key} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{doc.name}</span>
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Upload className="h-4 w-4 mr-1" />
                          Reupload
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">Total Assigned</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{packer.assigned_orders}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">Packed</span>
                </div>
                <p className="text-2xl font-bold text-success">{packer.packed_orders}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Pending</span>
                </div>
                <p className="text-2xl font-bold text-warning">{packer.pending_orders}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">Completion %</span>
                </div>
                <p className="text-2xl font-bold text-accent">{packer.completion_percentage}%</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Performance Score</span>
                    <span className="font-semibold text-foreground">{packer.performance_score}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg. Packing Time</span>
                    <span className="font-semibold text-foreground">{packer.avg_packing_time} mins/order</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Zone</span>
                    <Badge variant="outline">Promode Agro</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sync Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge className={getSyncStatusColor(packer.sync_status)}>
                      {getSyncStatusIcon(packer.sync_status)} {packer.sync_status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last Active</span>
                    <span className="text-sm text-foreground">
                      {new Date(packer.last_active).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
