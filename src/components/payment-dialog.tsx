"use client"

import type React from "react"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Participant, Payment } from "../model/types.ts"

interface PaymentDialogProps {
    children: React.ReactNode
    participants: Participant[]
    onAddPayment: (payment: Omit<Payment, "id">) => void
    payment?: Payment
    onEditPayment?: (payment: Payment) => void
}

export function PaymentDialog({ children, participants, onAddPayment, payment, onEditPayment }: PaymentDialogProps) {
    const [open, setOpen] = useState(false)
    const [from, setFrom] = useState(payment?.from || "")
    const [to, setTo] = useState(payment?.to || "")
    const [amount, setAmount] = useState(payment?.amount?.toString() || "")
    const [date, setDate] = useState<Date>(payment ? new Date(payment.date) : new Date())
    const [note, setNote] = useState(payment?.note || "")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!from || !to || !amount || from === to) {
            return
        }

        const paymentData = {
            from,
            to,
            amount: Number.parseFloat(amount),
            date: format(date, "yyyy-MM-dd"),
            status: "pending" as const,
            note: note.trim() || undefined,
        }

        if (payment && onEditPayment) {
            onEditPayment({ ...paymentData, id: payment.id, status: payment.status })
        } else {
            onAddPayment(paymentData)
        }

        // Reset form
        setFrom("")
        setTo("")
        setAmount("")
        setDate(new Date())
        setNote("")
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{payment ? "Editar Pagamento" : "Registrar Pagamento"}</DialogTitle>
                    <DialogDescription>
                        {payment ? "Edite os detalhes do pagamento." : "Registre uma transferência entre participantes."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>De (Quem Paga)</Label>
                        <Select value={from} onValueChange={setFrom} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione quem vai pagar" />
                            </SelectTrigger>
                            <SelectContent>
                                {participants.map((participant) => (
                                    <SelectItem key={participant.id} value={participant.id}>
                                        {participant.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Para (Quem Recebe)</Label>
                        <Select value={to} onValueChange={setTo} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione quem vai receber" />
                            </SelectTrigger>
                            <SelectContent>
                                {participants
                                    .filter((p) => p.id !== from)
                                    .map((participant) => (
                                        <SelectItem key={participant.id} value={participant.id}>
                                            {participant.name}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Valor (€)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Data</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "dd/MM/yyyy") : <span>Selecionar data</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="note">Observação (opcional)</Label>
                        <Textarea
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Ex: Pagamento do almoço de ontem"
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">{payment ? "Salvar Alterações" : "Registrar Pagamento"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}