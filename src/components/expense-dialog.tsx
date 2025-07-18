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
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Participant, Expense } from "../model/types.ts"

interface ExpenseDialogProps {
    children: React.ReactNode
    participants: Participant[]
    onAddExpense: (expense: Omit<Expense, "id">) => void
    expense?: Expense
    onEditExpense?: (expense: Expense) => void
}

const categories = ["Alimentação", "Transporte", "Hospedagem", "Entretenimento", "Compras", "Outros"]

export function ExpenseDialog({ children, participants, onAddExpense, expense, onEditExpense }: ExpenseDialogProps) {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState(expense?.title || "")
    const [amount, setAmount] = useState(expense?.amount?.toString() || "")
    const [date, setDate] = useState<Date>(expense ? new Date(expense.date) : new Date())
    const [category, setCategory] = useState(expense?.category || "")
    const [paidBy, setPaidBy] = useState(expense?.paidBy || "")
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>(expense?.participants || [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!title || !amount || !category || !paidBy || selectedParticipants.length === 0) {
            return
        }

        const expenseData = {
            title,
            amount: Number.parseFloat(amount),
            date: format(date, "yyyy-MM-dd"),
            category,
            paidBy,
            participants: selectedParticipants,
            amountPerPerson: Number.parseFloat(amount) / selectedParticipants.length,
        }

        if (expense && onEditExpense) {
            onEditExpense({ ...expenseData, id: expense.id })
        } else {
            onAddExpense(expenseData)
        }

        // Reset form
        setTitle("")
        setAmount("")
        setDate(new Date())
        setCategory("")
        setPaidBy("")
        setSelectedParticipants([])
        setOpen(false)
    }

    const handleParticipantToggle = (participantId: string) => {
        setSelectedParticipants((prev) =>
            prev.includes(participantId) ? prev.filter((id) => id !== participantId) : [...prev, participantId],
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{expense ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
                    <DialogDescription>
                        {expense ? "Edite os detalhes da despesa." : "Adicione uma nova despesa à viagem."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título da Despesa</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Almoço em Lisboa"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Valor Total (€)</Label>
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
                        <Label>Categoria</Label>
                        <Select value={category} onValueChange={setCategory} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Quem Pagou</Label>
                        <Select value={paidBy} onValueChange={setPaidBy} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione quem pagou" />
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
                        <Label>Para Quem Foi a Despesa</Label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {participants.map((participant) => (
                                <div key={participant.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={participant.id}
                                        checked={selectedParticipants.includes(participant.id)}
                                        onCheckedChange={() => handleParticipantToggle(participant.id)}
                                    />
                                    <Label htmlFor={participant.id}>{participant.name}</Label>
                                </div>
                            ))}
                        </div>
                        {selectedParticipants.length > 0 && amount && (
                            <p className="text-sm text-muted-foreground">
                                Valor por pessoa: €{(Number.parseFloat(amount) / selectedParticipants.length).toFixed(2)}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">{expense ? "Salvar Alterações" : "Adicionar Despesa"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}