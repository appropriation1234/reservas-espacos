import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Header from '../components/Header';

const DateTimePage = ({ user, space, onDateTimeSubmit, onBack, onLogout, onHomeClick }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (endTime <= startTime) {
            toast.error("O horário de término deve ser posterior ao horário de início.");
            return;
        }
        onDateTimeSubmit({ date, startTime, endTime });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                user={user}
                onLogout={onLogout}
                onHomeClick={onHomeClick}
                title={`Reservar: ${space.nome}`}
            />
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full">
                <button onClick={onBack} className="mb-6 font-semibold text-blue-600 hover:underline">
                    &larr; Voltar
                </button>
                <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-md">
                    <h1 className="text-2xl font-bold text-gray-800">Selecione a Data e o Horário</h1>
                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Data</label>
                            <input
                                type="date"
                                id="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Início</label>
                                <input
                                    type="time"
                                    id="startTime"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">Término</label>
                                <input
                                    type="time"
                                    id="endTime"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                            Avançar
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default DateTimePage;