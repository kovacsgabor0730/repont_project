import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../hooks';
import api from '../api/axiosClient';
import './EventsTable.css';

const formatEventDate = (isoString: string): string => {
    if (!isoString) return '';

    const match = isoString.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/);

    if (match) {
        return `${match[1]} ${match[2]}`;
    }

    return isoString.substring(0, 19).replace('T', ' ');
};

interface MachineData {
    id: number;
    name: string;
}

interface EventData {
    id: number;
    machine: string | MachineData;
    product_name: string;
    event_date: string;
    event_type: 'success' | 'error' | 'warning';
}

interface PaginatedResponse {
    data: EventData[];
    current_page: number;
    last_page: number;
    total: number;
}

const EventsTable: React.FC = () => {
    const {
        selectedMachineId,
        startTime,
        endTime,
        selectedBeverageType
    } = useAppSelector(state => state.dashboard);

    const [events, setEvents] = useState<EventData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedMachineId, startTime, endTime, selectedBeverageType]);

    useEffect(() => {
        if (!selectedBeverageType) {
            setEvents([]);
            return;
        }

        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                const response = await api.get<PaginatedResponse>('/events', {
                    params: {
                        machine_id: selectedMachineId,
                        start_time: startTime,
                        end_time: endTime,
                        beverage_type: selectedBeverageType,
                        page: currentPage,
                    }
                });

                setEvents(response.data.data.map(item => ({
                    ...item,
                    product_name: selectedBeverageType,
                })));
                setLastPage(response.data.last_page);

            } catch (error) {
                console.error('Hiba az események lekérésekor:', error);
                setEvents([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();

    }, [selectedMachineId, startTime, endTime, selectedBeverageType, currentPage]);

    const getMachineName = (machine: string | MachineData): string => {
        if (typeof machine === 'object' && machine !== null && 'name' in machine) {
            return machine.name;
        }
        return machine as string;
    };

    if (!selectedBeverageType) {
        return (
            <p className="events-no-selection">
                Kattints egy üdítőre a Leaderboard-on a részletes események megtekintéséhez.
            </p>
        );
    }

    if (isLoading) {
        return <div className="events-loading">Részletes események betöltése...</div>;
    }

    return (
        <div className="events-container">
            <p className="events-header">
                Események a szűrők alapján. Összesen: <strong>{events.length}</strong> db (aktuális oldalon)
            </p>

            <table className="events-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Gép</th>
                        <th>Üdítő</th>
                        <th>Esemény Típusa</th>
                        <th>Időpont</th>
                    </tr>
                </thead>
                <tbody>
                    {events.map((event) => (
                        <tr key={event.id}>
                            <td>{event.id}</td>
                            <td>{getMachineName(event.machine)}</td>
                            <td>{event.product_name}</td>
                            <td className={`event-${event.event_type}`}>
                                {event.event_type.toUpperCase()}
                            </td>
                            <td>{formatEventDate(event.event_date)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination-container">
                <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                    className="pagination-button"
                >
                    &lt; Előző
                </button>

                <span className="pagination-info">
                    {currentPage} / {lastPage}
                </span>

                <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === lastPage || isLoading}
                    className="pagination-button"
                >
                    Következő &gt;
                </button>
            </div>
        </div>
    );
};

export default EventsTable;
