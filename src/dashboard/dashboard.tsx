"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts"
import { Plus, Users, Receipt, CreditCard, FileText, Plane, LogOut, Loader2 } from "lucide-react"
import { ExpenseDialog } from "@/components/expense-dialog"
import { ParticipantDialog } from "@/components/participant-dialog"
import { PaymentDialog } from "@/components/payment-dialog"
import { ExpenseList } from "@/components/expense-list"
import { ParticipantList } from "@/components/participant-list"
import { PaymentList } from "@/components/payment-list"
import { useAuth } from "../hooks/use-auth.tsx"
import { FirebaseService } from "../lib/firebase-service"
import type { Participant, Expense, Payment } from "@/model/types.ts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function TravelExpenseTracker() {
    const { user, logOut } = useAuth()
    const [firebaseService, setFirebaseService] = useState<FirebaseService | null>(null)

    const [participants, setParticipants] = useState<Participant[]>([])
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            const service = new FirebaseService(user.uid)
            setFirebaseService(service)

            const unsubscribeParticipants = service.subscribeToParticipants(setParticipants)
            const unsubscribeExpenses = service.subscribeToExpenses(setExpenses)
            const unsubscribePayments = service.subscribeToPayments(setPayments)

            setLoading(false)

            return () => {
                unsubscribeParticipants()
                unsubscribeExpenses()
                unsubscribePayments()
            }
        }
    }, [user])

    const handleAddParticipant = async (participant: Omit<Participant, "id">) => {
        if (firebaseService) {
            await firebaseService.addParticipant(participant)
        }
    }

    const handleEditParticipant = async (participant: Participant) => {
        if (firebaseService) {
            await firebaseService.updateParticipant(participant.id, participant)
        }
    }

    const handleDeleteParticipant = async (id: string) => {
        if (firebaseService) {
            await firebaseService.deleteParticipant(id)
        }
    }

    const handleAddExpense = async (expense: Omit<Expense, "id">) => {
        if (firebaseService) {
            await firebaseService.addExpense(expense)
        }
    }

    const handleEditExpense = async (expense: Expense) => {
        if (firebaseService) {
            await firebaseService.updateExpense(expense.id, expense)
        }
    }

    const handleDeleteExpense = async (id: string) => {
        if (firebaseService) {
            await firebaseService.deleteExpense(id)
        }
    }

    const handleAddPayment = async (payment: Omit<Payment, "id">) => {
        if (firebaseService) {
            await firebaseService.addPayment(payment)
        }
    }

    const handleUpdatePayment = async (payment: Payment) => {
        if (firebaseService) {
            await firebaseService.updatePayment(payment.id, payment)
        }
    }

    const handleLogout = async () => {
        await logOut()
    }

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const expensesByCategory = expenses.reduce(
        (acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount
            return acc
        },
        {} as Record<string, number>,
    )

    const chartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
        name: category,
        value: amount,
    }))

    const participantChartData = participants.map((p) => ({
        name: p.name,
        paid: p.totalPaid,
        owed: p.totalOwed,
    }))

    if (loading) {
        return (
            <div className="min-h-screen  flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Carregando dados...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Plane className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Controle de Gastos - Viagem</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Sair
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="dashboard" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
                        <TabsTrigger value="dashboard" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Dashboard
                        </TabsTrigger>
                        <TabsTrigger value="expenses" className="flex items-center gap-2">
                            <Receipt className="h-4 w-4" />
                            Despesas
                        </TabsTrigger>
                        <TabsTrigger value="participants" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Participantes
                        </TabsTrigger>
                        <TabsTrigger value="payments" className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Pagamentos
                        </TabsTrigger>
                        <TabsTrigger value="reports" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Relatórios
                        </TabsTrigger>
                    </TabsList>

                    {/* Dashboard */}
                    <TabsContent value="dashboard" className="space-y-6">
                        {/* Cards de Resumo */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total de Gastos</CardTitle>
                                    <Receipt className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">R${totalExpenses.toFixed(2)}</div>
                                    <p className="text-xs text-muted-foreground">{expenses.length} despesas registradas</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Participantes</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{participants.length}</div>
                                    <p className="text-xs text-muted-foreground">pessoas na viagem</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Gasto por Pessoa</CardTitle>
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">R${(totalExpenses / participants.length).toFixed(2)}</div>
                                    <p className="text-xs text-muted-foreground">média por participante</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{payments.filter((p) => p.status === "pending").length}</div>
                                    <p className="text-xs text-muted-foreground">transferências pendentes</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Gastos por Categoria</CardTitle>
                                    <CardDescription>Distribuição das despesas por tipo</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`R$${value}`, "Valor"]} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Saldo dos Participantes</CardTitle>
                                    <CardDescription>Quanto cada pessoa pagou vs. deve</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {participants.map((participant) => (
                                        <div key={participant.id} className="flex items-center space-x-4">
                                            <Avatar>
                                                <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                                                <AvatarFallback>
                                                    {participant.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium">{participant.name}</p>
                                                    <Badge variant={participant.balance >= 0 ? "default" : "destructive"}>
                                                        {participant.balance >= 0 ? "+" : ""}R${participant.balance.toFixed(2)}
                                                    </Badge>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Pagou: R${participant.totalPaid} | Deve: R${participant.totalOwed}
                                                </div>
                                                <Progress value={(participant.totalPaid / participant.totalOwed) * 100} className="h-2" />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Comparativo: Pago vs. Devido</CardTitle>
                                <CardDescription>Visualização do que cada pessoa pagou versus o que deve</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={participantChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => [`R$${value}`, ""]} />
                                        <Legend />
                                        <Bar dataKey="paid" fill="#8884d8" name="Pagou" />
                                        <Bar dataKey="owed" fill="#82ca9d" name="Deve" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="expenses" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">Despesas</h2>
                                <p className="text-muted-foreground">Gerencie todas as despesas da viagem</p>
                            </div>
                            <ExpenseDialog participants={participants} onAddExpense={handleAddExpense}>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nova Despesa
                                </Button>
                            </ExpenseDialog>
                        </div>
                        <ExpenseList
                            expenses={expenses}
                            participants={participants}
                            onEditExpense={(expense) => {
                                handleEditExpense(expense)
                            }}
                            onDeleteExpense={(id) => {
                                handleDeleteExpense(id)
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="participants" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">Participantes</h2>
                                <p className="text-muted-foreground">Gerencie os participantes da viagem</p>
                            </div>
                            <ParticipantDialog onAddParticipant={handleAddParticipant}>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Adicionar Participante
                                </Button>
                            </ParticipantDialog>
                        </div>
                        <ParticipantList
                            participants={participants}
                            onEditParticipant={(participant) => {
                                handleEditParticipant(participant)
                            }}
                            onDeleteParticipant={(id) => {
                                handleDeleteParticipant(id)
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="payments" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">Pagamentos</h2>
                                <p className="text-muted-foreground">Controle de transferências e quitações</p>
                            </div>
                            <PaymentDialog participants={participants} onAddPayment={handleAddPayment}>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Registrar Pagamento
                                </Button>
                            </PaymentDialog>
                        </div>
                        <PaymentList
                            payments={payments}
                            participants={participants}
                            onUpdatePayment={(payment) => {
                                handleUpdatePayment(payment)
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="reports" className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold">Relatórios</h2>
                            <p className="text-muted-foreground">Análises detalhadas dos gastos da viagem</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Resumo por Categoria</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {Object.entries(expensesByCategory).map(([category, amount]) => (
                                            <div key={category} className="flex justify-between items-center">
                                                <span className="font-medium">{category}</span>
                                                <Badge variant="outline">R${amount.toFixed(2)}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Ações</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Button variant="outline" className="w-full bg-transparent">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Exportar para PDF
                                    </Button>
                                    <Button variant="outline" className="w-full bg-transparent">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Exportar para CSV
                                    </Button>
                                    <Button variant="outline" className="w-full bg-transparent">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Relatório Detalhado
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
