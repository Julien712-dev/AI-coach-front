import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { View, ScrollView } from 'react-native';
import { useTheme, Button, FAB, Text, Headline, Paragraph, Card, Title } from 'react-native-paper';
import ProgressCircle from 'react-native-progress-circle';
import { constants } from '~/src/config';

import { Pedometer } from 'expo-sensors';
import Ionicons from 'react-native-vector-icons/Ionicons';

function getDayOfWeek() {
	return constants.days[(new Date()).getDay()];
}

function AnalysisCard() {
	return (
		<Card style={{ width: '100%', marginTop: 10 }}>
			<Card.Title title='Analysis' />
			<Card.Content>
				<Paragraph>You are doing great so far! But try not to exercise immediately after lunch, which may hurt your intestine.</Paragraph>
			</Card.Content>
		</Card>
	);
}

function WorkoutReminderCard({ workout, onPressStart }) {
	const { colors } = useTheme();
	return (
		<Card style={{ width: '100%', marginTop: 10 }}>
			<Card.Title title='Reminder' />
			<Card.Content>
				<Paragraph>A {workout.time} minutes {workout.name} on the schedule today!</Paragraph>
			</Card.Content>
			<Card.Actions>
				<Button onPress={onPressStart}>Start</Button>
				<Button color={colors.disabled}>Dismiss</Button>
			</Card.Actions>
		</Card>
	);
}

export default function ExerciseMainScreen({ navigation }) {
	const today = getDayOfWeek();
	const workoutToday = useSelector(state => state.main.exercise.plan?.[today]);
	const { colors } = useTheme();

	const onPressLogWorkout = () => navigation.navigate('Log Workout');
	const onPressDoWorkout = () => navigation.navigate('Do Workout', { day: today });
	const onPressPlanWorkout = () => navigation.navigate('Plan Workout');

	const [pedometerAvailable, setPedometerAvailable] = useState(false);
	const [todaySteps, setTodaySteps] = useState(0);
	const [stepHelperText, setStepHelperText] = useState('Consider walk more...')

	useEffect(() => {
		Pedometer.isAvailableAsync().then(result => {
			console.log('pedometer enabled: ', result);
			setPedometerAvailable(result);
			const end = new Date();
			const start = new Date();
			if (result) {
				start.setDate(end.getDate() - 1);
				Pedometer.getStepCountAsync(start, end).then(
					result => {
						console.log('past step count: ', result.steps)
						setTodaySteps(result.steps);

						switch (true) {
							case (result.steps < 5000): { setStepHelperText('You are quite inactive. A healthy person walks 8,000 - 10,000 steps per day. Work harder!'); break; }
							case (result.steps < 10000): { setStepHelperText('You are about to reach 10,000 steps today! This is the aveage steps of a healthy person!'); break; }
							case (result.steps > 10000): { setStepHelperText('You have been very active today! Be prepared to burn some calories!'); break; }
						}
					},
					error => {
						console.log(error);
					}
				)
			}
		},
			error => {
				console.log(error)
			})

	}, [])

	let cards = [<AnalysisCard key='analysis' />];
	if (workoutToday?.type == 'workout')
		cards.push(<WorkoutReminderCard key='workout-reminder' workout={workoutToday} onPressStart={onPressDoWorkout} />);

	return (
		<ScrollView contentContainerStyle={{ alignItems: 'center', padding: 20 }}>
			{pedometerAvailable ?
				<View style={{ marginVertical: 10, justifyContent: 'center', alignItems: 'center' }}>
					<Title style={{ fontWeight: '600', fontSize: 28 }}>Today's Activity</Title>
					<ProgressCircle
						percent={todaySteps / 10000 * 100}
						radius={100}
						borderWidth={8}
						color={colors.primary}
						shadowColor={colors.border}
						bgColor={colors.background}
					>
						<Headline>{todaySteps}</Headline>
						<Text>out of 10,000</Text>
					</ProgressCircle>
					<Paragraph style={{ marginHorizontal: 15, marginTop: 10 }}>{stepHelperText}</Paragraph>
				</View> :
				<View style={{ marginVertical: 20, justifyContent: 'center', alignItems: 'center' }}>

					<Ionicons name={'ios-speedometer'} size={150} color={'dodgerblue'} style={{ paddingLeft: 10 }} />
					<Paragraph>Please enable pedometer on your device to track your level of activity.</Paragraph>
				</View>
			}

			{cards}
			<View style={{ width: '100%', marginTop: 30, flexDirection: 'row', justifyContent: 'space-around' }}>
				<FAB icon='plus' onPress={onPressLogWorkout} survey/>
				<FAB icon='play' onPress={onPressDoWorkout} />
				<FAB icon='pencil' onPress={onPressPlanWorkout} />
			</View>
		</ScrollView>
	);
}