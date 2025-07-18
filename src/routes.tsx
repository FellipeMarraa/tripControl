import {useAuth} from "@/hooks/use-auth.tsx";
import LoginPage from "@/login/login-page.tsx";
import TravelExpenseTracker from "@/dashboard/dashboard.tsx";

export const Routes = () => {
    const { user } = useAuth();

    return (
        <div>
            {user ? (
                    <TravelExpenseTracker/>
                ) : (
                    <LoginPage />
                )}
        </div>
    );
};