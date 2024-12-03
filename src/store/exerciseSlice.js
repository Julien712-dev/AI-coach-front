import { createSlice } from '@reduxjs/toolkit';
import generateExercisePlan from './generateExercisePlan';
import exerciseLibrary from '~/src/data/exerciseLibrary.json';

const exerciseSlice = createSlice({
    name: 'exercise',
    initialState: {
        plan: null,
        planModified: false,
        library: exerciseLibrary,
        ongoingWorkout: {}
    },
    reducers: {
        setPlan: (state, action) => {
            state.plan = action.payload.plan;
            state.draftPlan = action.payload.plan;
            state.planModified = false;
        },
        generatePlan: (state, action) => {
            const { dayPerWeek, minutePerSession, physicalFitness } = action.payload;
            state.plan = generateExercisePlan({ dayPerWeek, minutePerSession, physicalFitness });
            state.draftPlan = state.plan;
            state.planModified = true;
        },
        resetDraftPlan: state => {
            state.draftPlan = state.plan;
            state.planModified = false;
        },
        saveDraftPlan: state => {
            state.plan = state.draftPlan;
            state.planModified = false;
        },
        swapWorkout: (state, action) => {
            const { fromDay, toDay } = action.payload;
            let temp = state.draftPlan[toDay];
            state.draftPlan[toDay] = state.draftPlan[fromDay];
            state.draftPlan[fromDay] = temp;
            state.planModified = true;
        },
        removeWorkout: (state, action) => {
            delete state.draftPlan[action.payload.day];
            state.planModified = true;
        },
        swapExercise: (state, action) => {
            const { day, fromIndex, toIndex } = action.payload;
            let sequence = state.draftPlan[day].sequence;
            sequence.splice(toIndex, 0, sequence.splice(fromIndex, 1)[0]);
            state.planModified = true;
        },
        changeExerciseLength: (state, action) => {
            const { day, index, length } = action.payload;
            state.draftPlan[day].sequence[index].length = length;
            state.planModified = true;
        },
        startWorkout: (state, action) => {
            const { day } = action.payload;
            state.ongoingWorkout = {
                plan: JSON.parse(JSON.stringify(state.plan[day])),
                progress: { stage: 'exercise', index: 0 },
                videos: [],
            }
        },
        completeRest: state => {
            const { progress } = state.ongoingWorkout;
            progress.stage = 'exercise';
            progress.index++;
        },
        completeExercise: (state, action) => {
            const { video } = action.payload;
            const { plan, progress, videos } = state.ongoingWorkout;
            videos[progress.index] = video;
            progress.stage = 'rest';
        }
    }
});

const { reducer, actions } = exerciseSlice;
export const { setPlan, generatePlan, resetDraftPlan, saveDraftPlan, swapWorkout, removeWorkout, swapExercise, changeExerciseLength, startWorkout, completeExercise, completeRest } = actions;
export default reducer;