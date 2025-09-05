import React from 'react';
import Header from './Header';

const Layout = ({ user, onAdminClick, onLogout, onHomeClick, title, children }) => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header
                user={user}
                onAdminClick={onAdminClick}
                onLogout={onLogout}
                onHomeClick={onHomeClick}
                title={title}
            />
            {/* flex-grow força este elemento a ocupar todo o espaço vertical disponível */}
            <main className="flex-grow w-full">
                {/* A div interna faz a centralização */}
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;