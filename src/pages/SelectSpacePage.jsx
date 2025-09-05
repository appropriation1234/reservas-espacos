import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const SelectSpacePage = ({ onSpaceClick }) => {
    const [spaces, setSpaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSpaces = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:3001/api/espacos');
                if (!response.ok) {
                    throw new Error('Não foi possível carregar a lista de espaços.');
                }
                const data = await response.json();
                setSpaces(data);
            } catch (error) {
                console.error("Erro ao buscar espaços:", error);
                toast.error(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSpaces();
    }, []);

    if (isLoading) {
        return <p className="text-center text-slate-500">A carregar espaços disponíveis...</p>;
    }

    return (
        <>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Selecione um Espaço</h1>
            
            {spaces.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {spaces.map((space) => (
                        <div 
                            key={space.id}
                            onClick={() => onSpaceClick(space)}
                            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                        >
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 mt-2">{space.nome}</h2>
                                <p className="text-slate-600 mt-2 min-h-[60px]">{space.descricao}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-200 text-sm text-slate-500">
                                {space.localizacao && <p><strong>Localização:</strong> {space.localizacao}</p>}
                                {space.capacidade && <p><strong>Capacidade:</strong> {space.capacidade} pessoas</p>}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-slate-500">Nenhum espaço disponível para reserva no momento.</p>
            )}
        </>
    );
};

export default SelectSpacePage;