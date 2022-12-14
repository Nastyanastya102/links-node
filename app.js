const express = require('express')
const config = require('config')
const mongoose = require('mongoose')
const path = require('path')
// speсial Object Data Modelling for working with mongoDB
const app = express()
// Future server
const PORT = config.get('port') || 5000

// get config from our config directory
process.on('uncaughtException', (err) => {
  console.log(err)
});

app.use(express.json({ extend: true }))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/link', require('./routes/links'))
app.use('/t/', require('./routes/redirect'))

if (process.env.NODE_ENV === 'production') {
  app.use('/', express.static(path.join(__dirname, 'client', 'build')))

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}
const start = async () => {
  try {
    await mongoose.connect(config.get('mongoUri'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    app.listen(PORT, () => {
      console.log(`App has been started on port ${PORT}`);
    });

    // server started listen por
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start()
