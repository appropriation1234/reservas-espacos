import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

const ReservationModal = ({ reservation, user, onClose, onUpdate }) => {
    // A verificação 'if (!reservation) return null;' é feita antes de chamar o modal
    const [observacao, setObservacao] = useState('');

    const handleAction = (acao) => {
        if ((acao === 'recusar_secretaria' || acao === 'recusar_produtor') && !observacao.trim()) {
            toast.warn('Por favor, forneça uma observação/motivo para a recusa.');
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
                    <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Adicionar observação (obrigatório para recusa)..." className="w-full mt-4 p-2 border rounded" />
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <button onClick={() => handleAction('aprovar_secretaria')} className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">Aprovar (Secretaria)</button>
                        <button onClick={() => handleAction('recusar_secretaria')} className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700">Recusar</button>
                    </div>
                </>
            );
        }

        if (status === 'Aguardando Produtor' && perfil === 'ProdutorEventos') {
            return (
                <>
                    <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Adicionar observação (obrigatório para recusa)..." className="w-full mt-4 p-2 border rounded" />
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <button onClick={() => handleAction('aprovar_produtor')} className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">Aprovação Final</button>
                        <button onClick={() => handleAction('recusar_produtor')} className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700">Recusar</button>
                    </div>
                </>
            );
        }

        // TI_Admin também pode precisar de ações, mas por enquanto só visualiza
        if (perfil === 'TI_Admin' && (status === 'Aguardando Secretaria' || status === 'Aguardando Produtor')) {
             return <p className="mt-4 text-sm text-gray-500 italic">Como TI_Admin, você pode visualizar o processo. As ações são da Secretaria e do Produtor.</p>;
        }
        
        return <p className="mt-4 text-sm text-gray-500 italic">Nenhuma ação disponível para o seu perfil nesta etapa.</p>;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg animate-fade-in-up">
                <h2 className="text-xl font-bold mb-4">Detalhes da Reserva</h2>
                <div className="space-y-2 border-t border-b py-4">
                    <p><strong>Espaço:</strong> {reservation.NomeEspaco}</p>
                    <p><strong>Solicitante:</strong> {reservation.NomeUsuario}</p>
                    <p><strong>Data:</strong> {new Date(reservation.DataInicio).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}</p>
                    <p><strong>Status Atual:</strong> <span className="font-semibold">{reservation.Status}</span></p>
                    {reservation.SecretariaObservacao && <p className="text-sm text-gray-600"><strong>Obs. Secretaria:</strong> {reservation.SecretariaObservacao}</p>}
                    {reservation.ObservacoesRecusa && <p className="text-sm text-red-600"><strong>Motivo Recusa:</strong> {reservation.ObservacoesRecusa}</p>}
                </div>
                
                {renderActionButtons()}

                <button onClick={onClose} className="w-full mt-4 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">Fechar</button>
            </div>
        </div>
    );
};

const AdminSpacesPage = ({ user }) => {
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReservation, setSelectedReservation] = useState(null);

    const fetchAdminReservations = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/api/admin/reservas-espacos?userId=${user.id}&userProfile=${user.profile}`);
            if (!response.ok) throw new Error('Falha ao buscar as reservas.');
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
                body: JSON.stringify({
                    acao: acao,
                    aprovadorId: user.id,
                    observacao: observacao
                })
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
            console.error("Erro na atualização:", error);
            toast.error(error.message);
        }
    };

    // A filtragem foi removida daqui, pois o backend já faz a lógica de visibilidade
    const reservationsToDisplay = reservations;

    return (
        <>
            <h1 className="text-3xl font-bold mb-6 text-slate-800">Gestão de Reservas de Espaços</h1>

            {isLoading ? (
                <p>A carregar reservas...</p>
            ) : (
                <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-slate-200 text-left text-xs font-semibold text-gray-600 uppercase">Solicitante</th>
                                <th className="px-5 py-3 border-b-2 border-slate-200 text-left text-xs font-semibold text-gray-600 uppercase">Espaço</th>
                                <th className="px-5 py-3 border-b-2 border-slate-200 text-left text-xs font-semibold text-gray-600 uppercase">Data & Hora</th>
                                <th className="px-5 py-3 border-b-2 border-slate-200 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-5 py-3 border-b-2 border-slate-200 text-left text-xs font-semibold text-gray-600 uppercase">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservationsToDisplay.length > 0 ? reservationsToDisplay.map(res => {
                                const canAct = 
                                    (user.profile === 'Secretaria' && res.Status === 'Aguardando Secretaria') ||
                                    (user.profile === 'ProdutorEventos' && res.Status === 'Aguardando Produtor');
                                    // TI_Admin pode ver tudo, mas as ações são específicas dos perfis

                                return (
                                    <tr key={res.ReservaEspacoID} className="border-b border-gray-200 hover:bg-slate-50">
                                        <td className="px-5 py-5 text-sm">{res.NomeUsuario}</td>
                                        <td className="px-5 py-5 text-sm font-semibold">{res.NomeEspaco}</td>
                                        <td className="px-5 py-5 text-sm">{new Date(res.DataInicio).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                        <td className="px-5 py-5 text-sm">
                                            <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${
                                                res.Status === 'Aguardando Secretaria' ? 'bg-orange-200 text-orange-900' :
                                                res.Status === 'Aguardando Produtor' ? 'bg-yellow-200 text-yellow-900' :
                                                res.Status === 'Aprovada' ? 'bg-green-200 text-green-900' :
                                                res.Status === 'Recusada' ? 'bg-red-200 text-red-900' :
                                                'bg-gray-200 text-gray-900'
                                            }`}>
                                                {res.Status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-5 text-sm">
                                            <button 
                                                onClick={() => setSelectedReservation(res)}
                                                className={`px-3 py-1 rounded-full text-white text-xs font-bold ${canAct ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400'}`}
                                            >
                                                {canAct ? 'Processar' : 'Ver Detalhes'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-gray-500">
                                        Nenhuma reserva encontrada para o seu perfil.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            
            {selectedReservation && (
                <ReservationModal
                    reservation={selectedReservation}
                    user={user}
                    onClose={() => setSelectedReservation(null)}
                    onUpdate={handleUpdateStatus}
                />
            )}
        </>
    );
};

export default AdminSpacesPage;