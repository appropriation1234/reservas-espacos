import React from 'react';

const logoUrl = '/logo-cervantes.png'; 

const Header = ({ user, onAdminClick, onLogout, onHomeClick, title, onMyReservationsClick }) => {
    return (
        <header className="bg-white shadow-sm w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex-shrink-0">
                        <button onClick={onHomeClick}>
                            <img className="h-14" src={logoUrl} alt="Colégio Miguel de Cervantes" />
                        </button>
                    </div>
                    <div className="flex-grow text-center">
                        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={onMyReservationsClick}
                            className="bg-white text-blue-600 border border-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                        >
                            Minhas Reservas
                        </button>
                        {user && ['TI_Admin', 'Secretaria', 'ProdutorEventos'].includes(user.profile) && (
                            <button 
                                onClick={onAdminClick}
                                className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-red-700 transition-colors"
                            >
                                Admin
                            </button>
                        )}
                        <button 
                            onClick={onLogout}
                            className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;