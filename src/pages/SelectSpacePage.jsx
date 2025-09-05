import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Header from '../components/Header';

const SelectSpacePage = ({ user, onSpaceClick, onAdminClick, onLogout, onHomeClick }) => {
    const [spaces, setSpaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSpaces = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:3001/api/espacos');
                if (!response.ok) throw new Error('Não foi possível carregar a lista de espaços.');
                const data = await response.json();
                setSpaces(data);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSpaces();
    }, []);

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100">
            <Header
                user={user}
                onAdminClick={onAdminClick}
                onLogout={onLogout}
                onLogoClick={onHomeClick}
                title="Reservar um Espaço"
            />
            <main className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                {isLoading ? (
                    <p className="text-center text-gray-500">A carregar...</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {spaces.map((space) => (
                             <div 
                                key={space.id}
                                onClick={() => onSpaceClick(space)}
                                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer text-center"
                            >
                                <h2 className="text-xl font-bold text-gray-900">{space.nome}</h2>
                                <p className="text-gray-600 mt-2 min-h-[60px]">{space.descricao}</p>
                                <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500 font-semibold">
                                    <p>Local: {space.localizacao}</p>
                                    <p>Capacidade: {space.capacidade} pessoas</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default SelectSpacePage;