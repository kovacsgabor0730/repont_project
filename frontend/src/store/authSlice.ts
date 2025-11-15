// src/store/authSlice.ts

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    authToken: string | null;
}

const token = localStorage.getItem('authToken');

const initialState: AuthState = {
    authToken: token,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {

        setAuthToken: (state, action: PayloadAction<string>) => {
            state.authToken = action.payload;
            localStorage.setItem('authToken', action.payload);
        },

        clearAuthToken: (state) => {
            state.authToken = null;
            localStorage.removeItem('authToken');
        },
    },
});

export const { setAuthToken, clearAuthToken } = authSlice.actions;

export default authSlice.reducer;