module.exports = {
    constants: {
        days: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
        midnight: {
            startAt: 0,
            endAt: 6
        },
        morning: {
            startAt: 6,
            endAt: 11
        },
        afternoon: {
            startAt: 11,
            endAt: 15
        },
        evening: {
            startAt: 15,
            endAt: 18
        },
        night: {
            startAt: 18,
            endAt: 24
        },
        heightUnits: [{
            label: 'cm', 
            value: 'cm'
        }, {
            label: 'inches', 
            value: 'inches'
        }],
        weightUnits: [{
            label: 'kg',
            value: 'kg'
        }, {
            label: 'lbs', 
            value: 'lbs'
        }],
        genderValues: [{
            label: 'Male',
            value: 'M',
        }, {
            label: 'Female',
            value: 'F',
        }],
        physicalFitnessOptions: [
            {
                label: 'Poor (I almost never exercise)',
                value: 'poor'
            },
            {
                label: 'Below average (I seldom exercise, around once or twice a month)',
                value: 'below'
            },
            {
                label: 'Average (I exercise somewhat regularly, around once a week)',
                value: 'average'
            },
            {
                label: 'Above average (I exercise regularly, more than once a week)',
                value: 'above'
            },
            {
                label: 'Excellent (I have intense exercise regularly, more than once a week)',
                value: 'excellent'
            }
        ],
        exerciseDayPerWeek: [
            { label: '1', value: 1 },
            { label: '2', value: 2 },
            { label: '3', value: 3 },
            { label: '4', value: 4 },
            { label: '5', value: 5 }
        ],
        exerciseMinutePerDay: [
            { label: '15', value: 15 },
            { label: '30', value: 30 },
            { label: '45', value: 45 },
            { label: '60', value: 60 },
        ],
        dietHabitOptions: [
            {
                label: 'Lose Weight',
                value: 'loseWeight',
            },
            {
                label: 'Stay in Shape',
                value: 'stayInShape',
            },
            {
                label: 'Gain Muscles',
                value: 'gainMuscles',
            }
        ],
        dietRestrictions: [
            {
                label: 'Vegetarian',
                value: 'vegetarian',
                disableIfSelected: ['meat']
            },
            {
                label: 'Meat Lover',
                value: 'meat',
                disableIfSelected: ['vegetarian']
            },
            {
                label: 'No Fasting',
                value: 'noFasting',
            }
        ],
        foodAllergies: [
            {
                label: 'Lactose Intolerant',
                value: 'lactose',
            },
            {
                label: 'Nuts',
                value: 'nuts',
            },
            {
                label: 'Seafood',
                value: 'seafood',
            }
        ]
    },
    messages: {
        diet: [
            {
                time: `midnight`,
                meal: `breakfast`,
                startAt: 0,
                endAt: 6,
                title: ``,
                message: `Time for a good-night sleep and prepare for the amazing journey tomorrow!`,
                typeQueryForSpoonacular: `bread,breakfast,appetizer`,
                weight: 0.25
            },
            {
                time: `morning`,
                meal: `breakfast`,
                startAt: 6,
                endAt: 11,
                title: `Good morning!`,
                message: `We got you. It's time for a nice breakfast!`,
                typeQueryForSpoonacular: `bread,breakfast`,
                weight: 0.25
            },
            {
                time: `afternoon`,
                meal: `lunch`,
                startAt: 11,
                endAt: 14,
                title: `Yay! Lunch time!`,
                message: `Just treat yourself better!`,
                typeQueryForSpoonacular: `lunch,main course`,
                weight: 0.3,
            },
            {
                time: `evening`,
                meal: `snack`,
                startAt: 14,
                endAt: 18,
                title: `Tea time!`,
                message: `Grab a snack if you feel like having one.`,
                typeQueryForSpoonacular: `bread,snack,appetizer,side dish,fingerfood,salad,beverage,soup`,
                weight: 0.2
            },
            {
                time: `night`,
                meal: `dinner`,
                startAt: 18,
                endAt: 24,
                title: `Dinner's ready!`,
                message: `Feel like a feast? Or planning to go clean?`,
                typeQueryForSpoonacular: `dinner,main course`,
                weight: 0.35
            }
        ]
    },
    palValueMap: {
        'poor': 1.4,
        'below': 1.4,
        'average': 1.6,
        'above': 1.6,
        'excellent': 1.8
    },
    nutritionPerGramToKcal: {
        'protein': 4,
        'carb': 4,
        'fat': 9
    },
    nutritionDailyRecommendedRange: {
        'protein': {
            min: 0.1,
            max: 0.35
        },
        'carb': {
            min: 0.45,
            max: 0.65
        },
        'fat': {
            min: 0.2,
            max: 0.35
        }
    },
    referenceNuritionValues: {
        1.4: {
            6: {
                M: 1500,
                F: 1500
            },
            11: {
                M: 2300,
                F: 1600
            },
            15: {
                M: 2600,
                F: 2000
            },
            19: {
                M: 2400,
                F: 1900
            },
            25: {
                M: 2300,
                F: 1800
            }, 
            51: {
                M: 2200,
                F: 1700
            },
            65: {
                M: 2100,
                F: 1600
            }
        }, 
        1.6: {
            6: {
                M: 1600,
                F: 1600
            },
            11: {
                M: 2400,
                F: 1800
            },
            15: {
                M: 3000,
                F: 2300
            },
            19: {
                M: 2800,
                F: 2200
            },
            25: {
                M: 2700,
                F: 2100
            }, 
            51: {
                M: 2500,
                F: 2000
            },
            65: {
                M: 2500,
                F: 1900
            }
        },
        1.8: {
            6: {
                M: 1700,
                F: 1700
            },
            11: {
                M: 2500,
                F: 1900
            },
            15: {
                M: 3400,
                F: 2600
            },
            19: {
                M: 3100,
                F: 2500
            },
            25: {
                M: 3000,
                F: 2400
            }, 
            51: {
                M: 2800,
                F: 2300
            },
            65: {
                M: 2800,
                F: 2200
            }
        }
    },
    defaultExercisePlan: {
        "fri": {
            "level": 4,
            "name": "Arm workout",
            "sequence": [{
              "length": 20,
              "type": "Push up"
            }, {
              "length": 30,
              "type": "Squat"
            }],
            "time": 20,
            "type": "workout"
          },
          "mon": {
            "level": 4,
            "name": "Arm workout",
            "sequence": [{
              "length": 20,
              "type": "Push up"
            }, {
              "length": 30,
              "type": "Squat"
            }, {
              "length": 30,
              "type": "Plank"
            }],
            "time": 20,
            "type": "workout"
          },
          "sat": {
            "level": 4,
            "name": "Arm workout",
            "sequence": [{
              "length": 20,
              "type": "Push up"
            }, {
              "length": 30,
              "type": "Squat"
            }],
            "time": 20,
            "type": "workout"
          },
          "sun": {
            "level": 4,
            "name": "Arm workout",
            "sequence": [{
              "length": 20,
              "type": "Push up"
            }, {
              "length": 30,
              "type": "Squat"
            }],
            "time": 20,
            "type": "workout"
          },
          "thu": {
            "level": 4,
            "name": "Arm workout",
            "sequence": [{
              "length": 20,
              "type": "Push up"
            }, {
              "length": 30,
              "type": "Squat"
            }],
            "time": 20,
            "type": "workout"
          },
          "tue": {
            "type": "rest"
          },
          "wed": {
            "level": 4,
            "name": "Arm workout",
            "sequence": [{
              "length": 20,
              "type": "Push up"
            }, {
              "length": 30,
              "type": "Squat"
            }],
            "time": 20,
            "type": "workout"
          }
    }
}