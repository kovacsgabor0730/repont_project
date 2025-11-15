import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../hooks';
import api from '../api/axiosClient';

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

    const getEventTypeColor = (type: string) => {
        switch (type) {
            case 'success':
                return '#28a745';
            case 'error':
                return '#dc3545';
            case 'warning':
                return '#ffc107';
            default:
                return '#333';
        }
    };

    const getMachineName = (machine: string | MachineData): string => {
        if (typeof machine === 'object' && machine !== null && 'name' in machine) {
            return machine.name;
        }
        return machine as string;
    };

    if (!selectedBeverageType) {
        return <p style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>Kattints egy üdítőre a Leaderboard-on a részletes események megtekintéséhez.</p>;
    }

    if (isLoading) return <div style={{ textAlign: 'center', padding: '20px 0' }}>Részletes események betöltése...</div>;

    return (
        <div style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd', backgroundColor: '#fff' }}>
            <p style={{ fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                Események a szűrők alapján. Összesen: **{events.length}** db (aktuális oldalon)
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th style={tableHeaderStyle}>ID</th>
                        <th style={tableHeaderStyle}>Gép</th>
                        <th style={tableHeaderStyle}>Üdítő</th>
                        <th style={tableHeaderStyle}>Esemény Típusa</th>
                        <th style={tableHeaderStyle}>Időpont</th>
                    </tr>
                </thead>
                <tbody>
                    {events.map((event) => (
                        <tr key={event.id} style={{ transition: 'background-color 0.1s', ':hover': { backgroundColor: '#f9f9f9' } as React.CSSProperties }}>
                            <td style={tableCellStyle}>{event.id}</td>
                            <td style={tableCellStyle}>{getMachineName(event.machine)}</td>
                            <td style={tableCellStyle}>{event.product_name}</td>
                            <td style={{ ...tableCellStyle, color: getEventTypeColor(event.event_type), fontWeight: 'bold' }}>
                                {event.event_type.toUpperCase()}
                            </td>
                            <td style={tableCellStyle}>
                                {formatEventDate(event.event_date)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: 15, textAlign: 'center' }}>
                <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                    style={paginationButtonStyle(currentPage === 1 || isLoading)}
                >
                    &lt; Előző
                </button>
                <span style={{ margin: '0 10px', fontSize: '0.9em' }}>
                    {currentPage} / {lastPage}
                </span>
                <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === lastPage || isLoading}
                    style={paginationButtonStyle(currentPage === lastPage || isLoading)}
                >
                    Következő &gt;
                </button>
            </div>
        </div>
    );
};

const tableHeaderStyle: React.CSSProperties = { border: '1px solid #ddd', padding: 10, textAlign: 'left', backgroundColor: '#e9ecef' };
const tableCellStyle: React.CSSProperties = { border: '1px solid #ddd', padding: 8, textAlign: 'left' };
const paginationButtonStyle = (disabled: boolean): React.CSSProperties => ({
    padding: '5px 10px',
    margin: '0 5px',
    backgroundColor: disabled ? '#ccc' : '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s',
});

export default EventsTable;