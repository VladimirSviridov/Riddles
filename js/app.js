"use strict";

/**
 * Создаем класс, который принимает API и берет елмент в котором будет рендериться
 * В свойства помещаем все элементы, такие как элементы разметки, вопросов и ответов
 * Сразу же вызываем _fetch, который вызовет API и заолнит свойства. Своего рода хуки "BeforeCreated"
 */
class Quiz {
  constructor(api, container = ".quiz") {
    this.title = "";
    this.img = "";
    this.lead = "";
    this.questions = [];
    this.totalQuestions = 0;
    this.results = [];
    this.possibleAnswers = ["a", "b", "c", "d"];
    this.currentQuestion = 0;
    this.correctAnswers = 0;
    this.container = document.querySelector(`${container}`);
    this._fetch(api);
  }

  /**
   * Вызов _fetch, наполнение совйств, инициализация
   * @param api
   * @returns {Promise<any>}
   * @private
   */
  _fetch(api) {
    return fetch(api)
      .then((response) => response.json())
      .then((response) => {
        this.title = response.title;
        this.img = response.img;
        this.lead = response.lead;
        this.questions = response.questions;
        this.totalQuestions = response.questions.length;
        this.results = response.results;
      })
      .then(() => {
        //Инициализация первой загадки
        this._init(this.questions[this.currentQuestion]);
      })
      .catch((error) => {
        //Выводим в консоль загадку, если таковая будет
        console.log(error);
      });
  }

  /**
   * Иницаилизация загадки: сначала рендерим, затем считываем по слику ответ
   * Вызываем приватный метод проверки ответа и делаем следующий ход
   * @param questionNumber
   * @private
   */
  _init(questionNumber) {
    this._render(questionNumber);
    document.querySelector(".question").addEventListener("click", (event) => {
      let currentAnswer = event.target.dataset.id;
      //Чтобы исключить попадание непредвиденных ответов перед вызовом проверки правильности ответа
      //проверяем чтобы вариант был среди существующих
      if (this.possibleAnswers.includes(currentAnswer)
      ) {
        this._checkCorrectAnswer(currentAnswer);
        this._turnNext();
      }
    });
  }

  //Сначала првоеряем, чтобы номер загадки не превышал максимальное число загадок,
  //если превышаем - вызываем результат
  //если не рпевышает - увеличиваем на 1 и инициализируем следующую загадку
  _turnNext() {
    if (this.currentQuestion >= this.questions.length - 1) {
      this._showResult();
      return;
    }
    this.currentQuestion++;
    this._init(this.questions[this.currentQuestion]);
  }

  //Проверяем ответ на рпавильность, если правильно, то уверичиваем счетчик
  _checkCorrectAnswer(answer) {
    if (
      answer === this.questions[this.currentQuestion].correctAnswer.toLowerCase()
    ) {
      this.correctAnswers++;
    }
  }

  //Рендер загадки
  _render(question) {
    let block = `
       <h1 class="quiz__title">${this.title}</h1>
      <img
        class="quiz__image"
        src="${this.img}"
        alt="quiz-image"
      />
      <p class="quiz__lead">${this.lead}</p>
      <section class="question">
        <p class="question__count"> ${this.currentQuestion + 1} из ${this.totalQuestions}</p>
        <h2 class="question__title">${question.question}</h2>
        <div class="question__answer" data-id="a">
          <span class="order">A</span>${question.answerA}
        </div>
        <div class="question__answer" data-id="b">
          <span class="order">B</span>${question.answerB}
        </div>
        <div class="question__answer" data-id="c">
          <span class="order">C</span>${question.answerC}
        </div>
        <div class="question__answer" data-id="d">
          <span class="order">D</span>${question.answerD}
        </div>
      </section>
      `;
    //Очищаем контейнер и вставляем отрендеренную загадку
    this.container.innerHTML = '';
    this.container.insertAdjacentHTML("afterbegin", block);
  }

  //Выбираем вариант позодравления пользователя и выставляем загадку
  _showResult() {
    let resultStatement;
    if (this.correctAnswers === 0) {
      resultStatement = this.results[0];
    }
    if (this.correctAnswers <= 4 && this.correctAnswers > 0) {
      resultStatement = this.results[1];
    }
    if (this.correctAnswers === 5) {
      resultStatement = this.results[2];
    }
    let block = `
      <div class="result">
        <img
          src="${this.img}"
          alt="result image"
        />
        <div class="result__text">
          <h1>${resultStatement}</h1>
          <p>Ваш результат: ${this.correctAnswers}</p>
          <p class="reload">Попробовать еще раз</p>
        </div>
      </div>
      `;
    //Очищаем выбранный контейнер и вставляем поздравление
    document.querySelector("section").innerHTML = "";
    document.querySelector("section").insertAdjacentHTML("afterbegin", block);
    //Перезагружаем, если пользователь хочет ещё
    let reload = document.querySelector(".reload");
    reload.addEventListener("click", (event) => {
      new Quiz(API);
    });
  }
}

new Quiz(API);
