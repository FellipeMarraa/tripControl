// "use client"
//
// import type React from "react"
//
// import { useEffect } from "react"
// import { Loader2, Plane } from "lucide-react"
// import {useAuth} from "@/hooks/use-auth.ts";
//
// export function AuthGuard({ children }: { children: React.ReactNode }) {
//     const { user, loading } = useAuth()
//
//     useEffect(() => {
//         if (!loading) {
//             if (!user && pathname !== "/login") {
//                 router.push("/login")
//             } else if (user && pathname === "/login") {
//                 router.push("/")
//             }
//         }
//     }, [user, loading, router, pathname])
//
//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//                 <div className="text-center">
//                     <div className="flex items-center justify-center gap-3 mb-4">
//                         <div className="p-3 bg-blue-600 rounded-xl">
//                             <Plane className="h-8 w-8 text-white" />
//                         </div>
//                         <h1 className="text-3xl font-bold text-gray-900">TravelSplit</h1>
//                     </div>
//                     <div className="flex items-center justify-center gap-2 text-muted-foreground">
//                         <Loader2 className="h-5 w-5 animate-spin" />
//                         <span>Carregando...</span>
//                     </div>
//                 </div>
//             </div>
//         )
//     }
//
//     if (!user && pathname !== "/login") {
//         return null
//     }
//
//     if (user && pathname === "/login") {
//         return null
//     }
//
//     return <>{children}</>
// }