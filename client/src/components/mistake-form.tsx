import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMistakeSchema, type InsertMistake, type Mistake, ERROR_CATEGORIES, type ErrorCategory } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Plus, Sparkles } from "lucide-react";

interface MistakeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InsertMistake) => void;
  initialData?: Mistake;
  isPending?: boolean;
}

export function MistakeForm({ open, onOpenChange, onSubmit, initialData, isPending }: MistakeFormProps) {
  const form = useForm<InsertMistake>({
    resolver: zodResolver(insertMistakeSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      category: initialData?.category || "conceptual",
      rootCause: initialData?.rootCause || "",
      correctedPrinciple: initialData?.correctedPrinciple || "",
    },
  });

  const handleSubmit = (data: InsertMistake) => {
    onSubmit(data);
    form.reset();
  };

  const categories = Object.entries(ERROR_CATEGORIES) as [ErrorCategory, typeof ERROR_CATEGORIES[ErrorCategory]][];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {initialData ? "Edit Mistake" : "Log New Mistake"}
          </DialogTitle>
          <DialogDescription>
            Capture the mistake you made and what you learned. Retests will be automatically scheduled.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What went wrong?</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief description of the mistake"
                      {...field}
                      data-testid="input-mistake-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain the context and what happened..."
                      className="resize-none min-h-[80px]"
                      {...field}
                      data-testid="input-mistake-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Error category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(([key, config]) => (
                        <SelectItem key={key} value={key} data-testid={`option-category-${key}`}>
                          <span className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                key === "conceptual" ? "bg-primary" :
                                key === "procedural" ? "bg-secondary" :
                                key === "careless" ? "bg-[hsl(var(--warning))]" :
                                "bg-accent"
                              }`}
                            />
                            {config.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rootCause"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Root cause (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What was the underlying cause?"
                      {...field}
                      data-testid="input-root-cause"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="correctedPrinciple"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Corrected principle (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What's the right way to approach this?"
                      {...field}
                      data-testid="input-principle"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} data-testid="button-submit-mistake">
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    {initialData ? "Update" : "Add Mistake"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
