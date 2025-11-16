import React, { useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { setMachine, setTimeInterval } from '../store/dashboardSlice';
import './FilterBar.css';

const convertBackendToLocalFormat = (backendTime: string): string => {
    if (!backendTime || backendTime.length < 16) return '';
    return backendTime.substring(0, 16).replace(' ', 'T');
};

const convertLocalToBackendFormat = (localTime: string): string => {
    if (!localTime) return '';
    return localTime.replace('T', ' ') + ':00';
};

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

    const localStartTime = useMemo(() => {
        return convertBackendToLocalFormat(startTime);
    }, [startTime]);

    const localEndTime = useMemo(() => convertBackendToLocalFormat(endTime), [endTime]);

    const handleMachineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setMachine(e.target.value));
    };

    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newBackendTime = convertLocalToBackendFormat(e.target.value);

        if (newBackendTime > endTime) {
            dispatch(setTimeInterval({ start: newBackendTime, end: newBackendTime }));
        } else {
            dispatch(setTimeInterval({ start: newBackendTime, end: endTime }));
        }
    };

    const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newBackendTime = convertLocalToBackendFormat(e.target.value);
        dispatch(setTimeInterval({ start: startTime, end: newBackendTime }));
    };

    const isError = localEndTime && localStartTime && localEndTime < localStartTime;

    return (
        <div className="filterbar-container">
            <h3 className="filterbar-title">Szűrők</h3>

            <div className="filterbar-content">

                <div className="filterbar-group">
                    <label className="filterbar-label">Automaták:</label>
                    <select
                        value={selectedMachineId}
                        onChange={handleMachineChange}
                        className="filterbar-input"
                    >
                        {machines.map((machine) => (
                            <option key={machine.id} value={machine.id}>
                                {machine.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filterbar-group">
                    <label className="filterbar-label">Kezdő időpont:</label>
                    <input
                        type="datetime-local"
                        value={localStartTime}
                        onChange={handleStartTimeChange}
                        className="filterbar-input"
                    />
                </div>

                <div className="filterbar-group">
                    <label className="filterbar-label">Vég időpont:</label>
                    <input
                        type="datetime-local"
                        value={localEndTime}
                        onChange={handleEndTimeChange}
                        className="filterbar-input"
                        min={localStartTime}
                    />
                </div>

                {isError && (
                    <p className="filterbar-error">
                        A vég időpont nem lehet korábbi, mint a kezdő időpont!
                    </p>
                )}

            </div>
        </div>
    );
};

export default FilterBar;