import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import api from '../api/axiosClient';

import FilterBar from '../components/FilterBar';
import LeaderboardChart from '../components/LeaderboardChart';
import EventsTable from '../components/EventsTable';
import LogoutButton from '../components/LogoutButton';
import BoschLogo from '../assets/logo.png';

import './DashboardPage.css';

interface Machine {
    id: string;
    name: string;
}

const DashboardPage: React.FC = () => {
    const [machines, setMachines] = useState<Machine[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const selectedBeverageType = useSelector((state: RootState) => state.dashboard.selectedBeverageType);

    useEffect(() => {
        document.title = 'Dashboard';

        const fetchMachines = async () => {
            try {
                const response = await api.get<Machine[]>('/machines');
                setMachines(response.data);
            } catch (err) {
                console.error('Hiba a gépek lekérdezésekor:', err);
                setError('Nem sikerült lekérdezni az automatákat. Lehet, hogy lejárt a token.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMachines();
    }, []);

    if (isLoading) return <div className="dashboard-loading">Adatok betöltése...</div>;
    if (error) return <div className="dashboard-error">Hiba: {error}</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Repont Dashboard</h1>
                <img
                    src={BoschLogo}
                    alt="Bosch Logó"
                    className="h-12 w-auto object-contain mb-1"
                />
                <LogoutButton />
            </div>

            <FilterBar machines={machines} />

            <hr className="dashboard-divider" />

            <section className="dashboard-section">
                <h2>Visszavitt mennyiségek (Top Üdítők)</h2>
                <LeaderboardChart />
            </section>

            <hr className="dashboard-divider" />

            <section className="dashboard-section">
                {selectedBeverageType ? (
                    <>
                        <h2>Részletes események: {selectedBeverageType}</h2>
                        <EventsTable />
                    </>
                ) : (
                    <p className="dashboard-hint">Kattints egy oszlopra a Leaderboard-on (fent) a részletes események betöltéséhez.</p>
                )}
            </section>
        </div>
    );
};

export default DashboardPage;