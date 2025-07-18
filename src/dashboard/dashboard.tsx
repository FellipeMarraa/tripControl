"use client"

import {useEffect, useState} from "react"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Progress} from "@/components/ui/progress"
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import {CreditCard, FileText, Loader2, LogOut, Menu, Plane, Plus, Receipt, Users, X} from "lucide-react"
import {ExpenseDialog} from "@/components/expense-dialog"
import {ParticipantDialog} from "@/components/participant-dialog"
import {PaymentDialog} from "@/components/payment-dialog"
import {ExpenseList} from "@/components/expense-list"
import {ParticipantList} from "@/components/participant-list"
import {PaymentList} from "@/components/payment-list"
import {useAuth} from "../hooks/use-auth.tsx"
import {FirebaseService} from "../lib/firebase-service"
import type {Expense, Participant, Payment} from "@/model/types.ts"
import {cn} from "@/lib/utils.ts";

type Transfer = {
    from: string
    to: string
    amount: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function TravelExpenseTracker() {
    const {user, logOut} = useAuth()
    const [firebaseService, setFirebaseService] = useState<FirebaseService | null>(null)

    const [participants, setParticipants] = useState<Participant[]>([])
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedTab, setSelectedTab] = useState("dashboard")
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

    const tabs = [
        {id: "dashboard", label: "Dashboard", icon: FileText},
        {id: "expenses", label: "Despesas", icon: Receipt},
        {id: "participants", label: "Participantes", icon: Users},
        {id: "payments", label: "Pagamentos", icon: CreditCard},
        {id: "reports", label: "Relatórios", icon: FileText},
    ]

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

    function calculatePendingTransfers(participants: Participant[]): Transfer[] {
        const debtors = [...participants.filter(p => p.balance < -0.01)].sort((a, b) => a.balance - b.balance) // maiores devedores primeiro
        const creditors = [...participants.filter(p => p.balance > 0.01)].sort((a, b) => b.balance - a.balance) // maiores credores primeiro

        const transfers: Transfer[] = []

        for (const debtor of debtors) {
            let remainingDebt = -debtor.balance

            for (const creditor of creditors) {
                if (creditor.balance <= 0) continue

                const amount = Math.min(creditor.balance, remainingDebt)

                if (amount > 0.01) {
                    transfers.push({
                        from: debtor.id,
                        to: creditor.id,
                        amount,
                    })

                    creditor.balance -= amount
                    remainingDebt -= amount

                    if (remainingDebt <= 0.01) break
                }
            }
        }

        return transfers
    }

    const calculateParticipantData = () => {
        return participants.map((participant) => {
            const expensesPaid = expenses.filter(e => e.paidBy === participant.id)
            const totalPaid = expensesPaid.reduce((sum, e) => sum + e.amount, 0)

            const totalOwed = expenses.reduce((sum, expense) => {
                if (
                    expense.participants.includes(participant.id) &&
                    expense.paidBy !== participant.id
                ) {
                    const numParticipants = expense.participants.length
                    if (numParticipants <= 0) return sum

                    const share = expense.amount / numParticipants
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


    const calculatedParticipants = calculateParticipantData();
    const pendingTransfers = calculatePendingTransfers([...calculatedParticipants.map(p => ({...p}))]);

    const participantChartData = calculatedParticipants.map((p) => ({
        name: p.name,
        paid: p.totalPaid,
        owed: p.totalOwed,
    }))


    if (loading) {
        return (
            <div className="min-h-screen  flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4"/>
                    <p>Carregando dados...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-4 bg-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b shadow-sm max-h-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Botão Hamburger mobile */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden"
                            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6"/>
                            ) : (
                                <Menu className="h-6 w-6"/>
                            )}
                        </button>

                        {/* Ícone e título desktop */}
                        <div className="hidden lg:flex items-center">
                            <div className="bg-blue-600 rounded-sm p-2">
                                <Plane className="h-6 w-6 text-white"/>
                            </div>
                            <h1 className="ml-3 text-2xl font-bold text-black select-none">
                                Controle de Gastos - Viagem
                            </h1>
                        </div>
                    </div>

                    {/* Botão Sair */}
                    <Button variant="outline" onClick={handleLogout} size="sm">
                        <LogOut className="h-4 w-4 mr-2"/>
                        <span className="hidden sm:inline">Sair</span>
                    </Button>
                </div>
            </header>

            <aside
                className={cn(
                    "fixed left-0 top-20 h-[calc(100vh-80px)] w-64 bg-white z-50 transform transition-transform lg:hidden shadow-md",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <nav className="flex flex-col p-4 space-y-2">
                    {tabs.map(({id, label, icon: Icon}) => (
                        <button
                            key={id}
                            onClick={() => {
                                setSelectedTab(id)
                                setIsMobileMenuOpen(false)
                            }}
                            className={cn(
                                "w-full flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium",
                                selectedTab === id
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-600 hover:bg-gray-50"
                            )}
                        >
                            <Icon className="h-5 w-5"/>
                            {label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Tabs desktop */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
                    <div className="hidden lg:block">
                        <TabsList className="hidden lg:grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
                            <TabsTrigger value="dashboard" className="flex items-center gap-2">
                                <FileText className="h-4 w-4"/> Dashboard
                            </TabsTrigger>
                            <TabsTrigger value="expenses" className="flex items-center gap-2">
                                <Receipt className="h-4 w-4"/> Despesas
                            </TabsTrigger>
                            <TabsTrigger value="participants" className="flex items-center gap-2">
                                <Users className="h-4 w-4"/> Participantes
                            </TabsTrigger>
                            <TabsTrigger value="payments" className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4"/> Pagamentos
                            </TabsTrigger>
                            <TabsTrigger value="reports" className="flex items-center gap-2">
                                <FileText className="h-4 w-4"/> Relatórios
                            </TabsTrigger>
                        </TabsList>
                    </div>


                    {/* Dashboard */}
                    <TabsContent value="dashboard" className="space-y-6">
                        {/* Cards de Resumo */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total de Gastos</CardTitle>
                                    <Receipt className="h-4 w-4 text-muted-foreground"/>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">R${totalExpenses.toFixed(2)}</div>
                                    <p className="text-xs text-muted-foreground">{expenses.length} despesas
                                        registradas</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Participantes</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground"/>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{participants.length}</div>
                                    <p className="text-xs text-muted-foreground">pessoas na viagem</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Gasto por Pessoa</CardTitle>
                                    <CreditCard className="h-4 w-4 text-muted-foreground"/>
                                </CardHeader>
                                <CardContent>
                                    <div
                                        className="text-2xl font-bold">R${(totalExpenses / participants.length).toFixed(2)}</div>
                                    <p className="text-xs text-muted-foreground">média por participante</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
                                    <CreditCard className="h-4 w-4 text-muted-foreground"/>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{pendingTransfers.length}</div>
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
                                                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {chartData.map((_entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`R$${value}`, "Valor"]}/>
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
                                    {calculatedParticipants.map((participant) => (
                                        <div key={participant.id} className="flex items-center space-x-4">
                                            <Avatar>
                                                <AvatarImage src={participant.avatar || "/placeholder.svg"}/>
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
                                                    <Badge
                                                        variant={participant.balance >= 0 ? "default" : "destructive"}>
                                                        {participant.balance >= 0 ? "+" : ""}R${participant.balance.toFixed(2)}
                                                    </Badge>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Pagou: R${participant.totalPaid.toFixed(2)} | Deve: R${participant.totalOwed.toFixed(2)}
                                                </div>
                                                <Progress value={(participant.totalPaid / participant.totalOwed) * 100}
                                                          className="h-2"/>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Comparativo: Pago vs. Devido</CardTitle>
                                <CardDescription>Visualização do que cada pessoa pagou versus o que
                                    deve</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={participantChartData}>
                                        <CartesianGrid strokeDasharray="3 3"/>
                                        <XAxis dataKey="name"/>
                                        <YAxis/>
                                        <Tooltip formatter={(value) => [`R$${value}`, ""]}/>
                                        <Legend/>
                                        <Bar dataKey="paid" fill="#8884d8" name="Pagou"/>
                                        <Bar dataKey="owed" fill="#82ca9d" name="Deve"/>
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
                                    <Plus className="h-4 w-4 mr-2"/>
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
                                    <Plus className="h-4 w-4 mr-2"/>
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
                            expenses={expenses}
                            payments={payments}
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
                                    <Plus className="h-4 w-4 mr-2"/>
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
                                        <FileText className="h-4 w-4 mr-2"/>
                                        Exportar para PDF
                                    </Button>
                                    <Button variant="outline" className="w-full bg-transparent">
                                        <FileText className="h-4 w-4 mr-2"/>
                                        Exportar para CSV
                                    </Button>
                                    <Button variant="outline" className="w-full bg-transparent">
                                        <FileText className="h-4 w-4 mr-2"/>
                                        Relatório Detalhado
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
