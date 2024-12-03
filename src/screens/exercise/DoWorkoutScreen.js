import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { TouchableOpacity, View } from 'react-native';
import { useTheme, Headline, Text, Snackbar } from 'react-native-paper';
import { CAMERA } from 'expo-permissions';
import { Camera } from 'expo-camera';
import * as Speech from 'expo-speech';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import ProgressCircle from 'react-native-progress-circle';
import usePermissions from '~/src/hooks/usePermissions';
import useCameraRatio from '~/src/hooks/useCameraRatio';
import useExerciseClassifier from '~/src/hooks/exercise/useExerciseClassifier';
import useTimer from '~/src/hooks/useTimer';
import LoadingScreen from '~/src/screens/LoadingScreen';
import MultiDivider from '~/src/components/MultiDivider';
import { startWorkout, completeRest, completeExercise } from '~/src/store/exerciseSlice';

function calculateAspectRatio(ratio) {
    const [height, width] = ratio.split(':');
    return width / height;
}

function getAdvice(label) {
    switch(label) {
        case 'push-up-arms-not-bent-enough': return 'You need to bend lower!';
        case 'push-up-waist-too-low': return 'Keep your body straight!';
        case 'sit-up-too-low': return 'Move your body higher!';
        default: return 'You are doing great!';
    }
}

const TensorCamera = cameraWithTensors(Camera);

function CustomProgressCircle({ children, percent }) {
    const { colors } = useTheme();
    return (
        <ProgressCircle
            percent={percent}
            radius={100}
            borderWidth={8}
            color={colors.primary}
            shadowColor={colors.border}
            bgColor={colors.background}
            outerCircleStyle={{ marginTop: 10 }}
        >
            {children}
        </ProgressCircle>);
}

function DoExerciseScreen({ index, exercise, onComplete, classification, setImageIterator }) {
    const imageWidth = 300;

    const description = useSelector(state => state.main.exercise.library[exercise.type]);
    const { colors } = useTheme();

    const timeElapsed = useTimer([index], 100);
    const secondsElapsed = Math.floor(timeElapsed / 1000);

    const [cameraRef, adjustCameraRatio, cameraRatio] = useCameraRatio('4:3', { tensor: true });
    const cameraAspectRatio = calculateAspectRatio(cameraRatio);

    useEffect(() => {
        console.debug(classification);
        if (!!classification)
            Speech.speak(getAdvice(classification.classLabel));
    }, [classification]);

    // Check if countdown is finished
    useEffect(() => {
        if (!!description && description.lengthUnit == 'seconds' && secondsElapsed >= exercise.length)
            onComplete();
    }, [exercise, description, secondsElapsed, onComplete]);

    const onCameraReady = async imageIterator => {
        adjustCameraRatio();
        setImageIterator(imageIterator);
    };

    if (!!description && description.lengthUnit == 'reps')
        var progressContent = (
            <TouchableOpacity onLongPress={onComplete}>
                <CustomProgressCircle percent={0}>
                    <Text style={{ fontSize: 50 }}>{exercise.length}</Text>
                    <Text>reps</Text>
                </CustomProgressCircle>
            </TouchableOpacity>
        );
    else if (!!description && description.lengthUnit == 'seconds') {
        const secondsLeft = Math.max(0, exercise.length - secondsElapsed);
        const percent = Math.min(100, 100 * (timeElapsed / (exercise.length * 1000)));
        var progressContent = (
            <CustomProgressCircle percent={percent}>
                <Text style={{ fontSize: 50 }}>{secondsLeft}</Text>
                <Text>seconds left</Text>
            </CustomProgressCircle>
        );
    }

    return (
        <View style={{ padding: 20, alignItems: 'center' }}>
            <Headline style={{ textAlign: 'center', color: colors.primary }}>{exercise.type}</Headline>
            <TensorCamera
                ref={cameraRef}
                type={Camera.Constants.Type.front}
                style={{ height: '60%', aspectRatio: cameraAspectRatio, marginBottom: 10 }}
                resizeWidth={imageWidth}
                resizeHeight={imageWidth / cameraAspectRatio}
                resizeDepth={3}
                onReady={onCameraReady}
            />
            <MultiDivider thickness={5} />
            {progressContent}
        </View>
    );
}

function RestScreen({ index, nextExercise, onComplete }) {
    const length = 30;

    const { colors } = useTheme();

    const timeElapsed = useTimer([index], 100);
    const secondsElapsed = Math.floor(timeElapsed / 1000);
    const secondsLeft = Math.max(0, length - secondsElapsed);
    const percent = Math.min(100, 100 * (timeElapsed / (length * 1000)));

    // Update progress if countdown is completed
    useEffect(() => {
        if (secondsElapsed >= length)
            onComplete();
    }, [secondsElapsed, length]);

    const nextTip = nextExercise != null ? (
        <Snackbar style={{ marginTop: 'auto' }} visible={true} onDismiss={() => { }}>
            Next up: {nextExercise.type}
        </Snackbar>
    ) : undefined;

    return (
        <View style={{ padding: 20, alignItems: 'center', height: '100%' }}>
            <Headline style={{ textAlign: 'center', color: colors.primary }}>Take a rest</Headline>
            <View style={{ minHeight: '40%', justifyContent: 'center' }}>
                <CustomProgressCircle percent={percent}>
                    <Text style={{ fontSize: 50 }}>{secondsLeft}</Text>
                    <Text>seconds left</Text>
                </CustomProgressCircle>
            </View>
            {nextTip}
        </View>
    );
}

export default function DoWorkoutScreen({ navigation, route }) {
    const { day } = route.params;

    const { plan, progress } = useSelector(state => state.main.exercise.ongoingWorkout);
    const exercise = plan != null ? plan.sequence[progress.index] : undefined;
    const dispatch = useDispatch();

    const permissions = usePermissions([CAMERA]);

    const [isClassifierReady, classification, setImageIterator] = useExerciseClassifier(5, progress?.index);

    useEffect(() => { dispatch(startWorkout({ day })); }, [day]);

    // Check if workout is finished
    useEffect(() => {
        if (plan != null && ((progress.index == plan.sequence.length - 1 && progress.stage == 'rest') || progress.index >= plan.sequence.length))
            navigation.goBack();
        // Todo
    }, [plan, progress, navigation]);

    if (plan == null || permissions == null || permissions.status == 'undecided' || !isClassifierReady)
        return <LoadingScreen />;
    else if (permissions.status == 'denied')
        navigation.goBack();
    else {
        if (progress.stage == 'exercise') {
            const onCompleteExercise = video => dispatch(completeExercise({ video }));
            return <DoExerciseScreen index={progress.index} exercise={exercise} onComplete={onCompleteExercise} classification={classification} setImageIterator={setImageIterator} />
        }
        else if (progress.stage == 'rest') {
            const onCompleteRest = () => dispatch(completeRest());
            const isLast = progress.index >= plan.sequence.length - 1;
            const nextExercise = isLast ? null : plan.sequence[progress.index + 1];
            return <RestScreen index={progress.index} nextExercise={nextExercise} onComplete={onCompleteRest} />
        }
    }
}