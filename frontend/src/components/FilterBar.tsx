import React, { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { setMachine, setTimeInterval } from '../store/dashboardSlice';

// --- SEGÉDFÜGGVÉNYEK ---

const convertBackendToLocalFormat = (backendTime: string): string => {
    if (!backendTime || backendTime.length < 16) return '';
    // A Redux store (backend formátum) 'YYYY-MM-DD HH:MM:SS'
    // A HTML input 'YYYY-MM-DDTHH:MM' formátumot vár
    return backendTime.substring(0, 16).replace(' ', 'T');
};

const convertLocalToBackendFormat = (localTime: string): string => {
    if (!localTime) return '';
    // Visszaalakítás a Redux store/Backend által várt 'YYYY-MM-DD HH:MM:00' formátumra
    return localTime.replace('T', ' ') + ':00';
};

// --- INTERFÉSZEK ---

interface Machine {
    id: string;
    name: string;
}

interface FilterBarProps {
    machines: Machine[];
}

// --- KOMPONENS ---

const FilterBar: React.FC<FilterBarProps> = ({ machines }) => {
    const dispatch = useAppDispatch();

    const { selectedMachineId, startTime, endTime } = useAppSelector(state => state.dashboard);

    // Dátum konvertálása HTML input számára
    const localStartTime = useMemo(() => convertBackendToLocalFormat(startTime), [startTime]);
    const localEndTime = useMemo(() => convertBackendToLocalFormat(endTime), [endTime]);

    const handleMachineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setMachine(e.target.value));
    };

    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newBackendTime = convertLocalToBackendFormat(e.target.value);

        // 1. Validáció: Ha az új start_time későbbi, mint a jelenlegi end_time,
        // akkor az end_time-ot is hozzá kell igazítani (a start_time-hoz)
        if (newBackendTime > endTime) {
            dispatch(setTimeInterval({ start: newBackendTime, end: newBackendTime }));
        } else {
            dispatch(setTimeInterval({ start: newBackendTime, end: endTime }));
        }
    };

    const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newBackendTime = convertLocalToBackendFormat(e.target.value);
        // Itt nem kell ellenőriznünk, mert a HTML 'min' attribútuma gondoskodik a böngésző szintű validációról
        dispatch(setTimeInterval({ start: startTime, end: newBackendTime }));
    };

    return (
        <div style={{ marginBottom: 20, padding: 20, border: '2px solid #007bff', borderRadius: 8, backgroundColor: '#f7f9fc', fontFamily: 'Arial, sans-serif' }}>
            <h3 style={{ color: '#007bff', marginBottom: 15, borderBottom: '1px solid #007bff20', paddingBottom: 10 }}>Szűrők</h3>
            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-end', flexWrap: 'wrap' }}>

                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Automaták:</label>
                    <select
                        value={selectedMachineId}
                        onChange={handleMachineChange}
                        style={inputStyle}
                    >
                        {machines.map((machine) => (
                            <option key={machine.id} value={machine.id}>
                                {machine.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Kezdő időpont:</label>
                    <input
                        type="datetime-local"
                        value={localStartTime}
                        onChange={handleStartTimeChange}
                        style={inputStyle}
                    // Megjegyzés: A min attribútum itt nem szükséges, de lehetne
                    // max={localEndTime} ha korlátoznánk a jövőbeli kezdő időpontokat
                    />
                </div>

                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Vég időpont:</label>
                    <input
                        type="datetime-local"
                        value={localEndTime}
                        onChange={handleEndTimeChange}
                        style={inputStyle}
                        // 💡 JAVÍTÁS: Beállítjuk a min attribútumot a kezdő időpont értékére!
                        // Ez megakadályozza, hogy a böngészőben korábbi időpontot válasszanak.
                        min={localStartTime}
                    />
                </div>

                {/* Opcionális: Szöveges ellenőrzés hozzáadása, ha a felhasználó megkerüli a min attribútumot vagy JS-ben akarod kezelni a validációt. */}
                {localEndTime < localStartTime && (
                    <p style={{ color: '#dc3545', marginTop: 5, fontSize: '0.9em' }}>
                        A vég időpont nem lehet korábbi, mint a kezdő időpont!
                    </p>
                )}

            </div>
        </div>
    );
};

// --- STÍLUSOK (megtartva) ---

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