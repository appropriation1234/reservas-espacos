import React from 'react';

const logoUrl = '/logo-cervantes.png';

const Header = ({ user, onAdminClick, onLogout, onHomeClick, title }) => {
    return (
        <header className="bg-white/75 backdrop-blur-lg sticky top-0 z-50 border-b border-slate-200">
            {/* A div interna agora controla a largura e o centramento */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Lado Esquerdo */}
                    <div className="flex items-center space-x-4">
                        <button onClick={onHomeClick} className="flex-shrink-0">
                            <img className="h-10 w-auto" src={logoUrl} alt="Colégio Miguel de Cervantes" />
                        </button>
                        <h1 className="text-xl font-bold text-slate-700 hidden sm:block">{title}</h1>
                    </div>

                    {/* Lado Direito */}
                    <div className="flex items-center space-x-3">
                        {user && ['TI_Admin', 'Secretaria', 'ProdutorEventos'].includes(user.profile) && (
                            <button 
                                onClick={onAdminClick}
                                className="bg-slate-800 text-white font-semibold py-2 px-3 rounded-lg shadow-md hover:bg-slate-900 transition-colors text-sm"
                            >
                                Admin
                            </button>
                        )}
                        <button 
                            onClick={onLogout}
                            className="font-semibold text-sm text-slate-600 hover:text-red-600 transition-colors"
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