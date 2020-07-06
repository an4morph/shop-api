const express = require('express')
const app = express()
const port = 1717
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const defaultData = require('./defaultData')
const adapter = new FileSync('db.json')
const db = low(adapter)
const shorid = require('shortid')

db.defaults(defaultData).write()

app.use(express.json())

app.post('/add-phone', (req, res) => {
  if (!req.body.name) return res.status(400).json("name is required")
  if (req.body.name.length < 3) return res.status(400).json("name is too short")
  const id = shorid.generate()
  db.get('phones').push({ id, ...req.body }).write()
  res.status(200).json('success').end()
})

app.delete('/delete-phone/:id', (req, res) => {
  const id = req.params.id
  const phone = db.get('phones').find({ id }).value()
  if (!phone) return res.status(404).json('phone not found')
  db.get('phones').remove({ id }).write()
  res.status(200).json('success delete').end()
})

app.put('/edit-phone/:id', (req, res) => {
  const id = req.params.id
  const body = req.body
  console.log(id,  body)
  const phone = db.get('phones').find({ id }).value()
  if (!phone) return res.status(404).json('phone not found')
  db.get('phones').find({ id }).assign(body).write()
  res.status(200).json('success update').end()
})

app.get('/phones',  (req, res)  => {
  const phones = db.get('phones')
  res.send(phones)
})

app.get('/phones/:id',  (req, res)  => {
  const id = req.params.id
  const phone = db.get('phones').find({ id }).value()
  if (!phone) return res.status(404).json('phone not found')
  res.send(phone)
})

app.get('/laptops',  (req, res)  => {
  const token = req.get('x-auth')
  const user = db.get('users').find({ token }).value()
  if (!user) return res.status(403).json("access is denied")
  const laptops = db.get('laptops')
  res.send(laptops)
})

app.post('/login', (req, res) => {
  const {username, password} = req.body
  if (!username) return res.status(400).json("username is required")
  if (!password) return res.status(400).json("password is required")
  const user = db.get('users').find({ username, password }).value()
  if (!user) return res.status(404).json("login data is incorrect")
  res.send({ 
    id: user.id, 
    username: user.username, 
    token: user.token, 
  })
})


app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))