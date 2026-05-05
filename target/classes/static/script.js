// --- DOM Elements ---
const roleScreen = document.getElementById('role-screen');
const recruiterScreen = document.getElementById('recruiter-screen');
const studentScreen = document.getElementById('student-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');

// Role Buttons
const roleRecruiterBtn = document.getElementById('role-recruiter-btn');
const roleStudentBtn = document.getElementById('role-student-btn');
const backToHomeBtns = document.querySelectorAll('.back-to-home');

// Recruiter Elements
const createQuizBtn = document.getElementById('create-quiz-btn');
const createQuizSection = document.getElementById('create-quiz-section');
const addQuestionSection = document.getElementById('add-question-section');
const displayQuizCode = document.getElementById('display-quiz-code');
const recruiterMessage = document.getElementById('recruiter-message');
const recruiterError = document.getElementById('recruiter-error');

// Manual Input Fields
const addQuestionBtn = document.getElementById('add-question-btn');
const qTextInput = document.getElementById('q-text');
const qOpt1Input = document.getElementById('q-opt1');
const qOpt2Input = document.getElementById('q-opt2');
const qOpt3Input = document.getElementById('q-opt3');
const qAnswerInput = document.getElementById('q-answer');

// Auto-Generate Fields
const autoGenerateBtn = document.getElementById('auto-generate-btn');
const apiTopicInput = document.getElementById('api-topic');
const apiDifficultyInput = document.getElementById('api-difficulty');
const apiAmountInput = document.getElementById('api-amount');

// Student Elements
const studentCodeInput = document.getElementById('student-code-input');
const startStudentQuizBtn = document.getElementById('start-student-quiz-btn');
const studentErrorMessage = document.getElementById('student-error-message');

// Quiz Elements
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const progressBar = document.getElementById('progress-bar');
const nextBtn = document.getElementById('next-btn');

// Results Elements
const scoreText = document.getElementById('score-text');
const scoreTotalDisplay = document.getElementById('score-total-display');
const scoreMessage = document.getElementById('score-message');

// --- State Variables ---
let currentQuizCode = null;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;

// --- Helper Functions ---
function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

function resetRecruiterForm() {
    qTextInput.value = '';
    qOpt1Input.value = '';
    qOpt2Input.value = '';
    qOpt3Input.value = '';
    qAnswerInput.value = '';
}

function decodeHTMLEntities(text) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}

// --- Navigation Listeners ---
roleRecruiterBtn.addEventListener('click', () => {
    showScreen(recruiterScreen);
    createQuizSection.classList.remove('hidden');
    addQuestionSection.classList.add('hidden');
});

roleStudentBtn.addEventListener('click', () => {
    showScreen(studentScreen);
    studentCodeInput.value = '';
    studentErrorMessage.classList.add('hidden');
});

backToHomeBtns.forEach(btn => {
    btn.addEventListener('click', () => showScreen(roleScreen));
});

// --- Recruiter Flow ---
createQuizBtn.addEventListener('click', async () => {
    try {
        createQuizBtn.innerText = 'Generating...';
        const response = await fetch('/api/quiz', { method: 'POST' });
        const data = await response.json();
        
        currentQuizCode = data.code;
        displayQuizCode.innerText = currentQuizCode;
        
        createQuizSection.classList.add('hidden');
        addQuestionSection.classList.remove('hidden');
        createQuizBtn.innerText = 'Generate New Quiz Code';
        recruiterMessage.classList.add('hidden');
        recruiterError.classList.add('hidden');
        resetRecruiterForm();
    } catch (err) {
        console.error('Error creating quiz', err);
        alert('Failed to connect to the server.');
        createQuizBtn.innerText = 'Generate New Quiz Code';
    }
});

// Manual Add
addQuestionBtn.addEventListener('click', async () => {
    const text = qTextInput.value.trim();
    const opt1 = qOpt1Input.value.trim();
    const opt2 = qOpt2Input.value.trim();
    const opt3 = qOpt3Input.value.trim();
    const ans = qAnswerInput.value;

    if (!text || !opt1 || !opt2 || !opt3 || !ans) {
        alert("Please fill all fields and select the correct option!");
        return;
    }

    const questionData = {
        question: text,
        options: [opt1, opt2, opt3],
        answer: parseInt(ans)
    };

    await postQuestionToBackend(questionData, addQuestionBtn, 'Adding...');
    resetRecruiterForm();
});

// Auto Generate
autoGenerateBtn.addEventListener('click', async () => {
    const topic = apiTopicInput.value;
    const diff = apiDifficultyInput.value;
    const amountStr = apiAmountInput.value;

    if (!topic || !diff || !amountStr) {
        alert("Please select a topic, difficulty, and amount.");
        return;
    }

    let amount = parseInt(amountStr);
    if (amount < 1 || amount > 50) amount = 5;

    try {
        autoGenerateBtn.innerText = 'Fetching...';
        recruiterError.classList.add('hidden');
        recruiterMessage.classList.add('hidden');

        // Fetch from OpenTDB
        const url = `https://opentdb.com/api.php?amount=${amount}&category=${topic}&difficulty=${diff}&type=multiple`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.response_code !== 0 || !data.results || data.results.length === 0) {
            recruiterError.innerText = "Could not find enough questions for this topic/difficulty.";
            recruiterError.classList.remove('hidden');
            autoGenerateBtn.innerText = 'Generate & Add';
            return;
        }

        autoGenerateBtn.innerText = 'Adding...';
        
        let successCount = 0;
        for (const q of data.results) {
            // Options array
            let options = [...q.incorrect_answers];
            // Randomly insert correct answer
            const correctIndex = Math.floor(Math.random() * (options.length + 1));
            options.splice(correctIndex, 0, q.correct_answer);

            // OpenTDB gives us 4 options, we'll keep all 4 or trim to 3? Let's just keep all 4. 
            // The backend handles List<String> smoothly!

            const formattedQ = {
                question: decodeHTMLEntities(q.question),
                options: options.map(decodeHTMLEntities),
                answer: correctIndex
            };

            const success = await postQuestionToBackend(formattedQ, null, null, false);
            if (success) successCount++;
        }

        recruiterMessage.innerText = `Successfully added ${successCount} questions automatically!`;
        recruiterMessage.classList.remove('hidden');
        setTimeout(() => recruiterMessage.classList.add('hidden'), 4000);

    } catch (err) {
        console.error(err);
        recruiterError.innerText = "Failed to fetch from trivia API.";
        recruiterError.classList.remove('hidden');
    } finally {
        autoGenerateBtn.innerText = 'Generate & Add';
    }
});

// Helper to post a single question
async function postQuestionToBackend(questionData, btnElem, loadingText, showSuccessAlert = true) {
    if (btnElem && loadingText) btnElem.innerText = loadingText;
    try {
        const response = await fetch(`/api/quiz/${currentQuizCode}/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(questionData)
        });

        if (response.ok) {
            if (showSuccessAlert) {
                recruiterMessage.innerText = "Question added successfully!";
                recruiterMessage.classList.remove('hidden');
                setTimeout(() => recruiterMessage.classList.add('hidden'), 3000);
            }
            return true;
        } else {
            if (showSuccessAlert) alert("Failed to add question.");
            return false;
        }
    } catch (err) {
        console.error(err);
        if (showSuccessAlert) alert("Error connecting to server.");
        return false;
    } finally {
        if (btnElem) btnElem.innerText = 'Add 1 Question';
    }
}

// --- Student Flow ---
startStudentQuizBtn.addEventListener('click', async () => {
    const code = studentCodeInput.value.trim().toUpperCase();
    if (!code) {
        studentErrorMessage.innerText = "Please enter a valid code.";
        studentErrorMessage.classList.remove('hidden');
        return;
    }

    try {
        startStudentQuizBtn.innerText = 'Loading...';
        studentErrorMessage.classList.add('hidden');
        
        const response = await fetch(`/api/quiz/${code}/questions`);
        const data = await response.json();

        if (response.ok) {
            questions = data;
            startQuiz();
        } else {
            studentErrorMessage.innerText = data.error || "Invalid code.";
            studentErrorMessage.classList.remove('hidden');
        }
    } catch (err) {
        console.error(err);
        studentErrorMessage.innerText = "Error connecting to server.";
        studentErrorMessage.classList.remove('hidden');
    } finally {
        startStudentQuizBtn.innerText = 'Start Quiz';
    }
});

// --- Quiz Logic ---
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    scoreTotalDisplay.innerText = `/ ${questions.length}`;
    loadQuestion();
    showScreen(quizScreen);
}

function updateProgress() {
    const progress = ((currentQuestionIndex) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
}

function loadQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    questionText.innerText = currentQuestion.question;
    optionsContainer.innerHTML = '';
    
    currentQuestion.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.innerText = option;
        button.classList.add('option-btn');
        button.addEventListener('click', () => selectAnswer(index, button));
        optionsContainer.appendChild(button);
    });
    
    nextBtn.classList.add('hidden');
    updateProgress();
}

function selectAnswer(selectedIndex, selectedButton) {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedIndex === currentQuestion.answer;
    
    const allButtons = optionsContainer.querySelectorAll('.option-btn');
    allButtons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === currentQuestion.answer) {
            btn.classList.add('correct');
        }
    });

    if (isCorrect) {
        score++;
    } else {
        selectedButton.classList.add('wrong');
    }

    nextBtn.classList.remove('hidden');
}

nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        showResults();
    }
});

function showResults() {
    progressBar.style.width = '100%';
    showScreen(resultsScreen);
    scoreText.innerText = score;
    
    if (score === questions.length) {
        scoreMessage.innerText = "Perfect score! You are a genius! 🎉";
    } else if (score > 0) {
        scoreMessage.innerText = "Good job! Keep practicing. 👍";
    } else {
        scoreMessage.innerText = "Better luck next time! 😢";
    }
}
