import React, { useState, useEffect } from 'react';
import { useMsal, MsalAuthenticationTemplate } from "@azure/msal-react";
import { InteractionType } from "@azure/msal-browser";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { loginRequest } from './authConfig';
import Layout from './components/Layout';
import SelectSpacePage from './pages/SelectSpacePage';
import DateTimePage from './pages/DateTimePage';
import ConfirmationPage from './pages/ConfirmationPage';
import AdminSpacesPage from './pages/AdminSpacesPage';

function ErrorComponent({ error }) {
    console.error(error);
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <div className="text-center p-10 bg-white rounded-2xl shadow-xl max-w-md w-full">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Erro de Autenticação</h1>
                <p>Por favor, volte ao portal principal e tente fazer o login novamente.</p>
                <a 
                    href="http://localhost:5174"
                    className="mt-6 inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Voltar ao Portal
                </a>
            </div>
        </div>
    );
}

function MainContent() {
    const { accounts, instance } = useMsal();
    const [user, setUser] = useState(null);
    const [page, setPage] = useState('selectSpace');
    const [reservationFlow, setReservationFlow] = useState({});
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    useEffect(() => {
        const fetchInternalUser = async () => {
            if (accounts.length > 0) {
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
                    setIsLoadingUser(false);
                }
            }
        };
        fetchInternalUser();
    }, [accounts]);

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
            if (!response.ok) throw new Error("Falha ao enviar o pedido de reserva.");
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

    if (isLoadingUser) {
        return <div className="flex items-center justify-center min-h-screen"><p>A verificar dados do utilizador...</p></div>;
    }

    if (!user) {
        return (
             <div className="flex items-center justify-center min-h-screen">
                <div className="text-center p-10 bg-white rounded-2xl shadow-xl max-w-md w-full">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Utilizador não Encontrado</h1>
                </div>
            </div>
        );
    }

    const renderPageContent = () => {
        switch (page) {
            case 'selectDateTime':
                return <DateTimePage space={reservationFlow.space} onDateTimeSubmit={handleDateTimeSubmit} onBack={() => setPage('selectSpace')} />;
            case 'confirmation':
                return <ConfirmationPage reservationDetails={reservationFlow} onConfirm={handleConfirmReservation} onBack={() => setPage('selectDateTime')} />;
            case 'adminSpaces':
                return <AdminSpacesPage user={user} />;
            case 'selectSpace':
            default:
                return <SelectSpacePage onSpaceClick={handleSpaceClick} />;
        }
    };

    return (
        <Layout 
            user={user} 
            onAdminClick={() => setPage('adminSpaces')} 
            onLogout={handleLogout} 
            onHomeClick={handleBackToHome}
            title={page === 'adminSpaces' ? 'Painel de Administração' : 'Reservar um Espaço'}
        >
            {renderPageContent()}
        </Layout>
    );
}

function App() {
     return (
        <>
            <MsalAuthenticationTemplate 
                interactionType={InteractionType.Redirect} 
                authenticationRequest={loginRequest}
                errorComponent={ErrorComponent} 
                loadingComponent={() => <div className="flex items-center justify-center min-h-screen"><p>A iniciar autenticação...</p></div>}
            >
                <MainContent />
            </MsalAuthenticationTemplate>
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
        </>
    );
}

export default App;