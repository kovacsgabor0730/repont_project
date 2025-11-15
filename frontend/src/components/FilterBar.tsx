import React, { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { setMachine, setTimeInterval } from '../store/dashboardSlice';

// --- DÁTUM KONVERZIÓS SEGÉDFÜGGVÉNYEK ---

/**
 * Konvertálja a Backend formátumot (YYYY-MM-DD HH:MM:SS) a HTML input formátumra (YYYY-MM-DDTHH:mm) a megjelenítéshez.
 */
const convertBackendToLocalFormat = (backendTime: string): string => {
    if (!backendTime || backendTime.length < 16) return '';
    // Kicseréli a szóközből 'T'-re, és levágja a másodpercet
    return backendTime.substring(0, 16).replace(' ', 'T');
};

/**
 * Konvertálja a HTML input formátumot (YYYY-MM-DDTHH:mm) a Backend formátumra (YYYY-MM-DD HH:MM:SS) a Reduxba mentés előtt.
 */
const convertLocalToBackendFormat = (localTime: string): string => {
    if (!localTime) return '';
    // Kicseréli a 'T'-t szóközre, és hozzáadja a másodperceket (:00)
    return localTime.replace('T', ' ') + ':00';
};

// --- INTERFÉSZEK ÉS KOMPONENS ---

interface Machine {
    id: string;
    name: string;
}

interface FilterBarProps {
    machines: Machine[];
}

const FilterBar: React.FC<FilterBarProps> = ({ machines }) => {
    const dispatch = useAppDispatch();

    const { selectedMachineId, startTime, endTime } = useAppSelector(state => state.dashboard);

    // Dátumok konvertálása a Reduxból érkező (backend) formátumról a HTML input (local) formátumra.
    const localStartTime = useMemo(() => convertBackendToLocalFormat(startTime), [startTime]);
    const localEndTime = useMemo(() => convertBackendToLocalFormat(endTime), [endTime]);

    const handleMachineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setMachine(e.target.value));
    };

    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // A kapott HTML input értéket konvertáljuk vissza a backend formátumára mentés előtt
        const newBackendTime = convertLocalToBackendFormat(e.target.value);
        dispatch(setTimeInterval({ start: newBackendTime, end: endTime }));
    };

    const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // A kapott HTML input értéket konvertáljuk vissza a backend formátumára mentés előtt
        const newBackendTime = convertLocalToBackendFormat(e.target.value);
        dispatch(setTimeInterval({ start: startTime, end: newBackendTime }));
    };

    return (
        <div style={{ marginBottom: 20, padding: 20, border: '2px solid #007bff', borderRadius: 8, backgroundColor: '#f7f9fc', fontFamily: 'Arial, sans-serif' }}>
            <h3 style={{ color: '#007bff', marginBottom: 15, borderBottom: '1px solid #007bff20', paddingBottom: 10 }}>Szűrők</h3>
            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-end', flexWrap: 'wrap' }}>

                {/* Automata választó */}
                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Automaták:</label>
                    <select
                        value={selectedMachineId}
                        onChange={handleMachineChange}
                        style={inputStyle}
                    >
                        {/* Hozzáadva az "Összes" opció, ha a Redux is kezeli */}
                        {machines.map((machine) => (
                            <option key={machine.id} value={machine.id}>
                                {machine.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Kezdő Dátum/Idő Picker (DateTimePicker) */}
                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Kezdő időpont:</label>
                    <input
                        type="datetime-local"
                        value={localStartTime} // local formátum megjelenítése
                        onChange={handleStartTimeChange} // local formátum kezelése, majd konvertálása Reduxba
                        style={inputStyle}
                    />
                </div>

                {/* Vég Dátum/Idő Picker (DateTimePicker) */}
                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Vég időpont:</label>
                    <input
                        type="datetime-local"
                        value={localEndTime} // local formátum megjelenítése
                        onChange={handleEndTimeChange} // local formátum kezelése, majd konvertálása Reduxba
                        style={inputStyle}
                    />
                </div>
            </div>
        </div>
    );
};

// --- STÍLUSOK ---
const inputGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 220,
};

const labelStyle: React.CSSProperties = {
    marginBottom: 5,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
};

const inputStyle: React.CSSProperties = {
    padding: 10,
    border: '1px solid #aaa',
    borderRadius: 4,
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
};

export default FilterBar;