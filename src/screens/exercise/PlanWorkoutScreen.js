import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Firebase from 'firebase';
import { StyleSheet, View, ScrollView, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { useTheme, FAB, Headline, Text, IconButton, Surface, Title, Portal, Dialog, Paragraph, Button } from 'react-native-paper';
import StarRating from 'react-native-star-rating';

import { generatePlan, resetDraftPlan, saveDraftPlan, swapWorkout, removeWorkout } from '~/src/store/exerciseSlice';
import { constants } from '~/src/config';

const styles = StyleSheet.create({
    cell: {
        padding: 8,
        alignContent: 'center',
        justifyContent: 'center',
    },
    iconButton: {
        margin: 0
    }
});

function IconButtonWithoutFeedback(props) {
    return (
        <TouchableWithoutFeedback>
            <TouchableOpacity>
                <IconButton {...props} />
            </TouchableOpacity>
        </TouchableWithoutFeedback>
    );
}

function Row({ last, header, children }) {
    const { colors } = useTheme();
    return (
        <View style={{ flexDirection: 'row', minHeight: 50, borderColor: colors.border, borderBottomWidth: last ? 0 : 2 }}>
            <View style={{ ...styles.cell, flex: 1, borderColor: colors.border, borderRightWidth: 2 }}>
                <Headline style={{ textAlign: 'center' }}>{header}</Headline>
            </View>
            <View style={{ ...styles.cell, flex: 3 }}>
                {children}
            </View>
        </View>
    );
}

function Table({ children }) {
    return (
        <View style={{ width: '100%' }}>
            <Row />
            {children}
            <Row last={true} />
        </View>
    );
}

function ActivityCard({ activity, onPress, onMoveUp, onMoveDown, onDelete }) {
    const { colors } = useTheme();
    let title, content;
    switch (activity.type) {
        case 'workout':
            title = activity.name;
            content = (
                <View>
                    <StarRating
                        disabled={true}
                        maxStars={5}
                        rating={activity.level}
                        iconSet='Entypo'
                        fullStar='star'
                        emptyStar='star-outlined'
                        fullStarColor={colors.accent}
                        starSize={20}
                        containerStyle={{ justifyContent: 'flex-start', marginLeft: 7 }}
                    />
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <IconButton icon='clock-outline' style={styles.iconButton} />
                        <Text>{activity.time} mins</Text>
                    </View>
                </View>
            );
            break;
        case 'rest':
            title = 'Rest';
            break;
        case 'recovery':
            title = 'Recovery';
            break;
    }
    return (
        <TouchableOpacity onPress={onPress}>
            <Surface style={{ minHeight: 100, paddingHorizontal: 10, paddingVertical: 2, flexDirection: 'row', justifyContent: 'space-between', elevation: 5, borderRadius: 7 }}>
                <View>
                    <Title>{title}</Title>
                    {content}
                </View>
                <View>
                    <IconButtonWithoutFeedback icon='chevron-up' style={styles.iconButton} color={colors.primary} onPress={onMoveUp} />
                    <IconButtonWithoutFeedback icon='delete' style={styles.iconButton} color={colors.disabled} onPress={onDelete} />
                    <IconButtonWithoutFeedback icon='chevron-down' style={styles.iconButton} color={colors.primary} onPress={onMoveDown} />
                </View>
            </Surface>
        </TouchableOpacity>
    );
}

export default function PlanWorkoutScreen({ navigation }) {
    const uid = useSelector(state => state.main.auth.user.uid);
    const draftPlan = useSelector(state => state.main.exercise.draftPlan);
    const planModified = useSelector(state => state.main.exercise.planModified);
    const profile = useSelector(state => state.main.auth.profile);
    const dispatch = useDispatch();
    const [saveDialogVisible, setSaveDialogVisible] = useState(false);
    const [generateDialogVisible, setGenerateDialogVisible] = useState(false);
    const [navigationAction, setNavigationAction] = useState(false);    // The navigation action interrupted by the 'Save?' dialog
    const { colors } = useTheme();

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', event => {
            if (planModified) {
                event.preventDefault();
                setNavigationAction(event.data.action);
                setSaveDialogVisible(true);
            }
        });
        return unsubscribe;
    }, [navigation, planModified]);

    const onActivityPress = day => {
        const activity = draftPlan[day];
        if (activity.type == 'workout')
            navigation.navigate('View Workout', { day });
    };
    const onActivityMoveUp = day => {
        const index = constants.days.indexOf(day);
        if (index > 0) {
            let prevDay = constants.days[index - 1];
            dispatch(swapWorkout({ fromDay: prevDay, toDay: day }));
        }
    };
    const onActivityMoveDown = day => {
        const index = constants.days.indexOf(day);
        if (index < constants.days.length - 1) {
            let nextDay = constants.days[index + 1];
            dispatch(swapWorkout({ fromDay: nextDay, toDay: day }));
        }
    };
    const onActivityDelete = day => {
        dispatch(removeWorkout({ day }));
    };
    const onSaveDialogDismiss = () => {
        setSaveDialogVisible(false);
    };
    const onSaveChanges = () => {
        setSaveDialogVisible(false);
        Firebase.database().ref(`/users/${uid}/exercisePlan`).set(draftPlan);   // Save to firebase
        dispatch(saveDraftPlan());
        navigation.dispatch(navigationAction);
    };
    const onDiscardChanges = () => {
        setSaveDialogVisible(false);
        dispatch(resetDraftPlan());
        navigation.dispatch(navigationAction);
    };
    const onCancelChanges = () => {
        setSaveDialogVisible(false);
    }
    const onGenerateDialogDismiss = () => {
        setGenerateDialogVisible(false);
    };
    const onPressGenerate = () => {
        setGenerateDialogVisible(true);
    };
    const onGenerate = () => {
        dispatch(generatePlan(profile));
        setGenerateDialogVisible(false);
    };
    const onGenerateCancel = () => {
        setGenerateDialogVisible(false);
    };

    const rows = !!draftPlan ? constants.days.map(day => {
        const header = day[0].toUpperCase() + day.slice(1);
        const activity = draftPlan[day];
        const component = activity == undefined ?
            <FAB icon='plus' label='Add' /> :
            <ActivityCard activity={activity} onPress={() => onActivityPress(day)} onMoveUp={() => onActivityMoveUp(day)} onMoveDown={() => onActivityMoveDown(day)} onDelete={() => onActivityDelete(day)} />;
        return (
            <Row key={day} header={header}>
                {component}
            </Row>
        );
    }) : [];
    return (
        <View>
            <ScrollView style={{ padding: 20 }}>
                <Table>
                    {rows}
                </Table>
                <Portal>
                    {/* Save Dialog */}
                    <Dialog visible={saveDialogVisible} onDismiss={onSaveDialogDismiss}>
                        <Dialog.Title>Save?</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph>You have made changes to your workout plan.</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={onSaveChanges}>Save</Button>
                            <Button color={colors.disabled} onPress={onDiscardChanges}>Don't save</Button>
                            <Button color={colors.disabled} onPress={onCancelChanges}>Cancel</Button>
                        </Dialog.Actions>
                    </Dialog>
                    {/* Generate plan Dialog */}
                    <Dialog visible={generateDialogVisible} onDismiss={onGenerateDialogDismiss}>
                        <Dialog.Title>Generate new plan?</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph>This will overwrite your current changes, but you can review the new plan before saving it.</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={onGenerate}>Generate</Button>
                            <Button color={colors.disabled} onPress={onGenerateCancel}>Cancel</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </ScrollView>
            <FAB
                icon='reload'
                style={{ position: 'absolute', right: 16, bottom: 16 }}
                onPress={onPressGenerate}
            />
        </View>

    );
}