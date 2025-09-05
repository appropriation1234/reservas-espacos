import React, { useState } from 'react';
import { toast } from 'react-toastify';

const DateTimePage = ({ space, onDateTimeSubmit, onBack }) => {
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
        <>
            <button onClick={onBack} className="mb-6 text-blue-600 hover:underline font-semibold">
                &larr; Voltar para a seleção de espaços
            </button>

            <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-slate-800">Reservar: {space.nome}</h1>
                <p className="text-slate-600 mt-2 mb-8">Selecione a data e o horário desejados.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="date" className="block text-lg font-medium text-gray-800 mb-2">Data</label>
                        <input
                            type="date"
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="startTime" className="block text-lg font-medium text-gray-800 mb-2">Início</label>
                            <input
                                type="time"
                                id="startTime"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="endTime" className="block text-lg font-medium text-gray-800 mb-2">Término</label>
                            <input
                                type="time"
                                id="endTime"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                        Avançar
                    </button>
                </form>
            </div>
        </>
    );
};

export default DateTimePage;