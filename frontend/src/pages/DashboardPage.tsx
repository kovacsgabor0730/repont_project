import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import api from '../api/axiosClient';

import FilterBar from '../components/FilterBar';
import LeaderboardChart from '../components/LeaderboardChart';
import EventsTable from '../components/EventsTable';
import LogoutButton from '../components/LogoutButton';

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
                console.error("Hiba a gépek lekérdezésekor:", err);
                setError("Nem sikerült lekérdezni az automatákat. Lehet, hogy lejárt a token.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMachines();
    }, []);

    if (isLoading) return <div style={{ padding: 20 }}>Adatok betöltése...</div>;
    if (error) return <div style={{ padding: 20, color: 'red' }}>Hiba: {error}</div>;

    return (
        <div style={{ padding: 20, maxWidth: 1200, margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1>RePont Dashboard</h1>
                <LogoutButton />
            </div>

            <FilterBar machines={machines} />

            <hr style={{ margin: '30px 0' }} />

            <section style={{ marginBottom: 40 }}>
                <h2>Visszavitt mennyiségek (Top Üdítők)</h2>
                <LeaderboardChart />
            </section>

            <hr style={{ margin: '30px 0' }} />

            <section>
                {selectedBeverageType ? (
                    <>
                        <h2>Részletes események: {selectedBeverageType}</h2>
                        <EventsTable />
                    </>
                ) : (
                    <p style={{ textAlign: 'center', color: '#666' }}>
                        Kattints egy oszlopra a Leaderboard-on (fent) a részletes események betöltéséhez.
                    </p>
                )}
            </section>
        </div>
    );
};

export default DashboardPage;