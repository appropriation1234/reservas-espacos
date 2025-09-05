import React from 'react';
import Header from '../components/Header';

const ConfirmationPage = ({ user, reservationDetails, onConfirm, onBack, onLogout, onHomeClick }) => {
    const { space, dateTime } = reservationDetails;

    const formattedDate = new Date(dateTime.date.replace(/-/g, '/')).toLocaleDateString('pt-BR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                user={user}
                onLogout={onLogout}
                onHomeClick={onHomeClick}
                title="Confirmar Reserva"
            />
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full">
                <button onClick={onBack} className="mb-6 font-semibold text-blue-600 hover:underline">
                    &larr; Voltar
                </button>
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
                    <h1 className="text-2xl font-bold text-gray-800">Revise seu Pedido</h1>
                    <div className="mt-6 space-y-4 text-md border-t pt-6">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Espaço:</span>
                            <span className="font-semibold text-gray-900">{space.nome}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Data:</span>
                            <span className="font-semibold text-gray-900">{formattedDate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Horário:</span>
                            <span className="font-semibold text-gray-900">{dateTime.startTime} - {dateTime.endTime}</span>
                        </div>
                    </div>
                    <div className="mt-8">
                        <button 
                            onClick={onConfirm}
                            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Confirmar e Enviar Pedido
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ConfirmationPage;