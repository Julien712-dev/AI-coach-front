import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Firebase from 'firebase';
import config from '~/src/config';
import { View, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { Button, Text, Title, TextInput, Chip, Snackbar } from 'react-native-paper';
import DropDown from '~/src/components/DropDown';
import LoadingScreen from "../LoadingScreen";
import { updateTempStorage, clearTempStorage } from "~/src/store/profileSlice.js";
import Swiper from 'react-native-swiper';
import BackgroundImage from '~/assets/image/survey-background.jpg';
import { saveProfileToReducer } from '~/src/store/authSlice';

function SurveyOptions(props) {
    let {
        index,
        setValueFunction,
        displayText,
        currentValue,
        value
    } = props;

    return (
        <TouchableOpacity key={index} style={{marginVertical: 5, padding: 15, width: 325, borderRadius: 15, borderWidth: (currentValue == value) ? 2 : 0.85, borderColor: (currentValue == value)? 'green': 'black', backgroundColor: 'white' }} onPress={() => setValueFunction(value)}>
            <Text>{displayText}</Text>
        </TouchableOpacity>
    )
}

function StepOneScreen({ swiperRef }) {

    let currentProfile = useSelector(state => state.main.auth.profile) || {} ;
    const [firstName, setFirstName] = useState(currentProfile.firstName || null);
    const [lastName, setLastName] = useState(currentProfile.lastName || null);
    const [height, setHeight] = useState(currentProfile.height || null);
    const [heightUnit, setHeightUnit] = useState(currentProfile.heightUnit || 'cm');
    const [weight, setWeight] = useState(currentProfile.weight || null);
    const [weightUnit, setWeightUnit] = useState(currentProfile.weightUnit || 'kg');
    const [age, setAge] = useState(currentProfile.age || null);
    const [sex, setSex] = useState(currentProfile.sex || null);
    const [isValid, setIsValid] = useState(false);
    const [showHeightDropDown, setShowHeightDropDown] = useState(false);
    const [showWeightDropDown, setShowWeightDropDown] = useState(false);
    const [showSexDropDown, setShowSexDropDown] = useState(false);

    const dispatch = useDispatch();
    const surveyFields = [firstName, lastName, height, weight, age, sex];

    const validateSurvey = () => {
        for (var surveyField of surveyFields) {
            if (!surveyField) return;
        }
        setIsValid(true);
    }

    useEffect(() => {
        validateSurvey();
    }, surveyFields)
    
    return (
        <View style={{ flex: 1 }}>
            <View style={{ height: 400}}>
            <View style={{ marginHorizontal: 10 }}>
                <Title>Step 1: About You</Title>
            </View>
            <View style={{ flexDirection: "row", width: 365, marginBottom: 20 }}>
                <TextInput style={{
                    width: 165, marginHorizontal: 10, 
                    backgroundColor: 'transparent' }} 
                    label='First Name' 
                    value={firstName} 
                    onChangeText={text => setFirstName(text)} 
                    autoCorrect={false}></TextInput>
                <TextInput 
                    style={{width: 165, marginHorizontal: 10, backgroundColor: 'transparent'}} 
                    label='Last Name' 
                    value={lastName} 
                    onChangeText={text => setLastName(text)} autoCorrect={false}></TextInput>
            </View>
            <View style={{ flexDirection: 'row', width: 365, marginBottom: 20 }}>
                <TextInput style={{ width: 220, marginHorizontal: 10, backgroundColor: 'transparent' }} label='Height' value={height} keyboardType={"number-pad"} onChangeText={text => setHeight(text)} autoCorrect={false}></TextInput>
                <View style={{ width: 120}}>
                    <DropDown
                        label={'Height Unit'}
                        mode={'flat'}
                        theme={{ colors: { 
                            background: 'transparent'
                        } }}
                        value={heightUnit}
                        setValue={setHeightUnit}
                        list={config.constants.heightUnits}
                        visible={showHeightDropDown}
                        showDropDown={() => setShowHeightDropDown(true)}
                        onDismiss={() => setShowHeightDropDown(false)}
                    />
                </View>
            </View>
            <View style={{ flexDirection: "row", width: 365, marginBottom: 20 }}>
                <TextInput style={{ width: 220, marginHorizontal: 10, backgroundColor: 'transparent' }} label='Weight' value={weight} keyboardType={"number-pad"} onChangeText={text => setWeight(text)} autoCorrect={false}></TextInput>
                <View style={{ width: 120 }}>
                    <DropDown
                        label={'Weight Unit'}
                        mode={'flat'}
                        theme={{ colors: { 
                            background: 'transparent'
                        } }}
                        value={weightUnit}
                        setValue={setWeightUnit}
                        list={config.constants.weightUnits}
                        visible={showWeightDropDown}
                        showDropDown={() => setShowWeightDropDown(true)}
                        onDismiss={() => setShowWeightDropDown(false)}
                    />
                </View>
            </View>
            <View style={{ flexDirection: "row", width: 365, marginBottom: 20 }}>
                <TextInput style={{ width: 220, marginHorizontal: 10, backgroundColor: 'transparent' }} label='Age' value={age} keyboardType={"number-pad"} onChangeText={text => setAge(text)} autoCorrect={false}></TextInput>
                <View style={{ width: 120 }}>
                    <DropDown
                        label={'Gender'}
                        mode={'flat'}
                        theme={{ colors: { 
                            background: 'transparent'
                        } }}
                        value={sex}
                        setValue={setSex}
                        list={config.constants.genderValues}
                        visible={showSexDropDown}
                        showDropDown={() => setShowSexDropDown(true)}
                        onDismiss={() => setShowSexDropDown(false)}
                    />
                </View>
            </View>
            </View>
            <View style={{ marginHorizontal: 10, flexDirection: "row", alignContent: "center", justifyContent: "center" }}>
                <Button style={{width: 130}} 
                    mode='contained' 
                    disabled={!isValid} 
                    onPress={() => {
                    let setObj = {
                        firstName: !!firstName ? firstName: undefined,
                        lastName: !!lastName ? lastName: undefined, 
                        height: !!height ? height: undefined, 
                        weight: !!weight ? weight: undefined,
                        age: !!age ? age: undefined,
                        heightUnit: !!heightUnit ? heightUnit: undefined, 
                        weightUnit: !!weightUnit ? weightUnit: undefined,
                        sex: !!sex? sex: undefined
                    }
                    dispatch(updateTempStorage({...setObj}));
                    swiperRef.current.scrollBy(1)
                    }}>NEXT</Button>
            </View>
        </View>
    )
}

function StepTwoScreen({ swiperRef }) {
    let currentProfile = useSelector(state => state.main.auth.profile) || {} ;
    const [physicalFitness, setPhysicalFitness] = useState(currentProfile.physicalFitness || null);
    const [isValid, setIsValid] = useState(false);

    const dispatch = useDispatch();

    const surveyFields = [physicalFitness]
    const validateSurvey = () => {
        for (var surveyField of surveyFields) {
            if (!surveyField) return;
        }
        setIsValid(true);
    }

    useEffect(() => {
        validateSurvey();
    }, surveyFields)

    return (
        <View style={{ flex: 1 }}>
            <View style={{ height: 450}}>
                <View style={{ marginHorizontal: 10 }}>
                    <Title>Step 2: Physical Fitness</Title>
                </View>
                <View style={{ marginHorizontal: 10 }}>
                    <Text>Which physical fitness level best describe you currently?</Text> 
                </View>
                <View style={{ marginHorizontal: 10 }}>
                    {config.constants.physicalFitnessOptions.map((option, index) => <SurveyOptions index={index} setValueFunction={setPhysicalFitness} displayText={option.label} value={option.value} currentValue={physicalFitness}/>)}
                </View>
            </View>
            <View style={{ marginHorizontal: 10, flexDirection: "row", alignContent: "center", justifyContent: "center" }}>
                <Button 
                    style={{marginHorizontal: 5, width: 130}} 
                    mode="contained"
                    onPress={() => swiperRef.current.scrollBy(-1)}
                >PREVIOUS</Button>
                <Button 
                    disabled={!isValid} 
                    style={{ marginHorizontal: 5, width: 130 }} 
                    mode="contained"
                    onPress={() => {
                        let setObj = {
                            physicalFitness: !!physicalFitness ? physicalFitness : undefined
                        }
                        dispatch(updateTempStorage({...setObj}));
                        swiperRef.current.scrollBy(1);
                    }}
                >NEXT</Button>
            </View>
        </View>
    )
}

function MultipleChoiceChip({ index, option, selectedElements, setValueFunction }) {

    const [selected, setSelected] = useState(selectedElements.includes(option.value));
    const handleChipSelection = (props) => {
        let {
            item,
            selectedElements,
            setValueFunction
        } = props;

        let newSelectedElements = selectedElements || [];
        if (selectedElements.includes(item.value)) {
            // remove
            // newSelectedElements = newSelectedElements.filter(el => el != item.value);
            setValueFunction(selectedElements.filter(el => el != item.value))
        } else {
            // add
            setValueFunction([...selectedElements, item.value]);
            // newSelectedElements.push(item.value);
        }
        // setValueFunction(newSelectedElements);
    }

    return (
        <Chip 
            key={index}
            mode="flat"
            style={{ marginHorizontal: 3, marginTop: 2, marginBottom: 3 }}
            onPress={() => {
                setSelected(selected => !selected); 
                handleChipSelection({ item: option, selectedElements, setValueFunction})}} 
            selected={selected}
            >
                {option.label}
        </Chip>
    )
}

function StepThreeScreen({ swiperRef }) {
    let currentProfile = useSelector(state => state.main.auth.profile) || {} ;
    const [dayPerWeek, setDayPerWeek] = useState(currentProfile.dayPerWeek || null);
    const [minutePerSession, setMinutePerDay] = useState(currentProfile.minutePerSession || null);
    const [isValid, setIsValid] = useState(false);
    const [showDayDropdown, setShowDayDropdown] = useState(false);
    const [showMinuteDropdown, setShowMinuteDropdown] = useState(false);

    const dispatch = useDispatch();

    const surveyFields = [dayPerWeek, minutePerSession];
    const validateSurvey = () => {
        for (var surveyField of surveyFields) {
            if (!surveyField) return;
        }
        setIsValid(true);
    }

    useEffect(() => {
        validateSurvey();
    }, surveyFields)

    return (
        <View style={{ flex: 1 }}>
            <View style={{ height: 450}}>
                <View style={{ marginHorizontal: 10 }}>
                    <Title>Step 3: Exercise Schedule</Title>
                </View>
                <View style={{ marginHorizontal: 10 }}>
                    <Text>We can help you create a customized exercise plan, but for that we need to know how often you are planning to exercise.</Text> 
                </View>
                <View style={{ marginHorizontal: 10 }}>
                    <DropDown
                        label={'Days per week'}
                        mode={'flat'}
                        value={dayPerWeek}
                        setValue={setDayPerWeek}
                        list={config.constants.exerciseDayPerWeek}
                        visible={showDayDropdown}
                        showDropDown={() => setShowDayDropdown(true)}
                        onDismiss={() => setShowDayDropdown(false)}
                    />
                    <DropDown
                        label={'Minutes per day'}
                        mode={'flat'}
                        theme={{ colors: { 
                            background: 'transparent'
                        } }}
                        value={minutePerSession}
                        setValue={setMinutePerDay}
                        list={config.constants.exerciseMinutePerDay}
                        visible={showMinuteDropdown}
                        showDropDown={() => setShowMinuteDropdown(true)}
                        onDismiss={() => setShowMinuteDropdown(false)}
                    />
                </View>
            </View>
            <View style={{ marginHorizontal: 10, flexDirection: "row", alignContent: "center", justifyContent: "center" }}>
                <Button 
                    style={{marginHorizontal: 5, width: 130}} 
                    mode="contained"
                    onPress={() => swiperRef.current.scrollBy(-1)}
                >PREVIOUS</Button>
                <Button 
                    disabled={!isValid} 
                    style={{ marginHorizontal: 5, width: 130 }} 
                    mode="contained"
                    onPress={() => {
                        let setObj = {
                            dayPerWeek: !!dayPerWeek ? dayPerWeek : undefined,
                            minutePerSession: !!minutePerSession ? minutePerSession : undefined,
                        }
                        dispatch(updateTempStorage({...setObj}));
                        swiperRef.current.scrollBy(1);
                    }}
                >NEXT</Button>
            </View>
        </View>
    )
}

function StepFourScreen({ navigation, swiperRef }) {

    let currentProfile = useSelector(state => state.main.auth.profile) || {} ;

    const [isValid, setIsValid] = useState(false);
    const [alert, setAlert] = useState('');
    const [visible, setVisible] = useState(false);
    const [dietHabit, setDietHabit] = useState(currentProfile.dietHabit || '');
    const [dietRestrictions, setDietRestrictions] = useState(currentProfile.dietRestrictions || []);
    const [foodAllergies, setFoodAllergies] = useState(currentProfile.foodAllergies || []);
    const dispatch = useDispatch();

    let user = useSelector(state => state.main.auth.user);
    let tempProfile = useSelector(state => state.main.profile) || {} ;
    
    const surveyFields = [dietHabit]
    const validateSurvey = () => {
        for (var surveyField of surveyFields) {
            if (!surveyField) return;
        }
        setIsValid(true);
    }

    useEffect(() => {
        validateSurvey();
    }, surveyFields);
 
    return (
        <View style={{ flex: 1 }}>
            <View style={{ height: 420 }}>
                <View style={{ marginHorizontal: 10 }}>
                    <Title>Step 4: Diet Preferences</Title>
                </View>
                <View style={{ marginHorizontal: 10 }}>
                    <Text>Body goal</Text> 
                </View>
                <View style={{ marginHorizontal: 10, marginBottom: 10 }}>
                    {config.constants.dietHabitOptions.map((option, index) => <SurveyOptions index={index} setValueFunction={setDietHabit} displayText={option.label} value={option.value} currentValue={dietHabit} />)}
                </View>
                <View style={{ marginHorizontal: 10 }}>
                    <Text>Diet Restrictions</Text>
                </View>
                <View style={{ marginHorizontal: 10, marginBottom: 5, flexWrap: 'wrap', flexDirection: 'row' }}>
                    {config.constants.dietRestrictions.map((option, index) => <MultipleChoiceChip key={index} index={index} option={option} selectedElements={dietRestrictions} setValueFunction={setDietRestrictions} />)}
                </View>
                <View style={{ marginHorizontal: 10 }}>
                    <Text>Food Allergies</Text>
                </View>
                <View style={{ marginHorizontal: 10, marginBottom: 5, flexWrap: 'wrap', flexDirection: 'row' }}>
                    {config.constants.foodAllergies.map((option, index) => <MultipleChoiceChip key={index} index={index} option={option} selectedElements={foodAllergies} setValueFunction={setFoodAllergies} />)}
                </View>

            </View>
            <View style={{ marginHorizontal: 10, flexDirection: "row", alignContent: "center", justifyContent: "center" }}>
                <Button 
                    style={{marginHorizontal: 5, width: 130}} 
                    mode="contained"
                    onPress={() => swiperRef.current.scrollBy(-1)}
                
                >PREVIOUS</Button>
                <Button
                    disabled={!isValid}
                    style={{ marginHorizontal: 5, width: 130 }} 
                    mode="contained"
                    onPress={() => {
                        const conflictingOptions = ['vegetarian', 'meat'];
                        let setObj = {
                            dietHabit: !!dietHabit ? dietHabit : undefined,
                            dietRestrictions: !!dietRestrictions ? conflictingOptions.every(co => dietRestrictions.includes(co)) ? dietRestrictions.filter(el => !conflictingOptions.includes(el)) : dietRestrictions : undefined,
                            foodAllergies: foodAllergies || undefined,
                        }
                        // dispatch(updateTempStorage({...setObj}));
                        setAlert('Your profile has been updated')
                        setVisible(true);
                        const userFireBaseProfileRef = Firebase.database().ref(`/users/${user.uid}/profile`);
                        userFireBaseProfileRef.set({
                            ...tempProfile,
                            ...setObj
                        });
                        dispatch(saveProfileToReducer({ profile: { ...tempProfile, ...setObj }}));
                        dispatch(clearTempStorage());
                        setTimeout(() => {
                            navigation.goBack();
                        }, 1000)
                    }}
                >SAVE</Button>
            </View>
            <Snackbar visible={visible} onDismiss={() => setVisible(false)} duration={3000}>{alert}</Snackbar>
        </View>
    )
}

// MAIN
export default function EntranceSurveyScreen({ navigation }) {
    const [currentPage, setCurrentPage] = useState(0);

    const swiperRef = useRef(null);

    let user = useSelector(state => state.main.auth.user) || {};
    let tempProfile = useSelector(state => state.main.auth.profile);

    const PAGES = [
        <StepOneScreen key={`PAGE-0`} navigation={navigation} swiperRef={swiperRef} />, 
        <StepTwoScreen key={`PAGE-1`} navigation={navigation} swiperRef={swiperRef} />, 
        <StepThreeScreen key={`PAGE-2`} navigation={navigation} swiperRef={swiperRef} />, 
        <StepFourScreen key={`PAGE-3`} navigation={navigation} swiperRef={swiperRef} />
    ];

    if (!user) {
        return (<LoadingScreen />)
    } else {
    return (
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
            {/* <View style={{flex: 1}}> */}
            <View style={styles.backgroundContainer}>
                <ImageBackground 
                source={BackgroundImage} 
                style={styles.bakcgroundImage}
                blurRadius={10}
                >
                </ImageBackground>
            </View>
            {tempProfile &&             
            <Button 
                icon="close" 
                style={{ position: 'absolute', top:20, right:0, color: 'white' }}
                onPress={() => navigation.goBack()}>CLOSE
            </Button>}
            <View style={{ padding: 20, marginTop: 50, justifyContent: 'center', flex: 1 }}>
                <Text style={{ fontWeight: '700' }}>Set up your profile for a better user experience! </Text>
            </View>
            <Swiper
                ref={swiperRef}
                style={{ height: 530 }}
                loop={false}
                index={currentPage}
                autoplay={false}
                showsButtons={false}
                scrollEnabled={false}
                onIndexChanged={(page) => {
                setCurrentPage(page);
                }}
            >
                {PAGES.map((page) => (page))}
            </Swiper>
        </ScrollView>
    )
    }
}

const styles = StyleSheet.create({
    inputStyle: {
        flex: 1,
        marginHorizontal: 10
    },
    btnStyle: {
        margin: 10,
        alignSelf: "center"
    },
    backgroundContainer: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    bakcgroundImage: {
        flex: 1, 
        width: null, 
        height: null,
        opacity: 0.2
    },
})