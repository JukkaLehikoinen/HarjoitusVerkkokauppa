//lähtee käyntiin node index.js  ||  npm start
const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const uuid = require('uuid');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())

const fs = require('fs');

let tieto = "";
let tuotteet = require('./tuotteet.json')
let users = require('./users.json')
let userSession = require('./usersession.json')

function deleteOldSessions(date) {
  userSession.filter((user) => (date - user.dateTime) < (60 * 60 * 24 * 1000))
  const save = JSON.stringify(userSession);
  fs.writeFileSync('usersession.json', save);
}

setInterval(() => {
  const date = new Date()
  deleteOldSessions(date)
}, (60 * 60 * 1000));

app.get('/tuotteet', (req, res) => {
  res.json(tuotteet)
})

app.post('/tuotteet', (req, res) => {
  tieto = req.body


  fs.readFile('./usersession.json', function (err, data) {
    if (err) {
      throw err;
    }
    const dataTxt = data.toString()
    const jsonData = JSON.parse(dataTxt);
    console.log(tieto.user)
    const selectedUser = jsonData.filter((user) => user.user.name === tieto.user.name && tieto.id === user.uuid)
    console.log(selectedUser)
    //console.log(jsonData[0].user.cart)
    const newUser = {
      uuid: selectedUser[0].uuid,
      dateTime: selectedUser[0].dateTime,
      user: {
        ...selectedUser[0].user,
        cart: []
      }
    };
    const filteredSession = jsonData.filter((user) => user.uuid !== tieto.id)
    filteredSession.push(newUser);
    const saveSession = JSON.stringify(filteredSession);
    fs.writeFileSync('usersession.json', saveSession);

    tieto.cart.forEach((pro) => {
      tuotteet.forEach((tuote) => {
        if (pro.name === tuote.name) {
          tuote.inStock = tuote.inStock - 1;
        }
      })
    })
    const save = JSON.stringify(tuotteet);
    fs.writeFileSync('tuotteet.json', save);
  })
})

app.get('/users', (req, res) => {
  res.json(users)
  /* tieto = req.body
  if (tieto.type === 'login') {
    let correctUser = 0;
    users.forEach((user) => {
      if (user.name === tieto.username && user.pw === tieto.password) {
        correctUser = user;
      }
    })
    console.log(correctUser)
    if (correctUser === 0) {
      res.json('error')
    } else {
      res.json(correctUser)
    }
  } */
})

app.post('/users', function (req, res) {
  tieto = req.body
  console.log(tieto.type)
  if (tieto.type === 'login') {
    let correctUser = 0;
    users.forEach((user) => {
      if (user.name === tieto.first && user.pw === tieto.second) {
        correctUser = user;
      }
    })
    if (correctUser === 0) {
      res.json('error')
    } else {
      const date = new Date().getTime();
      const findUser = userSession.filter((user) => tieto.uuid === user.uuid && tieto.first === user.user.name &&
        (date - user.dateTime) < (60 * 60 * 24 * 1000));
      // console.log(findUser, 'findUser')
      if (findUser.length > 0) {
        res.json(findUser[0])
      } else {
        const userKey = uuid.v4();
        //res.json(correctUser)
        userSession.push({
          user: {
            ...correctUser,
            cart: []
          }, uuid: userKey, dateTime: date
        })
        const save = JSON.stringify(userSession);
        fs.writeFileSync('usersession.json', save);
        // console.log(userSession)
        res.json({ user: correctUser, uuid: userKey })
      }
    }
  }

  if (tieto.type === 'update') {
    let userIndex = -1;
    let nameIndex = 0;
    users.forEach((user, i) => {
      if (user.name === tieto.second.name) {
        nameIndex = + 1;
      }
      if (user.name === tieto.first.name && user.pw === tieto.first.pw) {
        if (nameIndex > 0) {
          res.json('Käyttäjä on jo olemassa')
        } else {
          userIndex = i;
        }
      }
    });
    if (userIndex > -1 && nameIndex === 0) {
      users[userIndex] = {
        id: tieto.second.id,
        name: tieto.second.name,
        address: tieto.second.address,
        email: tieto.second.email,
        pw: tieto.second.pw,
        sessionId: tieto.second.sessionId
      }
      // console.log(users)
      const save = JSON.stringify(users);
      fs.writeFileSync('users.json', save);
      res.json(true)
    }
  }

  if (tieto.type === 'add') {
    let nameIndex = 0;
    users.forEach((user, i) => {
      if (user.name === tieto.first.name) {
        nameIndex = + 1;
      }
    });
    if (nameIndex > 0) {
      res.json('errorName')
    } else {
      users.push(tieto.first)
      const date = new Date().getTime();
      const userKey = uuid.v4();
      //res.json(correctUser)
      userSession.push({
        user: {
          ...tieto.first,
          cart: []
        }, uuid: userKey, dateTime: date
      })
      const saveSession = JSON.stringify(userSession);
      // console.log(users)
      const saveUsers = JSON.stringify(users);
      fs.writeFileSync('usersession.json', saveSession);
      fs.writeFileSync('users.json', saveUsers);
      res.json({ user: userSession[userSession.length - 1], uuid: userKey })
      // res.json('success')
    }
  }

  if (tieto.type === 'get') {
    fs.readFile('./usersession.json', function (err, data) {
      if (err) {
        throw err;
      }
      const dataTxt = data.toString()
      const jsonData = JSON.parse(dataTxt);
      res.json(jsonData.filter((user) => user.uuid === tieto.uuid))
    });
    //console.log(tieto.type, userSession.filter((user) => user.uuid === tieto.uuid))
    //res.json(userSession.filter((user) => user.uuid === tieto.uuid))
  }

  if (tieto.type === 'addToCart') {
    fs.readFile('./usersession.json', function (err, data) {
      if (err) {
        throw err;
      }
      const dataTxt = data.toString()
      const jsonData = JSON.parse(dataTxt);
      const userData = jsonData.filter((user) => user.uuid === tieto.uuid)
      const sc = userData[0].user.cart;
      sc.push(tieto.first)
      const newData = {
        ...userData[0].user,
        cart: sc
      };
      const newArray = {
        ...userData[0],
        user: newData
      };
      const filteredSession = jsonData.filter((user) => user.uuid !== tieto.uuid)
      filteredSession.push(newArray);
      const saveSession = JSON.stringify(filteredSession);
      fs.writeFileSync('usersession.json', saveSession);
    })
    // res.json(newData)
  }

  if (tieto.type === 'updateCart') {
    fs.readFile('./usersession.json', function (err, data) {
      if (err) {
        throw err;
      }
      const dataTxt = data.toString()
      const jsonData = JSON.parse(dataTxt);
      const userData = jsonData.filter((user) => user.uuid === tieto.uuid)
      const newList = tieto.first;
      const newData = {
        uuid: userData[0].uuid,
        dateTime: userData[0].dateTime,
        user: {
          ...userData[0].user,
          cart: newList
        }
      };
      const filteredSession = jsonData.filter((user) => user.uuid !== tieto.uuid)
      filteredSession.push(newData);
      const saveSession = JSON.stringify(filteredSession);
      fs.writeFileSync('usersession.json', saveSession);
      res.json(filteredSession.filter((user) => user.uuid === tieto.uuid))
    })
  }
});

app.get('/kuvat/1', function (req, res) {
  let contentType = "image/jpg";
  res.writeHead(200, {
    "Content-Type": contentType
  });
  fs.readFile(__dirname + '\\kuva1.jpg',
    function (err, content) {
      // Serving the image
      res.end(content);
    });
})

app.get('/kuvat/2', function (req, res) {
  let contentType = "image/jpg";
  res.writeHead(200, {
    "Content-Type": contentType
  });
  fs.readFile(__dirname + '\\kuva2.jpg',
    function (err, content) {
      // Serving the image
      res.end(content);
    });
})

app.get('/kuvat/3', function (req, res) {
  let contentType = "image/jpg";
  res.writeHead(200, {
    "Content-Type": contentType
  });
  fs.readFile(__dirname + '\\kuva3.jpg',
    function (err, content) {
      // Serving the image
      res.end(content);
    });
})

app.get('/kuvat/4', function (req, res) {
  let contentType = "image/jpg";
  res.writeHead(200, {
    "Content-Type": contentType
  });
  fs.readFile(__dirname + '\\kuva4.jpg',
    function (err, content) {
      // Serving the image
      res.end(content);
    });
})

app.get('/kuvat/5', function (req, res) {
  let contentType = "image/jpg";
  res.writeHead(200, {
    "Content-Type": contentType
  });
  fs.readFile(__dirname + '\\kuva5.jpg',
    function (err, content) {
      // Serving the image
      res.end(content);
    });
})

app.post('/tuotteet', function (req, res) {
  tieto = req.body
  res.json(tieto);
  let data = JSON.stringify(tieto);
  fs.writeFileSync('tuotteet.json', data);
});


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Nyt kuunnellaan porttia ${PORT}`)
})