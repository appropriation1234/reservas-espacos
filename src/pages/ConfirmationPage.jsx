import React from 'react';

const ConfirmationPage = ({ reservationDetails, onConfirm, onBack }) => {
    const { space, dateTime } = reservationDetails;

    const formattedDate = new Date(dateTime.date.replace(/-/g, '/')).toLocaleDateString('pt-BR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <>
            <button onClick={onBack} className="mb-6 text-blue-600 hover:underline font-semibold">
                &larr; Voltar para alterar data/hora
            </button>

            <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Confirme o seu Pedido</h1>
                <p className="text-slate-600 mb-8">Por favor, revise os detalhes da sua reserva.</p>

                <div className="space-y-4 text-lg border-t border-b border-slate-200 py-6">
                    <div className="flex justify-between">
                        <span className="font-semibold text-slate-700">Espaço:</span>
                        <span className="font-bold text-slate-900">{space.nome}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-semibold text-slate-700">Data:</span>
                        <span className="font-bold text-slate-900">{formattedDate}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-semibold text-slate-700">Horário:</span>
                        <span className="font-bold text-slate-900">{dateTime.startTime} - {dateTime.endTime}</span>
                    </div>
                    {space.localizacao && (
                        <div className="flex justify-between">
                            <span className="font-semibold text-slate-700">Localização:</span>
                            <span className="font-bold text-slate-900">{space.localizacao}</span>
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    <button 
                        onClick={onConfirm}
                        className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors shadow-md"
                    >
                        Confirmar e Enviar Pedido
                    </button>
                </div>
            </div>
        </>
    );
};

export default ConfirmationPage;