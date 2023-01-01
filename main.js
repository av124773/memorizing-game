const GAME_STATE = {
  FirstCardAwaits: "FirstCartAwaits",
  SecondCardAwaits: "SecondCartAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png', // 梅花
]

const model = {
  revealedCards: [],
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 0,
  triedTime: 0,
}
const view = {
  transformNumber (number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  getCardElement (index) {
    return `<div class="card back" data-index="${index}"></div>`
  },
  getCardContent (index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${(number)}</p>
      <img src="${symbol}">
      <p>${(number)}</p>
    `
  },
  flipCards (...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      card.classList.add('back')
      card.innerHTML = null
    })
  },
  pairCards (...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })    
  },
  displayCards (indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join("")
  },
  renderScore (score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },
  renderTriedTimes (triedTime) {
    document.querySelector('.tried').textContent = `You've tried: ${triedTime} times`
  },
  appendWrongAnimation (...card) {
    card.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), {once: true})
    })
  },
  showGameFinished () {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
    <p>Complete!</p>
    <p>Score: ${model.score}</p>
    <p>You've tried: ${model.triedTime} times</p>
    <p class="click-to-restart">Click here to restart</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards () {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  dispatchCardAction (card) {
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTime)
        view.flipCards(card)
        model.revealedCards.push(card)
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          // 配對成功
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log('this.currentState', this.currentState)
    console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  },
  resetCards () {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  },
  restartGame () {
    this.currentState = GAME_STATE.FirstCardAwaits
    model.score = 0
    model.triedTime = 0
    view.renderTriedTimes(model.triedTime)
    view.renderScore(model.score)
    document.querySelector('.completed').remove()
    // document.querySelector('.card').innerHTML = ``
    this.generateCards()
    this.clickedEventListener()
  },
  clickedEventListener() {
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', event => {
        if (controller.currentState === GAME_STATE.CardsMatchFailed) {
          return
        }
        controller.dispatchCardAction(card)
      })
    })
  }
}

const utility = {
  getRandomNumberArray (count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

controller.generateCards()
controller.clickedEventListener()
// document.querySelectorAll('.card').forEach(card => {
//   card.addEventListener('click', event => {
//     if (controller.currentState === GAME_STATE.CardsMatchFailed) {
//       return
//     }
//     controller.dispatchCardAction(card)
//   })
// })

const screen = document.querySelector('html')
screen.addEventListener('click', event => {
  const target = event.target
  if (target.classList.contains('click-to-restart')) {
    console.log('restart')
    controller.restartGame()    
  }
})

