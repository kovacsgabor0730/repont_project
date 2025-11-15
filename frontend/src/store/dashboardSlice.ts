import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface DashboardState {
    selectedMachineId: string;
    startTime: string;
    endTime: string;
    selectedBeverageType: string | null;
}

const now = new Date();
const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));

const formatTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const initialState: DashboardState = {
    selectedMachineId: 'all',
    startTime: formatTime(yesterday),
    endTime: formatTime(now),
    selectedBeverageType: null,
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        setMachine: (state, action: PayloadAction<string>) => {
            state.selectedMachineId = action.payload;
            state.selectedBeverageType = null;
        },
        setTimeInterval: (state, action: PayloadAction<{ start: string, end: string }>) => {
            state.startTime = action.payload.start;
            state.endTime = action.payload.end;
            state.selectedBeverageType = null;
        },
        selectBeverage: (state, action: PayloadAction<string | null>) => {
            state.selectedBeverageType = action.payload;
        },
    },
});

export const { setMachine, setTimeInterval, selectBeverage } = dashboardSlice.actions;

export default dashboardSlice.reducer;