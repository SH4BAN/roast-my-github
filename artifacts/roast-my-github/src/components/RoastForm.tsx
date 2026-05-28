import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Flame, ShieldAlert, Skull } from "lucide-react";
import type { RoastInput } from "@workspace/api-client-react";

const formSchema = z.object({
  username: z.string().min(1, "Username is required").max(39, "Username too long"),
  intensity: z.enum(["mild", "medium", "savage"]),
});

interface RoastFormProps {
  onSubmit: (data: RoastInput) => void;
  isPending: boolean;
}

export function RoastForm({ onSubmit, isPending }: RoastFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      intensity: "medium" as const,
    },
  });

  return (
    <div className="bg-card border border-card-border p-6 rounded-xl shadow-lg hover-elevate transition-all">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-end mb-2">
                  <Label className="text-primary font-mono uppercase tracking-wider text-sm">Target Username</Label>
                </div>
                <FormControl>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">github.com/</span>
                    <Input 
                      placeholder="torvalds" 
                      className="pl-[6.5rem] font-mono text-lg h-14 bg-background border-primary/30 focus-visible:border-primary focus-visible:ring-primary/50 transition-all rounded-lg"
                      data-testid="input-username"
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-destructive font-mono" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="intensity"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <Label className="text-primary font-mono uppercase tracking-wider text-sm">Roast Intensity</Label>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-3 gap-3"
                  >
                    <div>
                      <RadioGroupItem value="mild" id="mild" className="peer sr-only" />
                      <Label
                        htmlFor="mild"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-secondary hover:text-secondary-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                      >
                        <Flame className="mb-2 h-6 w-6 text-yellow-500" />
                        <span className="font-mono text-xs uppercase">Mild</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="medium" id="medium" className="peer sr-only" />
                      <Label
                        htmlFor="medium"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-secondary hover:text-secondary-foreground peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-500/10 [&:has([data-state=checked])]:border-orange-500 cursor-pointer transition-all"
                      >
                        <ShieldAlert className="mb-2 h-6 w-6 text-orange-500" />
                        <span className="font-mono text-xs uppercase">Medium</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="savage" id="savage" className="peer sr-only" />
                      <Label
                        htmlFor="savage"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-destructive hover:text-destructive-foreground peer-data-[state=checked]:border-destructive peer-data-[state=checked]:bg-destructive/10 [&:has([data-state=checked])]:border-destructive cursor-pointer transition-all"
                      >
                        <Skull className="mb-2 h-6 w-6 text-destructive" />
                        <span className="font-mono text-xs uppercase text-destructive">Savage</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full h-14 text-lg font-bold font-sans uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(0,255,65,0.4)] transition-all"
            data-testid="button-submit-roast"
          >
            {isPending ? "Executing..." : "Execute Roast"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
