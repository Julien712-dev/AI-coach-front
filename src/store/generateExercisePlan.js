
import { constants } from '~/src/config';
import { capitalize } from '~/src/Util';
import exerciseLibrary from '~/src/data/exerciseLibrary.json';

const focuses = ['arm', 'core', 'leg', 'glute'];
const focusMapping = {
    'Forearm': 'arm',
    'Triceps': 'arm',
    'Biceps': 'arm',
    'Shoulders': 'arm',
    'Abs': 'core',
    'Lower Legs': 'leg',
    'Upper Legs': 'leg',
    'Glutes': 'glute'
};

function getFocus(exercise) {
    return focusMapping[exercise.mainMuscle];
}

function findExercise(focus) {
    const suitableExercises = focus != 'wholebody' ? Object.entries(exerciseLibrary).filter(([key, value]) =>
        getFocus(value) == focus
    ) : Object.entries(exerciseLibrary);
    return suitableExercises[Math.floor(Math.random() * suitableExercises.length)];
}

function computeLength(exercise, physicalFitness) {
    let fitnessFactor;
    switch (physicalFitness) {
        case 'poor': fitnessFactor = 1; break;
        case 'below': fitnessFactor = 1.3; break;
        case 'average': fitnessFactor = 1.5; break;
        case 'above': fitnessFactor = 1.7; break;
        case 'excellent': fitnessFactor = 2; break;
    }
    let difficultyFactor;
    switch (exercise.difficulty) {
        case 'Beginner': difficultyFactor = 1; break;
        case 'Intermediate': difficultyFactor = 0.75; break;
        case 'Expert': difficultyFactor = 0.5; break;
    }
    const baseLength = exercise.lengthUnit == 'reps' ? 15 : 25;
    const baseTime = 25;
    return [Math.floor(baseLength * fitnessFactor * difficultyFactor), Math.floor(baseTime * fitnessFactor * difficultyFactor)];
}

function generateEmptyPlan(dayPerWeek, minutePerSession) {
    let days;
    switch (dayPerWeek) {
        case 1: days = { workoutDays: ['sun'], recoveryDays: [], restDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'] }; break;
        case 2: days = { workoutDays: ['sun', 'wed'], recoveryDays: [], restDays: ['mon', 'tue', 'thu', 'fri', 'sat'] }; break;
        case 3: days = { workoutDays: ['mon', 'wed', 'sat'], recoveryDays: [], restDays: ['sun', 'tue', 'thu', 'fri'] }; break;
        case 4: days = { workoutDays: ['mon', 'tue', 'sat'], recoveryDays: ['fri'], restDays: ['wed', 'thu', 'sun'] }; break;
        case 5: days = { workoutDays: ['mon', 'tue', 'thu', 'fri'], recoveryDays: ['sat'], restDays: ['wed', 'sun'] }; break;
    }
    const plan = {};
    for (const day of days.workoutDays)
        plan[day] = { type: 'workout', time: minutePerSession };
    for (const day of days.recoveryDays)
        plan[day] = { type: 'recovery' };
    for (const day of days.restDays)
        plan[day] = { type: 'rest' };

    return plan;
};

function assignIntensity(plan) {
    let high = true;
    for (const day of Object.values(plan))
        if (day.type == 'workout') {
            if (high) {
                day.intensity = 'high';
                high = false;
            } else {
                day.intensity = 'low';
                high = true;
            }
        }
};

function assignFocus(plan) {
    const workoutDays = Object.values(plan).filter(day => day.type == 'workout');
    if (workoutDays.length <= 2)
        for (const day of workoutDays)
            day.focus = 'wholebody';
    else if (workoutDays.length == 3) {
        workoutDays[0].focus = 'arm';
        workoutDays[1].focus = 'leg';
        workoutDays[2].focus = 'core';
    }
    else {
        workoutDays[0].focus = 'arm';
        workoutDays[1].focus = 'leg';
        workoutDays[2].focus = 'core';
        workoutDays[3].focus = 'glute';
    }
}

function assignSequence(plan, physicalFitness) {
    for (const day of Object.values(plan))
        if (day.type == 'workout') {
            day.sequence = [];
            let accumulatedTime = 0;
            const numFocus = Object.fromEntries(focuses.map(focus => [focus, 0]));
            let lastExerciseDescription;
            while (accumulatedTime < day.time * 60) {
                let exerciseType, exerciseDescription;
                if (lastExerciseDescription == null || getFocus(lastExerciseDescription) != day.focus)
                    [exerciseType, exerciseDescription] = findExercise(day.focus);
                else {
                    const focus = Object.entries(numFocus).reduce((prev, curr) => prev[1] < curr[1] ? prev : curr)[0];  // Find the focus with minimum occurrences
                    [exerciseType, exerciseDescription] = findExercise(focus);
                }
                const [exerciseLength, exerciseTime] = computeLength(exerciseDescription, physicalFitness);
                const exercise = { type: exerciseType, length: exerciseLength };
                day.sequence.push(exercise);
                accumulatedTime += exerciseTime + 30;
                lastExerciseDescription = exerciseDescription;
                numFocus[getFocus(lastExerciseDescription)]++;
            }
        }
}

function assignInfo(plan) {
    for (const day of Object.values(plan))
        if (day.type == 'workout') {
            day.name = `${capitalize(day.focus)} Workout`;
            day.level = 4;
        }
}

export default function generateExercisePlan({ dayPerWeek, minutePerSession, physicalFitness }) {
    let plan = generateEmptyPlan(dayPerWeek, minutePerSession);
    assignIntensity(plan);
    assignFocus(plan);
    assignSequence(plan, physicalFitness);
    assignInfo(plan);
    return plan;
}