import React from 'react';

interface ServiceCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, icon, onClick }) => (
    <button 
        onClick={onClick} 
        className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl p-6 text-left hover:bg-gray-700/60 hover:border-cyan-500 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-cyan-400"
    >
        <div className="flex items-center space-x-4">
            <div className="bg-gray-700 p-3 rounded-full">{icon}</div>
            <div>
                <h3 className="text-xl font-bold text-gray-100">{title}</h3>
                <p className="text-gray-400 mt-1">{description}</p>
            </div>
        </div>
    </button>
);

export default ServiceCard;
