"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { ParticipantDialog } from "./participant-dialog"
import type { Participant } from "../model/types.ts"

interface ParticipantListProps {
    participants: Participant[]
    onEditParticipant: (participant: Participant) => void
    onDeleteParticipant: (id: string) => void
}

export function ParticipantList({ participants, onEditParticipant, onDeleteParticipant }: ParticipantListProps) {
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {participants.map((participant) => (
                    <Card key={participant.id}>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                                    <AvatarFallback>
                                        {participant.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <h3 className="font-semibold">{participant.name}</h3>
                                    <div className="flex items-center justify-between">
                                        <Badge variant={participant.balance >= 0 ? "default" : "destructive"}>
                                            {participant.balance >= 0 ? "+" : ""}€{participant.balance.toFixed(2)}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Pagou: €{participant.totalPaid} | Deve: €{participant.totalOwed}
                                    </div>
                                    <Progress
                                        value={participant.totalOwed > 0 ? (participant.totalPaid / participant.totalOwed) * 100 : 0}
                                        className="h-2"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

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
                                {participants.map((participant) => (
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
                                        <TableCell className="font-medium text-green-600">€{participant.totalPaid.toFixed(2)}</TableCell>
                                        <TableCell className="font-medium text-orange-600">€{participant.totalOwed.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge variant={participant.balance >= 0 ? "default" : "destructive"}>
                                                {participant.balance >= 0 ? "+" : ""}€{participant.balance.toFixed(2)}
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