import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Header from '../components/Header';

const ReservationModal = ({ reservation, user, onClose, onUpdate }) => {
    const [observacao, setObservacao] = useState('');
    const handleAction = (acao) => {
        if ((acao === 'recusar_secretaria' || acao === 'recusar_produtor') && !observacao.trim()) {
            toast.warn('Por favor, forneça o motivo da recusa.');
            return;
        }
        onUpdate(reservation.ReservaEspacoID, acao, observacao);
    };

    const renderActionButtons = () => {
        const perfil = user.profile;
        const status = reservation.Status;
        if (status === 'Aguardando Secretaria' && perfil === 'Secretaria') {
            return (
                <>
                    <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Motivo (obrigatório para recusa)..." className="w-full mt-4 p-2 border rounded" />
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <button onClick={() => handleAction('aprovar_secretaria')} className="bg-green-600 text-white py-2 rounded hover:bg-green-700">Aprovar</button>
                        <button onClick={() => handleAction('recusar_secretaria')} className="bg-red-600 text-white py-2 rounded hover:bg-red-700">Recusar</button>
                    </div>
                </>
            );
        }
        if (status === 'Aguardando Produtor' && perfil === 'ProdutorEventos') {
            return (
                <>
                    <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Motivo (obrigatório para recusa)..." className="w-full mt-4 p-2 border rounded" />
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <button onClick={() => handleAction('aprovar_produtor')} className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Aprovação Final</button>
                        <button onClick={() => handleAction('recusar_produtor')} className="bg-red-600 text-white py-2 rounded hover:bg-red-700">Recusar</button>
                    </div>
                </>
            );
        }
        return <p className="mt-4 text-sm text-gray-500 italic">Nenhuma ação disponível para o seu perfil.</p>;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">Detalhes da Reserva</h2>
                <div className="space-y-2 border-t border-b py-4">
                    <p><strong>Espaço:</strong> {reservation.NomeEspaco}</p>
                    <p><strong>Solicitante:</strong> {reservation.NomeUsuario}</p>
                    <p><strong>Data:</strong> {new Date(reservation.DataInicio).toLocaleString('pt-BR')}</p>
                    <p><strong>Status:</strong> {reservation.Status}</p>
                </div>
                {renderActionButtons()}
                <button onClick={onClose} className="w-full mt-4 bg-gray-500 text-white py-2 rounded hover:bg-gray-600">Fechar</button>
            </div>
        </div>
    );
};

const AdminSpacesPage = ({ user, onBack, onLogout }) => {
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReservation, setSelectedReservation] = useState(null);

    const fetchAdminReservations = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/api/admin/reservas-espacos?userId=${user.id}&userProfile=${user.profile}`);
            if (!response.ok) throw new Error('Falha ao buscar reservas.');
            const data = await response.json();
            setReservations(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchAdminReservations();
    }, [fetchAdminReservations]);
    
    const handleUpdateStatus = async (id, acao, observacao) => {
        try {
            const response = await fetch(`http://localhost:3001/api/admin/reservas-espacos/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ acao, aprovadorId: user.id, observacao })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao atualizar o status.');
            }
            const result = await response.json();
            toast.success(result.message);
            setSelectedReservation(null);
            fetchAdminReservations();
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header
                user={user}
                onLogout={onLogout}
                onHomeClick={onBack}
                title="Painel de Administração"
            />
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full">
                {isLoading ? <p>A carregar reservas...</p> : (
                    <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Espaço</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data & Hora</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reservations.map(res => {
                                    const canAct = (user.profile === 'Secretaria' && res.Status === 'Aguardando Secretaria') || (user.profile === 'ProdutorEventos' && res.Status === 'Aguardando Produtor');
                                    return (
                                        <tr key={res.ReservaEspacoID} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{res.NomeUsuario}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{res.NomeEspaco}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(res.DataInicio).toLocaleString('pt-BR')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    res.Status === 'Aguardando Secretaria' ? 'bg-yellow-100 text-yellow-800' :
                                                    res.Status === 'Aguardando Produtor' ? 'bg-orange-100 text-orange-800' :
                                                    res.Status === 'Aprovada' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {res.Status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button onClick={() => setSelectedReservation(res)} className="text-indigo-600 hover:text-indigo-900">
                                                    {canAct ? 'Processar' : 'Ver Detalhes'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
            {selectedReservation && <ReservationModal reservation={selectedReservation} user={user} onClose={() => setSelectedReservation(null)} onUpdate={handleUpdateStatus} />}
        </div>
    );
};

export default AdminSpacesPage;