const mongoose = require('mongoose');

const UNITS = ['1 батальйон', '2 батальйон', '3 батальйон', 'Рота', 'Взвод'];
const RANKS = ['Солдат', 'Сержант', 'Старшина', 'Лейтенант', 'Капітан'];

const names = [
    'Іван Іваненко', 'Петро Петренко', 'Олег Коваль', 'Сергій Бондар', 'Андрій Шевченко',
    'Володимир Мельник', 'Дмитро Кравченко', 'Максим Поліщук', 'Олександр Мороз', 'Юрій Савченко',
    'Олена Ковальчук', 'Наталія Шевчук', 'Ірина Бондаренко', 'Світлана Ткаченко', 'Марина Литвин',
    'Тетяна Козак', 'Ганна Павленко', 'Вікторія Романенко', 'Катерина Сидоренко', 'Оксана Гончар'
];

const getRandom = arr => arr[Math.floor(Math.random() * arr.length)];

const data = [];

// Чоловіки: Підтягування, 6х100, Біг 3км
for (let i = 0; i < 10; i++) {
    data.push({
        soldierName: names[i],
        rank: getRandom(RANKS),
        gender: 'ч',
        exerciseType: 'Підтягування',
        result: String(10 + Math.floor(Math.random() * 11)),
        unit: getRandom(UNITS),
        notes: ''
    });
    data.push({
        soldierName: names[i],
        rank: getRandom(RANKS),
        gender: 'ч',
        exerciseType: '6х100',
        result: `${1+Math.floor(Math.random()*2)}:${(10+Math.floor(Math.random()*40)).toString().padStart(2,'0')}`,
        unit: getRandom(UNITS),
        notes: ''
    });
    data.push({
        soldierName: names[i],
        rank: getRandom(RANKS),
        gender: 'ч',
        exerciseType: 'Біг 3км',
        result: `${10+Math.floor(Math.random()*4)}:${(10+Math.floor(Math.random()*50)).toString().padStart(2,'0')}`,
        unit: getRandom(UNITS),
        notes: ''
    });
}
// Жінки: Віджимання, Прес, 4х100, Біг 3км
for (let i = 10; i < 20; i++) {
    data.push({
        soldierName: names[i],
        rank: getRandom(RANKS),
        gender: 'ж',
        exerciseType: 'згибання та розгибання рук в упорі лежачи ',
        result: String(20 + Math.floor(Math.random() * 21)),
        unit: getRandom(UNITS),
        notes: ''
    });
    data.push({
        soldierName: names[i],
        rank: getRandom(RANKS),
        gender: 'ж',
        exerciseType: 'Згинання та розгинання тулубу лежачи ',
        result: String(30 + Math.floor(Math.random() * 31)),
        unit: getRandom(UNITS),
        notes: ''
    });
    data.push({
        soldierName: names[i],
        rank: getRandom(RANKS),
        gender: 'ж',
        exerciseType: '4х100',
        result: `${1+Math.floor(Math.random()*2)}:${(10+Math.floor(Math.random()*40)).toString().padStart(2,'0')}`,
        unit: getRandom(UNITS),
        notes: ''
    });
    data.push({
        soldierName: names[i],
        rank: getRandom(RANKS),
        gender: 'ж',
        exerciseType: 'Біг 3км',
        result: `${12+Math.floor(Math.random()*5)}:${(10+Math.floor(Math.random()*50)).toString().padStart(2,'0')}`,
        unit: getRandom(UNITS),
        notes: ''
    });
}

async function fillTestData() {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await Exercise.deleteMany({});
    await Exercise.insertMany(data);
    console.log('Тестові дані додано!');
    mongoose.disconnect();
}

if (process.env.FILL_TEST_DATA === '1') fillTestData();

const exerciseSchema = new mongoose.Schema({
    soldierName: {
        type: String,
        required: [true, 'Ім\'я військовослужбовця обов\'язкове']
    },
    rank: {
        type: String,
        required: [true, 'Звання обов\'язкове']
    },
    gender: {
        type: String,
        required: [true, 'Стать обов\'язкова'],
        enum: ['ч', 'ж']
    },
    exerciseType: {
        type: String,
        required: [true, 'Тип вправи обов\'язковий'],
        enum: ['Підтягування', 'Біг 3км', 'Віджимання', 'Прес', '6х100', '4х100']
    },
    result: {
        type: String,
        required: [true, 'Результат обов\'язковий']
    },
    unit: {
        type: String,
        required: [true, 'Підрозділ обов\'язковий']
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: String
});

module.exports = mongoose.model('Exercise', exerciseSchema);