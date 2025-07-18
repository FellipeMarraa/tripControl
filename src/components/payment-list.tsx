"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, Clock, ArrowRight } from "lucide-react"
import type { Payment, Participant } from "../model/types.ts"

interface PaymentListProps {
    payments: Payment[]
    participants: Participant[]
    onUpdatePayment: (payment: Payment) => void
}

export function PaymentList({ payments, participants, onUpdatePayment }: PaymentListProps) {
    const getParticipantName = (id: string) => {
        return participants.find((p) => p.id === id)?.name || "Desconhecido"
    }

    const getParticipantAvatar = (id: string) => {
        return participants.find((p) => p.id === id)?.avatar
    }

    const handleMarkAsPaid = (payment: Payment) => {
        onUpdatePayment({
            ...payment,
            status: "completed",
            date: new Date().toISOString().split("T")[0],
        })
    }

    const pendingPayments = payments.filter((p) => p.status === "pending")
    const completedPayments = payments.filter((p) => p.status === "completed")

    return (
        <div className="space-y-6">
            {/* Resumo de Transferências Sugeridas */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Transferências Pendentes ({pendingPayments.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {pendingPayments.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-muted-foreground">
                                <Check className="h-12 w-12 mx-auto mb-4 text-green-500" />
                                <h3 className="text-lg font-semibold mb-2">Todas as contas estão quitadas!</h3>
                                <p>Não há transferências pendentes no momento.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingPayments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={getParticipantAvatar(payment.from) || "/placeholder.svg"} />
                                                <AvatarFallback className="text-xs">
                                                    {getParticipantName(payment.from)
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{getParticipantName(payment.from)}</span>
                                        </div>

                                        <ArrowRight className="h-4 w-4 text-muted-foreground" />

                                        <div className="flex items-center space-x-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={getParticipantAvatar(payment.to) || "/placeholder.svg"} />
                                                <AvatarFallback className="text-xs">
                                                    {getParticipantName(payment.to)
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{getParticipantName(payment.to)}</span>
                                        </div>

                                        <Badge variant="outline" className="ml-4">
                                            R${payment.amount.toFixed(2)}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Badge variant="secondary">
                                            <Clock className="h-3 w-3 mr-1" />
                                            Pendente
                                        </Badge>
                                        <Button size="sm" onClick={() => handleMarkAsPaid(payment)}>
                                            <Check className="h-4 w-4 mr-1" />
                                            Marcar como Pago
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Histórico de Pagamentos */}
            {completedPayments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-500" />
                            Histórico de Pagamentos ({completedPayments.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>De</TableHead>
                                        <TableHead>Para</TableHead>
                                        <TableHead>Valor</TableHead>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Observação</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {completedPayments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={getParticipantAvatar(payment.from) || "/placeholder.svg"} />
                                                        <AvatarFallback className="text-xs">
                                                            {getParticipantName(payment.from)
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm">{getParticipantName(payment.from)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={getParticipantAvatar(payment.to) || "/placeholder.svg"} />
                                                        <AvatarFallback className="text-xs">
                                                            {getParticipantName(payment.to)
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm">{getParticipantName(payment.to)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">R${payment.amount.toFixed(2)}</TableCell>
                                            <TableCell className="text-sm">{new Date(payment.date).toLocaleDateString("pt-BR")}</TableCell>
                                            <TableCell>
                                                <Badge variant="default">
                                                    <Check className="h-3 w-3 mr-1" />
                                                    Pago
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{payment.note || "-"}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}