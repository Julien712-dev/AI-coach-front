import config from '~/src/config';
import moment from 'moment';
import { Pedometer } from 'expo-sensors';

export async function computeNutritionValuesAsync({ profile = {}, logs = {} }) {

    let dailyRecommendedCalories = 1600;

    try {
        let {
            age,
            sex,
            dietHabit,
            physicalFitness
        } = profile;

        if ( !age || !sex || !dietHabit ) throw 'invalid_profile';

        let palValue = config.palValueMap[physicalFitness] || 1.4;

        let palValueFromSteps = 1.4, palValueFromWorkouts = 1.4;

        let pedometerAvailable = await Pedometer.isAvailableAsync();
        console.log('async is available: ', pedometerAvailable);

        if (pedometerAvailable) {
            let today = new Date();
            let lastWeek = new Date();
            lastWeek.setDate(today.getDate() -6);
            let { steps } = await Pedometer.getStepCountAsync(lastWeek, today);
            
            let averageSteps = steps/7;
            switch (true) {
                case (averageSteps < 5000): { palValueFromSteps = 1.4; break; }
                case (averageSteps < 10000): { palValueFromSteps = 1.6; break; }
                case (averageSteps > 10000): { palValueFromSteps = 1.8; break; }
            }

            console.log('average steps: ', averageSteps, ' and pal value: ', palValueFromSteps)
        }

        if (!!logs) {
            let workoutsCompleted = 0;
			for (var l in logs) {
				if (l >= moment().add(-6, 'days').format('YYYYMMDD') && l <= moment().format('YYYYMMDD')) {
					if (!!logs[l]['workout']) workoutsCompleted++;
				}
			};

            switch (true) {
                case (workoutsCompleted <= 1): { palValueFromWorkouts = 1.4; break; }
                case (workoutsCompleted <= 3): { palValueFromWorkouts = 1.6; break; }
                case (workoutsCompleted <= 5): { palValueFromWorkouts = 1.8; break; }
            }

            console.log('pal value from workouts: ', palValueFromWorkouts)
        }

        palValue = Math.max(palValue, palValueFromSteps, palValueFromWorkouts);

        console.log('final palValue:', palValue);
        
        // get daily recommended calorie intake
        switch(true) {
            case (age < 19): { dailyRecommendedCalories = config.referenceNuritionValues[palValue][15][sex]; break; };
            case (age < 25): { dailyRecommendedCalories = config.referenceNuritionValues[palValue][19][sex]; break; };
            case (age < 51): { dailyRecommendedCalories = config.referenceNuritionValues[palValue][25][sex]; break; };
            case (age < 65): { dailyRecommendedCalories = config.referenceNuritionValues[palValue][51][sex]; break; };
            default: { dailyRecommendedCalories = config.referenceNuritionValues[palValue][65][sex]; break; };
        }

        switch(dietHabit) {
            case 'loseWeight' : {
                dailyRecommendedCalories -= 550;
                break;
            }
            case 'gainMuscles' : {
                dailyRecommendedCalories += 550;
                break;
            }
            default: break;
        }

        // get calorie & maco range for query search
        let currentTime = new Date();
        let meal = config.messages.diet.find(message => (message.startAt <= moment(currentTime).hour() && message.endAt > moment(currentTime).hour()));

        return {
            dailyRecommendedCalories,
            minimunDailyProteinInGrams: dailyRecommendedCalories * config.nutritionDailyRecommendedRange['protein']['min'] / config.nutritionPerGramToKcal['protein'],
            maximumDailyProteinInGrams: dailyRecommendedCalories * config.nutritionDailyRecommendedRange['protein']['max'] / config.nutritionPerGramToKcal['protein'],
            minimumDailyCarbsInGrams: dailyRecommendedCalories * config.nutritionDailyRecommendedRange['carb']['min'] / config.nutritionPerGramToKcal['carb'],
            maximumDailyCarbsInGrams: dailyRecommendedCalories * config.nutritionDailyRecommendedRange['carb']['max'] / config.nutritionPerGramToKcal['carb'],
            minimumDailyFatsInGrams: dailyRecommendedCalories * config.nutritionDailyRecommendedRange['fat']['min'] / config.nutritionPerGramToKcal['fat'],
            maximumDailyFatsInGrams: dailyRecommendedCalories * config.nutritionDailyRecommendedRange['fat']['max'] / config.nutritionPerGramToKcal['fat'],
        }

    } catch (error) {
        console.log(error);
    }

}

export function computeNutritionValues(profile) {

    let dailyRecommendedCalories = 1600;

    try {
        let {
            age,
            sex,
            dietHabit,
            physicalFitness
        } = profile;

        if ( !age || !sex || !dietHabit ) throw 'invalid_profile';

        let palValue = config.palValueMap[physicalFitness] || 1.4;
        
        // get daily recommended calorie intake
        switch(true) {
            case (age < 19): { dailyRecommendedCalories = config.referenceNuritionValues[palValue][15][sex]; break; };
            case (age < 25): { dailyRecommendedCalories = config.referenceNuritionValues[palValue][19][sex]; break; };
            case (age < 51): { dailyRecommendedCalories = config.referenceNuritionValues[palValue][25][sex]; break; };
            case (age < 65): { dailyRecommendedCalories = config.referenceNuritionValues[palValue][51][sex]; break; };
            default: { dailyRecommendedCalories = config.referenceNuritionValues[palValue][65][sex]; break; };
        }

        switch(dietHabit) {
            case 'loseWeight' : {
                dailyRecommendedCalories -= 550;
                break;
            }
            case 'gainMuscles' : {
                dailyRecommendedCalories += 550;
                break;
            }
            default: break;
        }

        // get calorie & maco range for query search
        let currentTime = new Date();
        let meal = config.messages.diet.find(message => (message.startAt <= moment(currentTime).hour() && message.endAt > moment(currentTime).hour()));

        return {
            dailyRecommendedCalories,
            minimunDailyProteinInGrams: dailyRecommendedCalories * config.nutritionDailyRecommendedRange['protein']['min'] / config.nutritionPerGramToKcal['protein'],
            maximumDailyProteinInGrams: dailyRecommendedCalories * config.nutritionDailyRecommendedRange['protein']['max'] / config.nutritionPerGramToKcal['protein'],
            minimumDailyCarbsInGrams: dailyRecommendedCalories * config.nutritionDailyRecommendedRange['carb']['min'] / config.nutritionPerGramToKcal['carb'],
            maximumDailyCarbsInGrams: dailyRecommendedCalories * config.nutritionDailyRecommendedRange['carb']['max'] / config.nutritionPerGramToKcal['carb'],
            minimumDailyFatsInGrams: dailyRecommendedCalories * config.nutritionDailyRecommendedRange['fat']['min'] / config.nutritionPerGramToKcal['fat'],
            maximumDailyFatsInGrams: dailyRecommendedCalories * config.nutritionDailyRecommendedRange['fat']['max'] / config.nutritionPerGramToKcal['fat'],
        }

    } catch (error) {
        console.log(error);
    }

}

export function getCoachAdvice(profile) {

    let coachAdvice = '';
    try {

        let {
            age,
            sex,
            exerciseHabit,
            dietHabit
        } = profile;

        switch(dietHabit) {
            case 'loseWeight', 'gainMuscles' : {
                coachAdvice += 'Protein is an essential nutrient. You should ensure enough protein intake.'
                break;
            }
            default: {
                coachAdvice += 'To stay in shape, make sure you take all kinds of nutrients evenly.'
                break;
            }
        }

        switch(exerciseHabit) {
            case 'sedentary': {
                if (dietHabit != 'gainMuscles') {
                    coachAdvice += `\nYou activity level is rather low. Avoid eating too much so that you don't gain weight. `;
                }
                break;
            }
            case 'moderate', 'extensive': {
                coachAdvice += `\nDo not skip meals or under eat. You need sufficient energy to maintain your activity.`;
                break;
            }
            default: break;
        }
        
        return coachAdvice;
    } catch (error) {

    }
}