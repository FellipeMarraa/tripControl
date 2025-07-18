import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Participant, Expense, Payment } from "../model/types.ts"

export class FirebaseService {
    private userId: string

    constructor(userId: string) {
        this.userId = userId
    }

    // Participants
    async addParticipant(participant: Omit<Participant, "id">) {
        const docRef = await addDoc(collection(db, "participants"), {
            ...participant,
            userId: this.userId,
            createdAt: Timestamp.now(),
        })
        return docRef.id
    }

    async updateParticipant(id: string, participant: Partial<Participant>) {
        const docRef = doc(db, "participants", id)
        await updateDoc(docRef, {
            ...participant,
            updatedAt: Timestamp.now(),
        })
    }

    async deleteParticipant(id: string) {
        await deleteDoc(doc(db, "participants", id))
    }

    subscribeToParticipants(callback: (participants: Participant[]) => void) {
        const q = query(collection(db, "participants"), where("userId", "==", this.userId), orderBy("createdAt", "desc"))

        return onSnapshot(q, (snapshot) => {
            const participants = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Participant[]
            callback(participants)
        })
    }

    // Expenses
    async addExpense(expense: Omit<Expense, "id">) {
        const docRef = await addDoc(collection(db, "expenses"), {
            ...expense,
            userId: this.userId,
            createdAt: Timestamp.now(),
        })
        return docRef.id
    }

    async updateExpense(id: string, expense: Partial<Expense>) {
        const docRef = doc(db, "expenses", id)
        await updateDoc(docRef, {
            ...expense,
            updatedAt: Timestamp.now(),
        })
    }

    async deleteExpense(id: string) {
        await deleteDoc(doc(db, "expenses", id))
    }

    subscribeToExpenses(callback: (expenses: Expense[]) => void) {
        const q = query(collection(db, "expenses"), where("userId", "==", this.userId), orderBy("createdAt", "desc"))

        return onSnapshot(q, (snapshot) => {
            const expenses = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Expense[]
            callback(expenses)
        })
    }

    // Payments
    async addPayment(payment: Omit<Payment, "id">) {
        const docRef = await addDoc(collection(db, "payments"), {
            ...payment,
            userId: this.userId,
            createdAt: Timestamp.now(),
        })
        return docRef.id
    }

    async updatePayment(id: string, payment: Partial<Payment>) {
        const docRef = doc(db, "payments", id)
        await updateDoc(docRef, {
            ...payment,
            updatedAt: Timestamp.now(),
        })
    }

    subscribeToPayments(callback: (payments: Payment[]) => void) {
        const q = query(collection(db, "payments"), where("userId", "==", this.userId), orderBy("createdAt", "desc"))

        return onSnapshot(q, (snapshot) => {
            const payments = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Payment[]
            callback(payments)
        })
    }
}
