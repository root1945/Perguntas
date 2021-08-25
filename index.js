const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const connection = require('./database/database')
const QuestionModel = require('./database/Question')
const Answer = require('./database/answer')

//DataBase
connection
  .authenticate()
  .then(() => {
    console.log('Connection Sucess!')
  })
  .catch((msgError) => {
    console.log(msgError)
  })

//Estou dizendo para o express usar o EJS como VIEW ENGINE...
app.set('view engine', 'ejs')
app.use(express.static('public'))

//Body Parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//Rotas
app.get('/', (req, res) => {
  QuestionModel.findAll({ raw: true, order: [
    ['id', 'DESC'] // ASC = Crescente e DESC = Descrescente
  ] }).then(questions => {
    res.render('index', {
      questions: questions
    })
  })
})

app.get('/charada', (req, res) => {
  res.render('charada')
})

app.post('/save', (req, res) => {
  const titulo = req.body.titulo
  const descricao = req.body.descricao
  QuestionModel.create({
    title: titulo,
    description: descricao
  }).then(() => {
    res.redirect('/')
  })
})

app.get('/charada/:id', (req, res) => {
  const id = req.params.id
  QuestionModel.findOne({
    where: { id: id}
  }).then(question => {
    if(question) {
      Answer.findAll({
        where: {questionId: question.id},
        order:[
          ['id', 'DESC']
        ]
      }).then(answer => {
        res.render('question', {
          question: question,
          answer: answer
        })
      })
    }else{
      res.redirect('/')
    }
  })
})

app.post('/answer', (req, res) => {
  const body = req.body.corpo
  const questionId = req.body.question
  Answer.create({
    body: body,
    questionId: questionId
  }).then(() => {
    res.redirect('/charada/' + questionId)
  })
})

app.listen(3000, () => {
  console.log('Servindo Rodando...')
})