import React, { useState, useEffect, useCallback } from 'react';
import { useMsal, MsalAuthenticationTemplate, useIsAuthenticated } from "@azure/msal-react";
import { InteractionType } from "@azure/msal-browser";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { loginRequest } from './authConfig';

import SelectSpacePage from './pages/SelectSpacePage';
import DateTimePage from './pages/DateTimePage';
import ConfirmationPage from './pages/ConfirmationPage';
import AdminSpacesPage from './pages/AdminSpacesPage';
import MySpaceReservationsPage from './pages/MySpaceReservationsPage';

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
};

function ErrorComponent({ error }) {
    console.error(error);
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-10 bg-white rounded-lg shadow-lg">
                <h1 className="text-xl font-bold text-red-600">Erro de Autenticação</h1>
                <p className="mt-2">Por favor, volte ao portal e tente fazer o login novamente.</p>
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
    const [mySpaceReservations, setMySpaceReservations] = useState([]);

    useEffect(() => {
        if (!isAuthenticated && !getCookie('userIsAuthenticated')) {
            window.location.href = 'http://localhost:5174';
        }
    }, [isAuthenticated]);

    const fetchMySpaceReservations = useCallback(async (userId) => {
        if (!userId) return;
        try {
            const response = await fetch(`http://localhost:3001/api/usuarios/${userId}/reservas-espacos`);
            if (!response.ok) throw new Error('Não foi possível buscar suas reservas de espaços.');
            const data = await response.json();
            setMySpaceReservations(data);
        } catch (error) {
            toast.error(error.message);
        }
    }, []);

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
                    if (!response.ok) throw new Error("Utilizador não registado.");
                    const userData = await response.json();
                    setUser(userData);
                    fetchMySpaceReservations(userData.id);
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
    }, [isAuthenticated, accounts, user, instance, fetchMySpaceReservations]);

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
    const handleCancelSpaceReservation = async (reservationId, motivo) => {
        try {
            const response = await fetch(`http://localhost:3001/api/reservas-espacos/${reservationId}/cancelar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ motivo, userId: user.id })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao cancelar a reserva.');
            }
            toast.success('Reserva cancelada com sucesso.');
            fetchMySpaceReservations(user.id);
        } catch (error) {
            toast.error(error.message);
        }
    };
    const handleBackToHome = () => {
        setPage('selectSpace');
        setReservationFlow({});
    };
    const handleLogout = () => {
        window.location.href = 'http://localhost:5174';
    };

    const renderPage = () => {
        if (isLoading || (isAuthenticated && !user)) {
            return <div className="flex items-center justify-center min-h-screen"><p>A carregar...</p></div>;
        }
        if (!isAuthenticated || !user) {
            return <div><p>A redirecionar para o portal...</p></div>;
        }

        switch (page) {
            case 'selectDateTime':
                return <DateTimePage user={user} space={reservationFlow.space} onDateTimeSubmit={handleDateTimeSubmit} onBack={() => setPage('selectSpace')} onLogout={handleLogout} onHomeClick={handleBackToHome} onMyReservationsClick={() => setPage('mySpaceReservations')} />;
            case 'confirmation':
                return <ConfirmationPage user={user} reservationDetails={reservationFlow} onConfirm={handleConfirmReservation} onBack={() => setPage('selectDateTime')} onLogout={handleLogout} onHomeClick={handleBackToHome} onMyReservationsClick={() => setPage('mySpaceReservations')} />;
            case 'adminSpaces':
                return <AdminSpacesPage user={user} onBack={handleBackToHome} onLogout={handleLogout} onMyReservationsClick={() => setPage('mySpaceReservations')} />;
            case 'mySpaceReservations':
                return <MySpaceReservationsPage user={user} reservations={mySpaceReservations} onCancelReservation={handleCancelSpaceReservation} onLogout={handleLogout} onHomeClick={handleBackToHome} onMyReservationsClick={() => setPage('mySpaceReservations')} />;
            case 'selectSpace':
            default:
                return <SelectSpacePage user={user} onSpaceClick={handleSpaceClick} onAdminClick={() => setPage('adminSpaces')} onLogout={handleLogout} onHomeClick={handleBackToHome} onMyReservationsClick={() => setPage('mySpaceReservations')} />;
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