export interface Participant {
    id: string
    name: string
    avatar?: string
    totalPaid: number
    totalOwed: number
    balance: number
}

export interface Expense {
    id: string
    title: string
    amount: number
    date: string
    category: string
    paidBy: string
    participants: string[]
    amountPerPerson: number
}

export interface Payment {
    id: string
    from: string
    to: string
    amount: number
    date: string
    status: "pending" | "completed"
    note?: string
}

export interface User {
    uid: string
    email: string
    displayName?: string
    photoURL?: string
}