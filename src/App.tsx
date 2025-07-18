import {Routes} from '@/routes';
import './App.css';
import {Toaster} from '@/components/ui/toaster';
import {TooltipProvider} from "@/components/ui/tooltip.tsx";
import {BrowserRouter} from 'react-router-dom';
import {AuthProvider} from "@/hooks/use-auth.tsx";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <TooltipProvider>
                    <Routes />
                    <Toaster />
                </TooltipProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;