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
import type { Participant } from "../model/types.ts"

interface ParticipantDialogProps {
    children: React.ReactNode
    onAddParticipant: (participant: Omit<Participant, "id">) => void
    participant?: Participant
    onEditParticipant?: (participant: Participant) => void
}

export function ParticipantDialog({
                                      children,
                                      onAddParticipant,
                                      participant,
                                      onEditParticipant,
                                  }: ParticipantDialogProps) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState(participant?.name || "")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            return
        }

        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=random`

        const participantData = {
            name: name.trim(),
            avatar: avatarUrl,
            totalPaid: participant?.totalPaid || 0,
            totalOwed: participant?.totalOwed || 0,
            balance: participant?.balance || 0,
        }


        if (participant && onEditParticipant) {
            onEditParticipant({ ...participantData, id: participant.id })
        } else {
            onAddParticipant(participantData)
        }

        setName("")
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{participant ? "Editar Participante" : "Novo Participante"}</DialogTitle>
                    <DialogDescription>
                        {participant ? "Edite as informações do participante." : "Adicione um novo participante à viagem."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: João Silva"
                            required
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">{participant ? "Salvar Alterações" : "Adicionar Participante"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}