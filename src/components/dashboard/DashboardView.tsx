"use client"
import React from 'react';
import StatCard from './StatCard';
import { Phone, Server, Wifi, Radio } from 'lucide-react';

const DashboardView = () => {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Phone className="w-6 h-6 text-blue-500" />} title="Propostas PABX/SIP" value="12" subtext="Este mês" />
                <StatCard icon={<Server className="w-6 h-6 text-purple-500" />} title="Propostas Máquinas Virtuais" value="8" subtext="Este mês" />
                <StatCard icon={<Wifi className="w-6 h-6 text-green-500" />} title="Propostas Link Fibra" value="15" subtext="Este mês" />
                <StatCard icon={<Radio className="w-6 h-6 text-orange-500" />} title="Propostas Link Rádio" value="5" subtext="Este mês" />
            </div>
        </div>
    );
};

export default DashboardView;
