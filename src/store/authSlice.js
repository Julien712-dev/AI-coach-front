import { createSlice } from '@reduxjs/toolkit';
import * as firebase from 'firebase';

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null, // to store the session of the user. when null, user is required to log in
        profile: null,
        logs: null // to store diet and workout logs of the user.
    },
    reducers: {
        login: {
            reducer: (state, action) => {state.user = action.payload.user},
            prepare: () => ({ payload: { user: firebase.auth().currentUser } })
        },
        logout: (state, action) => { return {...state, user: null, profile: null, logs: null} },
        setLogs: (state, action) => {
            state.logs = action.payload.logs
        },
        saveProfileToReducer: (state, action) => {
            state.profile = action.payload.profile;
        },
    }
});

const { reducer, actions } = authSlice;
export const { login, logout, saveProfileToReducer, setLogs } = actions;
export default reducer;