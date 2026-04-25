document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const setupScreen = document.getElementById('setup-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const myLangSelect = document.getElementById('my-language');
    const foreignLangsContainer = document.getElementById('foreign-languages');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const counterDisplay = document.getElementById('counter');
    const activeCardContainer = document.getElementById('active-card-container');
    const leftColumn = document.getElementById('left-column');

    // State
    let myLanguage = 'en';
    let foreignLanguages = [];
    let score = { correct: 0, total: 0 };
    let wordHistory = []; // Stores strings like "group:index"
    const HISTORY_LIMIT = 20;

    // Helper: Pronunciation
    function pronounce(word, langCode) {
        const utterance = new SpeechSynthesisUtterance(word);
        const voices = window.speechSynthesis.getVoices();
        const match = voices.find(v => v.lang.startsWith(langCode));
        
        if (match) {
            utterance.voice = match;
            utterance.lang = match.lang;
        } else {
            utterance.lang = langCode;
        }
        window.speechSynthesis.speak(utterance);
    }

    // Initialization: Populate Languages
    const availableLangs = Object.keys(data.verbs[0]);
    availableLangs.forEach(lang => {
        // My Language Select
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = lang.toUpperCase();
        myLangSelect.appendChild(option);

        // Foreign Language Checkboxes
        const item = document.createElement('label');
        item.className = 'checkbox-item';
        item.innerHTML = `
            <input type="checkbox" value="${lang}">
            <span>${lang.toUpperCase()}</span>
        `;
        foreignLangsContainer.appendChild(item);
    });

    // Default: Hide 'en' checkbox if 'en' is my language
    const updateLanguageCheckboxes = () => {
        const selected = myLangSelect.value;
        const boxes = foreignLangsContainer.querySelectorAll('.checkbox-item');
        boxes.forEach(box => {
            const input = box.querySelector('input');
            if (input.value === selected) {
                box.style.display = 'none';
                input.checked = false;
            } else {
                box.style.display = 'flex';
            }
        });
    };
    myLangSelect.addEventListener('change', updateLanguageCheckboxes);
    updateLanguageCheckboxes();

    // Navigation
    startBtn.addEventListener('click', () => {
        myLanguage = myLangSelect.value;
        foreignLanguages = Array.from(foreignLangsContainer.querySelectorAll('input:checked')).map(i => i.value);

        if (foreignLanguages.length === 0) {
            alert('Select at least one foreign language');
            return;
        }

        score = { correct: 0, total: 0 };
        wordHistory = [];
        updateCounter();
        leftColumn.innerHTML = '';
        activeCardContainer.innerHTML = '';
        
        setupScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');
        
        generateNewCard();
    });

    restartBtn.addEventListener('click', () => {
        quizScreen.classList.add('hidden');
        setupScreen.classList.remove('hidden');
    });

    // Helper: Fisher-Yates Shuffle
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Core Logic
    function updateCounter() {
        counterDisplay.textContent = `${score.correct} / ${score.total}`;
    }

    function generateNewCard() {
        const groups = Object.keys(data);
        let groupName, wordIndex, wordObj;

        // 1. Pick a word not in recent history
        let attempts = 0;
        while (attempts < 100) {
            groupName = groups[Math.floor(Math.random() * groups.length)];
            const group = data[groupName];
            wordIndex = Math.floor(Math.random() * group.length);
            wordObj = group[wordIndex];
            
            const wordId = `${groupName}:${wordIndex}`;
            if (!wordHistory.includes(wordId)) {
                wordHistory.push(wordId);
                if (wordHistory.length > HISTORY_LIMIT) wordHistory.shift();
                break;
            }
            attempts++;
        }

        // 2. Pick foreign language
        const foreignLang = foreignLanguages[Math.floor(Math.random() * foreignLanguages.length)];
        const correctTranslation = wordObj[myLanguage];

        // 3. Generate 6 choices
        let choices = [correctTranslation];

        // 4 from same group
        let sameGroupWords = data[groupName]
            .filter(w => w[myLanguage] !== correctTranslation);
        shuffle(sameGroupWords);
        
        for (let i = 0; i < Math.min(4, sameGroupWords.length); i++) {
            choices.push(sameGroupWords[i][myLanguage]);
        }

        // 1 from another group
        const otherGroups = groups.filter(g => g !== groupName);
        const otherGroupName = otherGroups[Math.floor(Math.random() * otherGroups.length)];
        const otherGroup = data[otherGroupName];
        const otherWord = otherGroup[Math.floor(Math.random() * otherGroup.length)];
        choices.push(otherWord[myLanguage]);

        // Shuffle choices with proper algorithm
        shuffle(choices);

        // 4. Create Card UI
        const card = document.createElement('div');
        card.className = 'card card-entering';
        
        const wordDiv = document.createElement('div');
        wordDiv.className = 'word-container';
        
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        wordSpan.textContent = wordObj[foreignLang];
        
        const speakerIcon = document.createElement('button');
        speakerIcon.className = 'speaker-btn';
        speakerIcon.innerHTML = '🔊';
        speakerIcon.title = 'Pronounce';
        speakerIcon.onclick = (e) => {
            e.stopPropagation();
            pronounce(wordObj[foreignLang], foreignLang);
        };

        wordDiv.appendChild(wordSpan);
        wordDiv.appendChild(speakerIcon);
        card.appendChild(wordDiv);

        const choicesDiv = document.createElement('div');
        choicesDiv.className = 'choices';
        
        choices.forEach(choice => {
            const container = document.createElement('div');
            container.className = 'choice-container';

            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice;
            btn.onclick = () => handleChoice(card, btn, choice === correctTranslation, correctTranslation);
            
            const speakerIcon = document.createElement('button');
            speakerIcon.className = 'speaker-btn choice-speaker';
            speakerIcon.innerHTML = '🔊';
            speakerIcon.onclick = (e) => {
                e.stopPropagation();
                pronounce(choice, myLanguage);
            };

            container.appendChild(btn);
            container.appendChild(speakerIcon);
            choicesDiv.appendChild(container);
        });

        card.appendChild(choicesDiv);
        activeCardContainer.appendChild(card);

        // Trigger animation
        setTimeout(() => {
            card.classList.remove('card-entering');
            card.classList.add('card-active');
        }, 50);
    }

    function handleChoice(card, selectedBtn, isCorrect, correctTranslation) {
        // Disable all buttons in this card
        const buttons = card.querySelectorAll('.choice-btn');
        buttons.forEach(b => b.classList.add('disabled'));

        score.total++;
        if (isCorrect) {
            score.correct++;
            card.classList.add('correct');
            selectedBtn.classList.add('selected-correct');
        } else {
            card.classList.add('incorrect');
            selectedBtn.classList.add('selected-incorrect');
            // Show hint
            buttons.forEach(b => {
                if (b.textContent === correctTranslation) {
                    b.classList.add('hint-correct');
                }
            });
        }
        updateCounter();

        // Move cards
        setTimeout(() => {
            // Move current to left
            leftColumn.innerHTML = '';
            const cardRect = card.getBoundingClientRect();
            
            // We want to animate the move. Since it's fixed 3 columns, we can just move it.
            // Simplified: remove from active, put in left.
            card.classList.remove('card-active');
            card.classList.add('card-exiting');
            
            // In a real app we'd animate the transition between columns, 
            // but for simplicity we'll just move the element.
            leftColumn.appendChild(card);
            
            generateNewCard();
        }, 1000);
    }
});
