import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { selectBeverage } from '../store/dashboardSlice';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import api from '../api/axiosClient';
import './LeaderboardChart.css';

interface LeaderboardData {
    product_name: string;
    total_count: number;
}

const LeaderboardChart: React.FC = () => {
    const dispatch = useAppDispatch();

    const {
        selectedMachineId,
        startTime,
        endTime,
        selectedBeverageType,
    } = useAppSelector((state) => state.dashboard);

    const [data, setData] = useState<LeaderboardData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await api.get<LeaderboardData[]>('/leaderboard', {
                    params: {
                        machine_id: selectedMachineId,
                        start_time: startTime,
                        end_time: endTime,
                    },
                });

                dispatch(selectBeverage(null));
                setData(response.data);
            } catch (error) {
                console.error('Hiba a Leaderboard adatok lekérésekor:', error);
                setData([]);
                setError('Nem sikerült lekérni a ranglista adatokat a szerverről.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, [selectedMachineId, startTime, endTime, dispatch]);

    const handleBarClick = (payload: LeaderboardData) => {
        const beverageName = payload.product_name;
        const newSelection =
            beverageName === selectedBeverageType ? null : beverageName;

        dispatch(selectBeverage(newSelection));
    };

    if (isLoading) return <div className="loading">Leaderboard adatok betöltése...</div>;

    if (error || data.length === 0) {
        return (
            <div className="no-data">
                {error ||
                    'Nincs visszavitt termék a kiválasztott időszakban és gépnél.'}
            </div>
        );
    }

    return (
        <div className="leaderboard-container">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="product_name" />
                    <YAxis
                        dataKey="total_count"
                        label={{
                            value: 'Darabszám',
                            angle: -90,
                            position: 'insideLeft',
                        }}
                    />
                    <Tooltip formatter={(value: number) => [value, 'Visszavitt darab']} />
                    <Legend />
                    <Bar
                        dataKey="total_count"
                        name="Visszavitt mennyiség"
                        onClick={handleBarClick}
                    >
                        {data.map((entry) => (
                            <Cell
                                key={entry.product_name}
                                fill={
                                    entry.product_name === selectedBeverageType
                                        ? '#20B2AA'
                                        : '#1E90FF'
                                }
                                style={{ cursor: 'pointer' }}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {selectedBeverageType && (
                <p className="selected">Kiválasztva: {selectedBeverageType}</p>
            )}
        </div>
    );
};

export default LeaderboardChart;