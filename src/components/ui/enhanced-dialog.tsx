import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'switch' | 'badge-input';
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

interface EnhancedDialogProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  fields: FormField[];
  onSubmit: (data: any) => void;
  submitText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function EnhancedDialog({
  trigger,
  title,
  description,
  fields,
  onSubmit,
  submitText = "Save Changes",
  size = 'md'
}: EnhancedDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      toast({
        title: "Success",
        description: "Changes saved successfully!",
      });
      setOpen(false);
      setFormData({});
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            placeholder={field.placeholder}
            value={formData[field.name] || ''}
            onChange={(e) => updateFormData(field.name, e.target.value)}
            className="min-h-[100px]"
          />
        );
      
      case 'select':
        return (
          <Select
            value={formData[field.name] || ''}
            onValueChange={(value) => updateFormData(field.name, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'switch':
        return (
          <Switch
            checked={formData[field.name] || false}
            onCheckedChange={(checked) => updateFormData(field.name, checked)}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            value={formData[field.name] || ''}
            onChange={(e) => updateFormData(field.name, e.target.value)}
          />
        );
      
      default:
        return (
          <Input
            type="text"
            placeholder={field.placeholder}
            value={formData[field.name] || ''}
            onChange={(e) => updateFormData(field.name, e.target.value)}
          />
        );
    }
  };

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className={`${sizeClasses[size]} glass-card border-primary/20`}>
        <DialogHeader>
          <DialogTitle className="text-gradient-primary font-display">{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-primary hover:bg-gradient-primary/90"
            >
              {isSubmitting ? "Saving..." : submitText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}