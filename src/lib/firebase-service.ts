import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore"
import {db} from "./firebase"
import type {Expense, Participant, Payment} from "../model/types.ts"

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

    async addExpense(expense: Omit<Expense, "id">) {
        const docRef = await addDoc(collection(db, "expenses"), {
            ...expense,
            userId: this.userId,
            createdAt: Timestamp.now(),
        })

        const paymentsToAdd: Omit<Payment, "id">[] = expense.participants
            .filter((participantId) => participantId !== expense.paidBy)
            .map((participantId) => ({
                from: participantId,
                to: expense.paidBy,
                amount: expense.amountPerPerson,
                date: new Date().toISOString().split("T")[0],
                status: "pending",
                note: `Pagamento da despesa: ${expense.title}`,
            }))

        const addPaymentPromises = paymentsToAdd.map((payment) => this.addPayment(payment))
        await Promise.all(addPaymentPromises)

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

    async deletePayment(id: string) {
        await deleteDoc(doc(db, "payments", id))
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
