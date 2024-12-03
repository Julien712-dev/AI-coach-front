import React, { useState, useEffect } from 'react';
import * as Firebase from 'firebase';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import { useTheme, Text, HelperText, Button } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import useDropDown from '~/src/hooks/useDropDown';
import DropDown from '~/src/components/DropDown';
import { setLogs } from '~/src/store/authSlice';
import activityCalorie from '~/src/data/activityCalorie.json';

const activityList = Object.keys(activityCalorie).map(activity => ({ label: activity, value: activity }));
const durationList = (new Array(18)).fill(null).map((value, index) => 10 * (index + 1)).map(duration => ({ label: duration.toString(), value: duration }));

function getLevelDescriptor(level) {
    switch (level) {
        case 1: return 'I did not feel tired at all. There was not much exertion.';
        case 2: return 'I was a little out of breath after the activity.';
        case 3: return 'I was quite out of breath after the activity, but there was no muscle soreness.';
        case 4: return 'I was out of breath and my muscles felt sore after the exercise.';
        case 5: return 'I was at my physical limits during the exercise';
    }
}

export default function LogWorkoutScreen({ navigation }) {
    const [level, setLevel] = useState(3);
    const logs = useSelector(state => state.main.auth.logs);
    const user = useSelector(state => state.main.auth.user);
    const [activity, setActivity, isShowActivityDropDown, showActivityDropDown, hideActivityDropDown] = useDropDown();
    const [duration, setDuration, isShowDurationDropDown, showDurationDropDown, hideDurationDropDown] = useDropDown();
    const dispatch = useDispatch();
    const { colors } = useTheme();

    const today = moment();
    const logsDbRef = Firebase.database().ref(`/users/${user.uid}/logs`);
    const workoutDbRef = Firebase.database().ref(`/users/${user.uid}/logs/${today.format('YYYYMMDD')}/workout`);

    useEffect(() => {
        logsDbRef.once('value', snapshot => {
            let value = snapshot.val();
            if (!!value) {
                dispatch(setLogs({ logs: value }));
            }
        });
    }, []);

    const styles = StyleSheet.create({
        container: {
            padding: 20,
            justifyContent: 'space-between',
            flex: 1
        },
        input: {
            marginVertical: 40
        },
        label: {
            marginBottom: 10,
            fontSize: 16,
            color: 'grey'
        },
        levelDescriptor: {
            alignSelf: 'center'
        },
        bottom: {
            flexDirection: 'row',
            justifyContent: 'flex-end'
        }
    });

    const onPressSave = () => {
        const workout = { type: activity, duration, level };

        const workouts = logs[today.format('YYYYMMDD')]?.workout;
        if (workouts != null && Array.isArray(workouts))
            workoutDbRef.set(workouts.concat([workout]));
        else
            workoutDbRef.set([workout]);
        

        // fetch from realtime db again
        setTimeout(() => {
            logsDbRef.once('value', snapshot => {
                let value = snapshot.val();
                if (!!value) {
                    dispatch(setLogs({ logs: value }));
                }
            });
            navigation.navigate('Exercise');
        }, 100);

    };

    const onPressCancel = () => {
        navigation.navigate('Exercise');
    };

    return (
        <View style={styles.container}>
            <View>
                <View style={styles.input}>
                    <DropDown
                        label='Activity'
                        mode='outlined'
                        value={activity}
                        setValue={setActivity}
                        list={activityList}
                        visible={isShowActivityDropDown}
                        showDropDown={showActivityDropDown}
                        onDismiss={hideActivityDropDown}
                        dropDownContainerMaxHeight={400}
                    />
                </View>
                <View style={styles.input}>
                    <DropDown
                        label='Duration in minutes'
                        mode='outlined'
                        value={duration}
                        setValue={setDuration}
                        list={durationList}
                        visible={isShowDurationDropDown}
                        showDropDown={showDurationDropDown}
                        onDismiss={hideDurationDropDown}
                        dropDownContainerMaxHeight={400}
                    />
                </View>
                <View>
                    <Text style={styles.label}>Activeness Level</Text>
                    <Slider
                        thumbTintColor={colors.primary}
                        minimumTrackTintColor={colors.primary}
                        maximumTrackTintColor={colors.primary}
                        minimumValue={1}
                        maximumValue={5}
                        value={level}
                        step={1}
                        onValueChange={setLevel}
                    />
                    <HelperText style={styles.levelDescriptor}>{getLevelDescriptor(level)}</HelperText>
                </View>
            </View>
            <View style={styles.bottom}>
                <Button icon='check' onPress={onPressSave}>
                    Save
                </Button>
                <Button icon='close' onPress={onPressCancel} color={colors.disabled}>
                    Discard
                </Button>
            </View>
        </View>
    );
}