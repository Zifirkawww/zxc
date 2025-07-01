document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/api/exercises';
    let exercises = [];
    let editId = null; // Додаємо змінну для зберігання id редагування

    // DOM Elements
    const exerciseForm = document.getElementById('exerciseForm');
    const formContainer = document.querySelector('.form-container'); // Додаємо посилання на контейнер форми
    const resultsBody = document.getElementById('resultsBody');
    const searchInput = document.getElementById('searchInput');
    const filterExercise = document.getElementById('filterExercise');
    // Додаємо елементи для керування вкладкою результатів
    const resultsSection = document.getElementById('resultsSection'); // обгортає таблицю та фільтри
    const showResultsBtn = document.getElementById('showResultsBtn');
    // Додаємо елементи для керування вкладкою лідерів
    const leadersSection = document.getElementById('leadersSection');
    const showLeadersBtn = document.getElementById('showLeadersBtn');
    const leadersBody = document.getElementById('leadersBody');
    const leadersTitle = document.getElementById('leadersTitle');
    const filterLeadersExercise = document.getElementById('filterLeadersExercise');
    // Додаємо елемент для керування формою
    const showFormBtn = document.getElementById('showFormBtn');

    // Початково ховаємо секцію результатів
    if (resultsSection) resultsSection.classList.add('hidden');
    // Початково ховаємо секцію лідерів
    if (leadersSection) leadersSection.classList.add('hidden');
    // Початково ховаємо форму
    if (formContainer) formContainer.classList.add('hidden');

    // Додаємо обробник для кнопки показу форми
    if (showFormBtn) {
        showFormBtn.addEventListener('click', () => {
            if (formContainer.classList.contains('hidden')) {
                // Показуємо форму
                formContainer.classList.remove('hidden');
                showFormBtn.textContent = 'Сховати форму';

                // Ховаємо результати, якщо вони відкриті
                if (resultsSection && !resultsSection.classList.contains('hidden')) {
                    resultsSection.classList.add('hidden');
                    if (showResultsBtn) showResultsBtn.textContent = 'Показати результати';
                }

                // Ховаємо лідерів, якщо вони відкриті
                if (leadersSection && !leadersSection.classList.contains('hidden')) {
                    leadersSection.classList.add('hidden');
                    if (showLeadersBtn) showLeadersBtn.textContent = 'ЛІДЕРИ';
                }
            } else {
                // Ховаємо форму
                formContainer.classList.add('hidden');
                showFormBtn.textContent = 'Додати результат';
            }
        });
    }

    if (showResultsBtn) {
        showResultsBtn.addEventListener('click', () => {
            if (resultsSection) {
                if (resultsSection.classList.contains('hidden')) {
                    resultsSection.classList.remove('hidden');
                    loadExercises();
                    showResultsBtn.textContent = 'Сховати результати';

                    // Ховаємо форму
                    if (formContainer) formContainer.classList.add('hidden');
                    // Оновлюємо текст кнопки форми
                    if (showFormBtn) showFormBtn.textContent = 'Додати результат';

                    // Автоматично ховаємо лідерів
                    if (leadersSection && !leadersSection.classList.contains('hidden')) {
                        leadersSection.classList.add('hidden');
                        if (showLeadersBtn) showLeadersBtn.textContent = 'ЛІДЕРИ';
                    }
                } else {
                    resultsSection.classList.add('hidden');
                    showResultsBtn.textContent = 'Показати результати';
                }
            }
        });
    }

    if (showLeadersBtn) {
        showLeadersBtn.addEventListener('click', () => {
            if (leadersSection.classList.contains('hidden')) {
                // Показуємо лідерів і автоматично ховаємо результати
                leadersSection.classList.remove('hidden');
                showLeadersBtn.textContent = 'Сховати лідерів';
                loadLeaders();

                // Ховаємо форму
                if (formContainer) formContainer.classList.add('hidden');
                // Оновлюємо текст кнопки форми
                if (showFormBtn) showFormBtn.textContent = 'Додати результат';

                // Автоматично ховаємо результати
                if (resultsSection && !resultsSection.classList.contains('hidden')) {
                    resultsSection.classList.add('hidden');
                    if (showResultsBtn) showResultsBtn.textContent = 'Показати результати';
                }
            } else {
                leadersSection.classList.add('hidden');
                showLeadersBtn.textContent = 'ЛІДЕРИ';
            }
        });
    }

    // Load exercises
    const loadExercises = async () => {
        try {
            const response = await fetch(API_URL);
            exercises = await response.json();
            renderExercises();
        } catch (error) {
            console.error('Помилка завантаження даних:', error);
            alert('Помилка завантаження даних');
        }
    };

    // Функція для завантаження та відображення лідерів
    const loadLeaders = () => {
        if (!exercises.length) return;

        // Отримуємо значення фільтра
        const filterValue = filterLeadersExercise ? filterLeadersExercise.value : '';

        // Групуємо по типу вправи
        let types = [...new Set(exercises.map(e => e.exerciseType))];

        // Якщо вибрано конкретну вправу, фільтруємо типи
        if (filterValue) {
            types = types.filter(type => type === filterValue);
        }

        let leadersRows = '';
        types.forEach(type => {
            // Для кожного типу вправи беремо топ-10
            const sorted = exercises
                .filter(e => e.exerciseType === type)
                .sort((a, b) => b.result - a.result)
                .slice(0, 10);
            if (sorted.length) {
                leadersRows += `<tr><td colspan="5" style="font-weight:bold;text-align:center;background:#f0f0f0;">${type}</td></tr>`;
                sorted.forEach((e, idx) => {
                    leadersRows += `<tr><td>${idx+1}</td><td>${e.soldierName}</td><td>${e.gender === 'ч' ? 'Чоловік' : 'Жінка'}</td><td>${e.result}</td><td>${e.unit}</td></tr>`;
                });
            }
        });
        leadersBody.innerHTML = leadersRows || '<tr><td colspan="5">Немає даних</td></tr>';
    };

    // Render exercises table
    const renderExercises = () => {
        let filteredExercises = exercises;

        // Apply filters
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = filterExercise.value;

        if (searchTerm) {
            filteredExercises = filteredExercises.filter(exercise => 
                exercise.soldierName.toLowerCase().includes(searchTerm) ||
                exercise.unit.toLowerCase().includes(searchTerm)
            );
        }

        if (filterValue) {
            filteredExercises = filteredExercises.filter(exercise => 
                exercise.exerciseType === filterValue
            );
        }

        resultsBody.innerHTML = filteredExercises.map(exercise => `
            <tr>
                <td>${exercise.soldierName}</td>
                <td>${exercise.rank}</td>
                <td>${exercise.gender === 'ч' ? 'Чоловік' : 'Жінка'}</td>
                <td>${exercise.exerciseType}</td>
                <td>${exercise.result}</td>
                <td>${exercise.unit}</td>
                <td>${new Date(exercise.date).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${exercise._id}">Редагувати</button>
                    <button class="action-btn delete-btn" data-id="${exercise._id}">Видалити</button>
                </td>
            </tr>
        `).join('');
    };

    // Handle form submission
    exerciseForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            soldierName: document.getElementById('soldierName').value,
            rank: document.getElementById('rank').value,
            gender: document.getElementById('gender').value, // Додаємо стать
            exerciseType: document.getElementById('exerciseType').value,
            result: document.getElementById('result').value,
            unit: document.getElementById('unit').value,
            notes: document.getElementById('notes').value
        };

        try {
            let response;
            if (editId) {
                response = await fetch(`${API_URL}/${editId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            }

            if (response.ok) {
                exerciseForm.reset();
                loadExercises();
                const submitBtn = exerciseForm.querySelector('button[type="submit"]');
                submitBtn.textContent = 'Зберегти результат';
                editId = null;
                alert(editId ? 'Результат успішно оновлено' : 'Результат успішно збережено');
            } else {
                throw new Error(editId ? 'Помилка оновлення' : 'Помилка збереження');
            }
        } catch (error) {
            console.error('Помилка:', error);
            alert(editId ? 'Помилка оновлення результату' : 'Помилка збереження результату');
        }
    });

    // Handle delete
    resultsBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Ви впевнені, що хочете видалити цей запис?')) {
                const id = e.target.dataset.id;
                try {
                    const response = await fetch(`${API_URL}/${id}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        loadExercises();
                        alert('Запис успішно видалено');
                    } else {
                        throw new Error('Помилка видалення');
                    }
                } catch (error) {
                    console.error('Помилка:', error);
                    alert('Помилка видалення запису');
                }
            }
        }
    });

    // Handle edit
    resultsBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const id = e.target.dataset.id;
            const exercise = exercises.find(ex => ex._id === id);

            if (exercise) {
                document.getElementById('soldierName').value = exercise.soldierName;
                document.getElementById('rank').value = exercise.rank;
                document.getElementById('exerciseType').value = exercise.exerciseType;
                document.getElementById('result').value = exercise.result;
                document.getElementById('unit').value = exercise.unit;
                document.getElementById('notes').value = exercise.notes || '';
                editId = id;
                const submitBtn = exerciseForm.querySelector('button[type="submit"]');
                submitBtn.textContent = 'Оновити';
            }
        }
    });

    // Handle filters
    searchInput.addEventListener('input', renderExercises);
    filterExercise.addEventListener('change', renderExercises);

    // Handle leaders filter
    if (filterLeadersExercise) {
        filterLeadersExercise.addEventListener('change', loadLeaders);
    }

    // Динамічно змінюємо placeholder для результату залежно від типу вправи
    const resultInput = document.getElementById('result');
    const exerciseTypeInput = document.getElementById('exerciseType');
    if (exerciseTypeInput && resultInput) {
        exerciseTypeInput.addEventListener('change', () => {
            if (exerciseTypeInput.value === 'Біг 3км') {
                resultInput.placeholder = 'Наприклад: 11:26 або 11 хв 26 с';
            } else {
                resultInput.placeholder = 'Введіть результат';
            }
        });
    }

    // Динамічне оновлення вправ залежно від статі
    const genderInput = document.getElementById('gender');
    const EXERCISES = {
        'ч': [
            { value: 'Підтягування', label: 'Підтягування' },
            { value: '6х100', label: '6х100' },
            { value: 'Біг 3км', label: 'Біг 3км' }
        ],
        'ж': [
            { value: 'Віджимання', label: 'Віджимання' },
            { value: 'Прес', label: 'Прес' },
            { value: '4х100', label: '4х100' },
            { value: 'Біг 3км', label: 'Біг 3км' }
        ]
    };
    function updateExerciseOptions() {
        const gender = genderInput.value;
        exerciseTypeInput.innerHTML = '';
        EXERCISES[gender].forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            exerciseTypeInput.appendChild(option);
        });
        // Оновити placeholder для результату
        if (exerciseTypeInput.value === 'Біг 3км') {
            resultInput.placeholder = 'Наприклад: 11:26 або 11 хв 26 с';
        } else {
            resultInput.placeholder = 'Введіть результат';
        }
    }
    if (genderInput && exerciseTypeInput) {
        genderInput.addEventListener('change', updateExerciseOptions);
        exerciseTypeInput.addEventListener('change', () => {
            if (exerciseTypeInput.value === 'Біг 3км') {
                resultInput.placeholder = 'Наприклад: 11:26 або 11 хв 26 с';
            } else {
                resultInput.placeholder = 'Введіть результат';
            }
        });
        updateExerciseOptions(); // ініціалізація при завантаженні
    }

    // Initial load
    loadExercises();
});
