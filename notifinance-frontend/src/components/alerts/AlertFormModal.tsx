"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Alert } from "@/types/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

const alertFormSchema = z.object({
  alertType: z.enum(["PRICE", "PCT_CHANGE", "DOLLAR", "RISK", "PORTFOLIO"]),
  assetId: z.string().optional(),
  condition: z.enum(["ABOVE", "BELOW", "CROSSES", "PCT_UP", "PCT_DOWN"]),
  threshold: z.number().positive("El valor debe ser mayor a 0"),
  period: z.enum(["DAILY", "WEEKLY"]).optional(),
  channels: z.array(z.enum(["IN_APP", "EMAIL"])).min(1, "Seleccioná al menos un canal"),
  isRecurring: z.boolean(),
});

type AlertFormValues = z.infer<typeof alertFormSchema>;

interface AlertFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alertToEdit?: Alert | null;
  onSave: (data: AlertFormValues) => void;
}

export function AlertFormModal({ open, onOpenChange, alertToEdit, onSave }: AlertFormModalProps) {
  const form = useForm<AlertFormValues>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      alertType: "PRICE",
      assetId: "",
      condition: "ABOVE",
      threshold: 0,
      period: "DAILY",
      channels: ["IN_APP"],
      isRecurring: false,
    },
  });

  const watchAlertType = form.watch("alertType");

  useEffect(() => {
    if (alertToEdit) {
      form.reset({
        alertType: alertToEdit.alertType,
        assetId: alertToEdit.assetId || "",
        condition: alertToEdit.condition,
        threshold: alertToEdit.threshold,
        period: alertToEdit.period ?? "DAILY",
        channels: alertToEdit.channels,
        isRecurring: alertToEdit.isRecurring,
      });
    } else {
      form.reset({
        alertType: "PRICE",
        assetId: "",
        condition: "ABOVE",
        threshold: 0,
        period: "DAILY",
        channels: ["IN_APP"],
        isRecurring: false,
      });
    }
  }, [alertToEdit, form, open]);

  function onSubmit(data: AlertFormValues) {
    if ((data.alertType === "PRICE" || data.alertType === "PCT_CHANGE") && !data.assetId) {
      form.setError("assetId", { type: "manual", message: "El activo es requerido" });
      return;
    }
    onSave(data);
    form.reset();
  }

  const preview = (() => {
    const values = form.getValues();
    const target = values.alertType === "PRICE" || values.alertType === "PCT_CHANGE"
      ? values.assetId || "el activo"
      : values.alertType === "DOLLAR"
        ? "el dólar"
        : values.alertType === "RISK"
          ? "el riesgo país"
          : "tu portfolio";

    const action = values.condition === "ABOVE"
      ? "supere"
      : values.condition === "BELOW"
        ? "baje de"
        : values.condition === "CROSSES"
          ? "cruce"
          : values.condition === "PCT_UP"
            ? "suba más de"
            : "baje más de";

    const suffix = values.alertType === "PCT_CHANGE" && values.period
      ? ` (${values.period === "DAILY" ? "diario" : "semanal"})`
      : "";

    const channels = values.channels.includes("EMAIL") ? "email e in-app" : "in-app";
    return `Te notificaremos cuando ${target} ${action} ${values.threshold || 0}${suffix} por ${channels}.`;
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{alertToEdit ? "Editar Alerta" : "Crear Nueva Alerta"}</DialogTitle>
          <DialogDescription>
            Configurá las condiciones para recibir notificaciones del mercado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="alertType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Alerta</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PRICE">Precio de Activo</SelectItem>
                      <SelectItem value="PCT_CHANGE">Variación % de Activo</SelectItem>
                      <SelectItem value="DOLLAR">Dólar</SelectItem>
                      <SelectItem value="RISK">Riesgo País</SelectItem>
                      <SelectItem value="PORTFOLIO">Portfolio</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(watchAlertType === "PRICE" || watchAlertType === "PCT_CHANGE") && (
              <FormField
                control={form.control}
                name="assetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activo (Ticker)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: GGAL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condición</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar condición" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {watchAlertType === "PCT_CHANGE" ? (
                          <>
                            <SelectItem value="PCT_UP">Sube más de</SelectItem>
                            <SelectItem value="PCT_DOWN">Baja más de</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="ABOVE">Mayor a</SelectItem>
                            <SelectItem value="BELOW">Menor a</SelectItem>
                            <SelectItem value="CROSSES">Cruza</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Umbral</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {watchAlertType === "PCT_CHANGE" && (
              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Período</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value ?? "DAILY"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar período" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DAILY">Diario</SelectItem>
                        <SelectItem value="WEEKLY">Semanal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="space-y-3 pt-2 border-t">
              <h4 className="text-sm font-medium">Notificación</h4>
              
              <FormField
                control={form.control}
                name="channels"
                render={() => (
                  <FormItem>
                    <div className="flex gap-4">
                      <FormField
                        control={form.control}
                        name="channels"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes("IN_APP")}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, "IN_APP"])
                                      : field.onChange(
                                          field.value?.filter((value) => value !== "IN_APP")
                                        )
                                  }}
                                  disabled // In-App is always required
                                />
                              </FormControl>
                              <FormLabel className="font-normal">In-App</FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                      <FormField
                        control={form.control}
                        name="channels"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes("EMAIL")}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, "EMAIL"])
                                      : field.onChange(
                                          field.value?.filter((value) => value !== "EMAIL")
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">Email</FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Alerta Recurrente</FormLabel>
                      <FormDescription>
                        Si está activo, la alerta se volverá a disparar cada vez que se cumpla la condición.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
              {preview}
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Alerta</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
