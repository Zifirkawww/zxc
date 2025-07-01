// DOM елементи для роботи з вправами
const exercisesList = document.getElementById('exercises-list');
let addExerciseBtn;
let addExerciseModal;
let saveExerciseBtn;

// Ініціалізація елементів після завантаження DOM
document.addEventListener('DOMContentLoaded', () => {
    addExerciseBtn = document.getElementById('add-exercise-btn');
    saveExerciseBtn = document.getElementById('save-exercise-btn');
    const updateExerciseBtn = document.getElementById('update-exercise-btn');

    // Ініціалізація модальних вікон
    const addModalElement = document.getElementById('add-exercise-modal');
    if (addModalElement) {
        addExerciseModal = new bootstrap.Modal(addModalElement);
    }

    // Додавання обробників подій
    if (addExerciseBtn) {
        addExerciseBtn.addEventListener('click', () => {
            // Відкриття модального вікна
            addExerciseModal.show();
        });
    }

    // Додавання обробника для кнопки збереження результату
    if (saveExerciseBtn) {
        saveExerciseBtn.addEventListener('click', addExercise);
    }

    // Додавання обробника для кнопки оновлення результату
    if (updateExerciseBtn) {
        updateExerciseBtn.addEventListener('click', updateExercise);
    }

    // Додавання обробників подій для полів підрозділу (додавання)
    const battalionSelect = document.getElementById('battalion');
    const companySelect = document.getElementById('company');
    const platoonSelect = document.getElementById('platoon');

    if (battalionSelect && companySelect && platoonSelect) {
        battalionSelect.addEventListener('change', updateUnitField);
        companySelect.addEventListener('change', updateUnitField);
        platoonSelect.addEventListener('change', updateUnitField);
    }

    // Додавання обробників подій для полів підрозділу (редагування)
    const editBattalionSelect = document.getElementById('edit-battalion');
    const editCompanySelect = document.getElementById('edit-company');
    const editPlatoonSelect = document.getElementById('edit-platoon');

    if (editBattalionSelect && editCompanySelect && editPlatoonSelect) {
        editBattalionSelect.addEventListener('change', updateEditUnitField);
        editCompanySelect.addEventListener('change', updateEditUnitField);
        editPlatoonSelect.addEventListener('change', updateEditUnitField);
    }
});

// Завантаження результатів вправ
async function loadExercises() {
    console.log('Завантаження результатів вправ...');
    try {
        const response = await fetch('/api/exercises', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            credentials: 'include'
        });

        if (response.ok) {
            const exercises = await response.json();
            console.log('Отримано результатів:', exercises.length);
            displayExercises(exercises);
        } else {
            console.error('Помилка завантаження даних');
        }
    } catch (error) {
        console.error('Помилка завантаження даних:', error);
    }
}

// Відображення результатів вправ
function displayExercises(exercises) {
    console.log('Відображення результатів вправ...');
    exercisesList.innerHTML = '';

    if (!exercises || exercises.length === 0) {
        console.log('Немає результатів для відображення');
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = '<td colspan="7" class="text-center">Немає результатів для відображення</td>';
        exercisesList.appendChild(emptyRow);
        return;
    }

    exercises.forEach(exercise => {
        const row = document.createElement('tr');

        // Форматування дати
        const date = new Date(exercise.date);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;

        row.innerHTML = `
            <td>${exercise.soldierName}</td>
            <td>${exercise.rank}</td>
            <td>${exercise.unit}</td>
            <td>${exercise.exerciseType}</td>
            <td>${exercise.result}</td>
            <td>${formattedDate}</td>
        `;

        // Додавання кнопок редагування/видалення для адміністратора
        if (currentUser && currentUser.role === 'admin') {
            const actionsCell = document.createElement('td');
            actionsCell.innerHTML = `
                <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${exercise._id}">
                    Редагувати
                </button>
                <button class="btn btn-sm btn-outline-danger delete-btn ms-2" data-id="${exercise._id}">
                    Видалити
                </button>
            `;
            row.appendChild(actionsCell);

            // Додавання обробників подій для кнопок
            const editBtn = actionsCell.querySelector('.edit-btn');
            const deleteBtn = actionsCell.querySelector('.delete-btn');

            editBtn.addEventListener('click', () => editExercise(exercise._id));
            deleteBtn.addEventListener('click', () => deleteExercise(exercise._id));
        }

        exercisesList.appendChild(row);
    });
}

// Видалення результату вправи
async function deleteExercise(id) {
    if (!confirm('Ви впевнені, що хочете видалити цей результат?')) {
        return;
    }

    try {
        const response = await fetch(`/api/exercises/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            credentials: 'include'
        });

        if (response.ok) {
            showSuccessMessage('Результат успішно видалено');
            loadExercises(); // Перезавантаження даних
        } else {
            const data = await response.json();
            showErrorMessage(data.message || 'Помилка видалення');
        }
    } catch (error) {
        showErrorMessage('Помилка зєднання з сервером');
        console.error('Помилка видалення:', error);
    }
}

// Редагування результату вправи
async function editExercise(id) {
    try {
        // Отримання даних про вправу з сервера
        const response = await fetch(`/api/exercises/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            credentials: 'include'
        });

        if (response.ok) {
            const exercise = await response.json();

            // Заповнення форми даними
            document.getElementById('edit-exercise-id').value = exercise._id;
            document.getElementById('edit-soldierName').value = exercise.soldierName;
            document.getElementById('edit-rank').value = exercise.rank;
            document.getElementById('edit-gender').value = exercise.gender;
            document.getElementById('edit-exerciseType').value = exercise.exerciseType;
            document.getElementById('edit-result').value = exercise.result;
            document.getElementById('edit-notes').value = exercise.notes || '';

            // Розбір підрозділу на складові (батальйон, рота, взвод)
            const unitParts = parseUnitString(exercise.unit);
            if (unitParts) {
                document.getElementById('edit-battalion').value = unitParts.battalion;
                document.getElementById('edit-company').value = unitParts.company;
                document.getElementById('edit-platoon').value = unitParts.platoon;
                document.getElementById('edit-unit').value = exercise.unit;
            }

            // Відкриття модального вікна
            const editModal = new bootstrap.Modal(document.getElementById('edit-exercise-modal'));
            editModal.show();
        } else {
            const data = await response.json();
            showErrorMessage(data.message || 'Помилка отримання даних');
        }
    } catch (error) {
        showErrorMessage('Помилка з\'єднання з сервером');
        console.error('Помилка отримання даних для редагування:', error);
    }
}

// Функція для розбору рядка підрозділу на складові
function parseUnitString(unitString) {
    try {
        // Приклад: "1 батальйон, 2 рота, 3 взвод"
        const parts = unitString.split(',').map(part => part.trim());

        // Отримання номера батальйону
        const battalionMatch = parts[0].match(/(\d+)/);
        const battalion = battalionMatch ? battalionMatch[1] : '';

        // Отримання номера роти
        const companyMatch = parts[1].match(/(\d+)/);
        const company = companyMatch ? companyMatch[1] : '';

        // Отримання номера взводу
        const platoonMatch = parts[2].match(/(\d+)/);
        const platoon = platoonMatch ? platoonMatch[1] : '';

        return { battalion, company, platoon };
    } catch (error) {
        console.error('Помилка розбору рядка підрозділу:', error);
        return null;
    }
}

// Оновлення результату вправи
async function updateExercise() {
    // Отримання ID вправи
    const exerciseId = document.getElementById('edit-exercise-id').value;

    // Отримання даних з форми
    const soldierName = document.getElementById('edit-soldierName').value;
    const rank = document.getElementById('edit-rank').value;
    const gender = document.getElementById('edit-gender').value;

    // Отримання значень підрозділу з трьох окремих полів
    const battalion = document.getElementById('edit-battalion').value;
    const company = document.getElementById('edit-company').value;
    const platoon = document.getElementById('edit-platoon').value;

    // Формування повного значення підрозділу
    const unit = `${battalion} батальйон, ${company} рота, ${platoon} взвод`;

    // Оновлення прихованого поля unit
    document.getElementById('edit-unit').value = unit;

    const exerciseType = document.getElementById('edit-exerciseType').value;
    const result = document.getElementById('edit-result').value;
    const notes = document.getElementById('edit-notes').value;

    // Перевірка обов'язкових полів
    if (!soldierName || !rank || !gender || !battalion || !company || !platoon || !exerciseType || !result) {
        showErrorMessage('Будь ласка, заповніть всі обов\'язкові поля');
        return;
    }

    // Створення об'єкту з даними
    const exerciseData = {
        soldierName,
        rank,
        gender,
        unit,
        exerciseType,
        result,
        notes
    };

    try {
        // Відправка запиту на сервер
        const response = await fetch(`/api/exercises/${exerciseId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(exerciseData),
            credentials: 'include'
        });

        if (response.ok) {
            const updatedExercise = await response.json();
            console.log('Результат успішно оновлено:', updatedExercise);

            // Закриття модального вікна
            const editModal = bootstrap.Modal.getInstance(document.getElementById('edit-exercise-modal'));
            editModal.hide();

            // Відображення повідомлення про успіх
            showSuccessMessage('Результат успішно оновлено');

            // Оновлення списку результатів
            loadExercises();
        } else {
            const data = await response.json();
            showErrorMessage(data.message || 'Помилка оновлення результату');
        }
    } catch (error) {
        showErrorMessage('Помилка з\'єднання з сервером');
        console.error('Помилка оновлення результату:', error);
    }
}

// Функція для додавання нового результату
async function addExercise() {
    // Отримання даних з форми
    const soldierName = document.getElementById('soldierName').value;
    const rank = document.getElementById('rank').value;
    const gender = document.getElementById('gender').value;

    // Отримання значень підрозділу з трьох окремих полів
    const battalion = document.getElementById('battalion').value;
    const company = document.getElementById('company').value;
    const platoon = document.getElementById('platoon').value;

    // Формування повного значення підрозділу
    const unit = `${battalion} батальйон, ${company} рота, ${platoon} взвод`;

    // Оновлення прихованого поля unit
    document.getElementById('unit').value = unit;

    const exerciseType = document.getElementById('exerciseType').value;
    const result = document.getElementById('result').value;
    const notes = document.getElementById('notes').value;

    // Перевірка обов'язкових полів
    if (!soldierName || !rank || !gender || !battalion || !company || !platoon || !exerciseType || !result) {
        showErrorMessage('Будь ласка, заповніть всі обов\'язкові поля');
        return;
    }

    // Створення об'єкту з даними
    const exerciseData = {
        soldierName,
        rank,
        gender,
        unit,
        exerciseType,
        result,
        notes
    };

    try {
        // Відправка запиту на сервер
        const response = await fetch('/api/exercises', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(exerciseData),
            credentials: 'include'
        });

        if (response.ok) {
            const savedExercise = await response.json();
            console.log('Результат успішно додано:', savedExercise);

            // Закриття модального вікна
            addExerciseModal.hide();

            // Очищення форми
            document.getElementById('add-exercise-form').reset();

            // Відображення повідомлення про успіх
            showSuccessMessage('Результат успішно додано');

            // Оновлення списку результатів з невеликою затримкою
            // щоб дати серверу час зберегти новий результат
            setTimeout(() => {
                loadExercises();
            }, 500);
        } else {
            const data = await response.json();
            showErrorMessage(data.message || 'Помилка додавання результату');
        }
    } catch (error) {
        showErrorMessage('Помилка з\'єднання з сервером');
        console.error('Помилка додавання результату:', error);
    }
}

// Функція для оновлення прихованого поля unit (для додавання)
function updateUnitField() {
    const battalion = document.getElementById('battalion').value;
    const company = document.getElementById('company').value;
    const platoon = document.getElementById('platoon').value;

    if (battalion && company && platoon) {
        const unit = `${battalion} батальйон, ${company} рота, ${platoon} взвод`;
        document.getElementById('unit').value = unit;
    }
}

// Функція для оновлення прихованого поля unit (для редагування)
function updateEditUnitField() {
    const battalion = document.getElementById('edit-battalion').value;
    const company = document.getElementById('edit-company').value;
    const platoon = document.getElementById('edit-platoon').value;

    if (battalion && company && platoon) {
        const unit = `${battalion} батальйон, ${company} рота, ${platoon} взвод`;
        document.getElementById('edit-unit').value = unit;
    }
}

// Ці обробники тепер додаються в блоці DOMContentLoaded вище
