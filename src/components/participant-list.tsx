"use client"

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import {Edit, MoreHorizontal, Trash2} from "lucide-react"
import {ParticipantDialog} from "./participant-dialog"
import type {Expense, Participant, Payment} from "../model/types.ts"

interface ParticipantListProps {
    participants: Participant[]
    expenses: Expense[]
    payments: Payment[]
    onEditParticipant: (participant: Participant) => void
    onDeleteParticipant: (id: string) => void
}


export function ParticipantList({ participants, onEditParticipant, onDeleteParticipant, expenses, payments }: ParticipantListProps) {

    const calculateParticipantData = () => {
        return participants.map((participant) => {
            const expensesPaid = expenses.filter(e => e.paidBy === participant.id)
            const totalPaid = expensesPaid.reduce((sum, e) => sum + e.amount, 0)

            const totalOwed = expenses.reduce((sum, expense) => {
                if (
                    expense.participants.includes(participant.id) &&
                    expense.paidBy !== participant.id
                ) {
                    const numDebtors = expense.participants.length - 1
                    if (numDebtors <= 0) return sum

                    const share = expense.amount / numDebtors
                    return sum + share
                }
                return sum
            }, 0)

            const totalReceivedPayments = payments
                .filter(p => p.to === participant.id && p.status === "completed")
                .reduce((sum, p) => sum + p.amount, 0)

            const totalSentPayments = payments
                .filter(p => p.from === participant.id && p.status === "completed")
                .reduce((sum, p) => sum + p.amount, 0)

            const balance = totalPaid + totalReceivedPayments - totalOwed - totalSentPayments

            return {
                ...participant,
                totalPaid,
                totalOwed,
                balance,
            }
        })
    }

    const updatedParticipants = calculateParticipantData();

    // const handleMarkPaid = async (participantId: string) => {
    //     if (!firebaseService) return
    //     try {
    //         await firebaseService.markAsPaid(participantId)
    //         console.log("Pagamentos registrados com sucesso!")
    //     } catch (error) {
    //         console.error("Erro ao marcar como pago:", error)
    //     }
    // }

    if (participants.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold mb-2">Nenhum participante cadastrado</h3>
                        <p className="text-muted-foreground mb-4">Adicione os participantes da viagem para começar.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Cards de Resumo */}
            {/*<div className="grid grid-cols-1 md:grid-cols-3 gap-4">*/}
            {/*    {updatedParticipants.map((participant) => (*/}
            {/*        <Card key={participant.id}>*/}
            {/*            <CardContent className="p-6">*/}
            {/*                <div className="flex items-center space-x-4">*/}
            {/*                    <Avatar className="h-12 w-12">*/}
            {/*                        <AvatarImage src={participant.avatar || "/placeholder.svg"} />*/}
            {/*                        <AvatarFallback>*/}
            {/*                            {participant.name*/}
            {/*                                .split(" ")*/}
            {/*                                .map((n) => n[0])*/}
            {/*                                .join("")}*/}
            {/*                        </AvatarFallback>*/}
            {/*                    </Avatar>*/}
            {/*                    <div className="flex-1 space-y-1">*/}
            {/*                        <h3 className="font-semibold">{participant.name}</h3>*/}
            {/*                        <div className="flex items-center justify-between">*/}
            {/*                            <Badge variant={participant.balance >= 0 ? "default" : "destructive"}>*/}
            {/*                                {participant.balance >= 0 ? "+" : ""}R${participant.balance.toFixed(2)}*/}
            {/*                            </Badge>*/}
            {/*                        </div>*/}
            {/*                        <div className="text-xs text-muted-foreground">*/}
            {/*                            Pagou: R${participant.totalPaid} | Deve: R${participant.totalOwed}*/}
            {/*                        </div>*/}
            {/*                        <Progress*/}
            {/*                            value={participant.totalOwed > 0 ? (participant.totalPaid / participant.totalOwed) * 100 : 0}*/}
            {/*                            className="h-2"*/}
            {/*                        />*/}
            {/*                    </div>*/}
            {/*                </div>*/}
            {/*            </CardContent>*/}
            {/*        </Card>*/}
            {/*    ))}*/}
            {/*</div>*/}

            {/* Tabela Detalhada */}
            <Card>
                <CardHeader>
                    <CardTitle>Detalhes dos Participantes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Participante</TableHead>
                                    <TableHead>Total Pago</TableHead>
                                    <TableHead>Total Devido</TableHead>
                                    <TableHead>Saldo</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {updatedParticipants.map((participant) => (
                                    <TableRow key={participant.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <Avatar>
                                                    <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                                                    <AvatarFallback>
                                                        {participant.name
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{participant.name}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-green-600">R${participant.totalPaid.toFixed(2)}</TableCell>
                                        <TableCell className="font-medium text-orange-600">R${participant.totalOwed.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge variant={participant.balance >= 0 ? "default" : "destructive"}>
                                                {participant.balance >= 0 ? "+" : ""}R${participant.balance.toFixed(2)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {participant.balance > 0 ? (
                                                <Badge variant="default">Credor</Badge>
                                            ) : participant.balance < 0 ? (
                                                <Badge variant="destructive">Devedor</Badge>
                                            ) : (
                                                <Badge variant="secondary">Quitado</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <ParticipantDialog
                                                        participant={participant}
                                                        onAddParticipant={() => {}}
                                                        onEditParticipant={onEditParticipant}
                                                    >
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                    </ParticipantDialog>
                                                    <DropdownMenuItem
                                                        onClick={() => onDeleteParticipant(participant.id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Remover
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
        </div>
    )
}