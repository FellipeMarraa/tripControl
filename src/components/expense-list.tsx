"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { ExpenseDialog } from "./expense-dialog"
import type { Expense, Participant } from "../model/types.ts"

interface ExpenseListProps {
    expenses: Expense[]
    participants: Participant[]
    onEditExpense: (expense: Expense) => void
    onDeleteExpense: (id: string) => void
}

export function ExpenseList({ expenses, participants, onEditExpense, onDeleteExpense }: ExpenseListProps) {
    const getParticipantName = (id: string) => {
        return participants.find((p) => p.id === id)?.name || "Desconhecido"
    }

    const getParticipantAvatar = (id: string) => {
        return participants.find((p) => p.id === id)?.avatar
    }

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            Alimentação: "bg-green-100 text-green-800",
            Transporte: "bg-blue-100 text-blue-800",
            Hospedagem: "bg-purple-100 text-purple-800",
            Entretenimento: "bg-yellow-100 text-yellow-800",
            Compras: "bg-pink-100 text-pink-800",
            Outros: "bg-gray-100 text-gray-800",
        }
        return colors[category] || colors["Outros"]
    }

    if (expenses.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">Nenhuma despesa registrada</h3>
                        <p className="text-muted-foreground mb-4">Comece adicionando a primeira despesa da viagem.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Lista de Despesas ({expenses.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Despesa</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Pago por</TableHead>
                                <TableHead>Participantes</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.map((expense) => (
                                <TableRow key={expense.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{expense.title}</div>
                                            <div className="text-sm text-muted-foreground">
                                                R${expense.amountPerPerson.toFixed(2)} por pessoa
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getCategoryColor(expense.category)}>{expense.category}</Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">R${expense.amount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={getParticipantAvatar(expense.paidBy) || "/placeholder.svg"} />
                                                <AvatarFallback className="text-xs">
                                                    {getParticipantName(expense.paidBy)
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{getParticipantName(expense.paidBy)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex -space-x-1">
                                            {expense.participants.slice(0, 3).map((participantId) => (
                                                <Avatar key={participantId} className="h-6 w-6 border-2 border-background">
                                                    <AvatarImage src={getParticipantAvatar(participantId) || "/placeholder.svg"} />
                                                    <AvatarFallback className="text-xs">
                                                        {getParticipantName(participantId)
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ))}
                                            {expense.participants.length > 3 && (
                                                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                                    <span className="text-xs font-medium">+{expense.participants.length - 3}</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">{new Date(expense.date).toLocaleDateString("pt-BR")}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <ExpenseDialog
                                                    participants={participants}
                                                    expense={expense}
                                                    onAddExpense={() => {}}
                                                    onEditExpense={onEditExpense}
                                                >
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                </ExpenseDialog>
                                                <DropdownMenuItem onClick={() => onDeleteExpense(expense.id)} className="text-red-600">
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Excluir
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}