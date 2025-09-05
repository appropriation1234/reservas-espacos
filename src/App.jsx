import React, { useState, useEffect } from 'react';
import { useMsal, MsalAuthenticationTemplate, useIsAuthenticated } from "@azure/msal-react";
import { InteractionType } from "@azure/msal-browser";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { loginRequest } from './authConfig';

import SelectSpacePage from './pages/SelectSpacePage';
import DateTimePage from './pages/DateTimePage';
import ConfirmationPage from './pages/ConfirmationPage';
import AdminSpacesPage from './pages/AdminSpacesPage';

function ErrorComponent({ error }) {
    console.error(error);
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-10 bg-white rounded-lg shadow-lg">
                <h1 className="text-xl font-bold text-red-600">Erro de Autenticação</h1>
                <p className="mt-2">Por favor, volte ao portal e tente novamente.</p>
                <a href="http://localhost:5174" className="mt-4 inline-block bg-blue-600 text-white py-2 px-4 rounded">Voltar ao Portal</a>
            </div>
        </div>
    );
}

const App = () => {
    const { instance, accounts } = useMsal();
    const isAuthenticated = useIsAuthenticated();

    const [user, setUser] = useState(null);
    const [page, setPage] = useState('selectSpace');
    const [reservationFlow, setReservationFlow] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            if (isAuthenticated && accounts.length > 0 && !user) {
                const userEmail = accounts[0].username;
                try {
                    const response = await fetch('http://localhost:3001/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: userEmail })
                    });
                    if (!response.ok) throw new Error("Utilizador não registado no sistema.");
                    const userData = await response.json();
                    setUser(userData);
                } catch (error) {
                    toast.error(error.message);
                } finally {
                    setIsLoading(false);
                }
            } else if (!isAuthenticated) {
                setIsLoading(false);
            }
        };
        checkUser();
    }, [isAuthenticated, accounts, user, instance]);

    const handleSpaceClick = (space) => {
        setReservationFlow({ space });
        setPage('selectDateTime');
    };
    const handleDateTimeSubmit = (dateTimeDetails) => {
        setReservationFlow(prev => ({ ...prev, dateTime: dateTimeDetails }));
        setPage('confirmation');
    };
    const handleConfirmReservation = async () => {
        const { space, dateTime } = reservationFlow;
        const reservationData = {
            usuarioId: user.id,
            espacoId: space.id,
            dataInicio: `${dateTime.date}T${dateTime.startTime}:00`,
            dataFim: `${dateTime.date}T${dateTime.endTime}:00`,
            status: 'Aguardando Secretaria',
            obsLocal: space.localizacao,
            obsAtividade: 'Não especificada'
        };
        try {
            const response = await fetch('http://localhost:3001/api/reservas-espacos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reservationData)
            });
            if (!response.ok) throw new Error("Falha ao enviar o pedido.");
            toast.success("Pedido de reserva enviado com sucesso!");
            setPage('selectSpace');
            setReservationFlow({});
        } catch (error) {
            toast.error(error.message);
        }
    };
    const handleBackToHome = () => {
        setPage('selectSpace');
        setReservationFlow({});
    };
    const handleLogout = () => {
        instance.logoutRedirect({ postLogoutRedirectUri: "http://localhost:5174" });
    };

    const renderPage = () => {
        if (isLoading || (isAuthenticated && !user)) {
            return <div className="flex items-center justify-center min-h-screen"><p>A carregar...</p></div>;
        }
        if (!isAuthenticated) {
            return <div><p>Por favor, faça o login através do portal.</p></div>;
        }

        switch (page) {
            case 'selectDateTime':
                return <DateTimePage user={user} space={reservationFlow.space} onDateTimeSubmit={handleDateTimeSubmit} onBack={() => setPage('selectSpace')} onLogout={handleLogout} onHomeClick={handleBackToHome} />;
            case 'confirmation':
                return <ConfirmationPage user={user} reservationDetails={reservationFlow} onConfirm={handleConfirmReservation} onBack={() => setPage('selectDateTime')} onLogout={handleLogout} onHomeClick={handleBackToHome} />;
            case 'adminSpaces':
                return <AdminSpacesPage user={user} onBack={handleBackToHome} onLogout={handleLogout} />;
            case 'selectSpace':
            default:
                return <SelectSpacePage user={user} onSpaceClick={handleSpaceClick} onAdminClick={() => setPage('adminSpaces')} onLogout={handleLogout} onHomeClick={handleBackToHome} />;
        }
    };

    return (
        <div className="bg-gray-100">
             <MsalAuthenticationTemplate 
                interactionType={InteractionType.Redirect} 
                authenticationRequest={loginRequest}
                errorComponent={ErrorComponent} 
            >
                {renderPage()}
            </MsalAuthenticationTemplate>
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
        </div>
    );
};

export default App;