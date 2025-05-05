
var express = require('express');
var path = require('path');

var app = express();
var fs = require('fs');


const session = require('express-session');

app.use(session({
  secret: 'blabla', 
  resave: false,            
  saveUninitialized: true,  
  cookie: { secure: false },
  maxAge: 30*60 * 1000 //so 30 minutes and user needs to re-login 
}));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));



function isAuthenticated(req, res, next) {
  if (req.session.username) {
    return next(); 
  } else {
    return res.redirect('/'); 
  }
}


app.get('/bali',isAuthenticated, function(req, res) {
  res.render('bali',{
    message: ' ',
    messageType: ' ',
  })
});
app.get('/cities',isAuthenticated, function(req, res) {
  res.render('cities')
});
app.get('/hiking',isAuthenticated, function(req, res) {
  res.render('hiking')
});
app.get('/home',isAuthenticated, function(req, res) {
  res.render('home')

});
app.get('/inca',isAuthenticated, function(req, res) {
  res.render('inca',{
    message: ' ',
    messageType: ' ',
  })
});
app.get('/islands',isAuthenticated, function(req, res) {
  res.render('islands')
});
app.get('/paris',isAuthenticated, function(req, res) {
  res.render('paris',{
    message: ' ',
    messageType: ' ',
  })
});


const { MongoClient } = require('mongodb');

const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

// async function addDestToDB() {
//   try {
//     await client.connect();
//     const db = client.db("myDB");
//     const collection = db.collection("myCollection");

//     const destinations = [
//       { destName: "Bali Island", dest: "bali" },
//       { destName: "Paris", dest: "paris" },
//       { destName: "Rome", dest: "rome" },
//       { destName: "Santorini Island", dest: "santorini" },
//       { destName: "Annapurna Circuit", dest: "annapurna" },
//       { destName: "Inca Trail to Machu Picchu", dest: "inca" }
//     ];

//     for (const destination of destinations) {
//       const existingDest = await collection.findOne({ destName: destination.destName });
//       if (!existingDest) {

//         await collection.insertOne(destination);
//         console.log(`Inserted: ${destination.destName}`);
//       }
//     }
//   } catch (err) {
//     console.error("Error adding destinations:", err);
//   }
// }

// addDestToDB();

app.get('/registration', function(req, res) {
  res.render('registration', {
    message: ' ',
    messageType: ' ',
  })
});
app.post('/register', async (req, res) => {
  try {
    await client.connect();
        const db = client.db("myDB"); 
        const collection = db.collection("myCollection"); 

      const { username, password } = req.body;
      if (username.length == 0 || password.length == 0) {
        return res.render('registration', {
          message: 'Please fill all of the fields to register.',
          messageType: 'error',
        });
      }
  
      const existingUser = await collection.findOne({ username: username });
      if (existingUser) {
        return res.render('registration', {
          message: 'This username already exists, please try another one!',
          messageType: 'error',
        });
      }
      else {
          await collection.insertOne({ username: username, password: password });

          res.redirect("/");
          flag = true;
      }
  } catch (err) {
      console.error("Error during registration:", err);
      res.status(500).send('Internal Server Error');
  } 

});

var flag = false;
app.get('/', function(req, res) {
  var msg = flag? 'Registration was successful.': ''
  flag = false;
  req.session.destroy(function(err) {
    if (err) {
      console.error('Error during session destruction:', err);
    }
 res.render('login', {
    message: msg,
    messageType: ' ',
  })
  });
});

app.post('/', async (req, res) => {
  try {
    await client.connect();
        const db = client.db("myDB"); 
        const collection = db.collection("myCollection"); 

      const { username, password } = req.body;
      if (username.length == 0 || password.length == 0) {
        return res.render('login', {
          message: 'Please fill all of the fields to login.',
          messageType: 'error',
        });
      }
  
      const userExists = await collection.findOne({ username: username, password: password});
      if (userExists){
         req.session.username = username;
         //i am adding below something for when the user is using search
         const destinations = [
          { destName: "Bali Island", dest: "bali" },
          { destName: "Paris", dest: "paris" },
          { destName: "Rome", dest: "rome" },
          { destName: "Santorini Island", dest: "santorini" },
          { destName: "Annapurna Circuit", dest: "annapurna" },
          { destName: "Inca Trail to Machu Picchu", dest: "inca" }
        ];
    
        for (const destination of destinations) {
          const existingDest = await collection.findOne({ destName: destination.destName });
          if (!existingDest) {
    
            await collection.insertOne(destination);
            console.log(`Inserted: ${destination.destName}`);
          }
        }//end of the thing i am adding for the search
        return res.redirect('/home');              
      }
      else {
        return res.render('login', {
          message: 'The username or pasword are incorrect',
          messageType: 'error',
        });
      }

  } catch (err) {
      console.error("Error during registration:", err);
      res.status(500).send('Internal Server Error');
  } 

});

app.post('/add-dest', async (req, res) => {
  try {
    await client.connect();
        const db = client.db("myDB"); 
        const collection = db.collection("myCollection"); 

        const username = req.session.username;
        const destination = req.body.destination;  

        const userExists = await collection.findOne({ username: username, destination: destination });
    

      // const userExists = await collection.findOne({ username: username, destination: "Bali"});
      let message = '';
      if (!userExists) {
        await collection.insertOne({ username: username, destination: destination});
        message = ' ';
      } else {
        message = 'The destination is already added';
      }
  
      return res.send(`<div class="${userExists ? 'error' : ''}"><p>${message}</p></div>`);
    } catch (err) {
      console.error("Error during request:", err);
      res.status(500).send('Internal Server Error');
    }
  });

app.get('/rome',isAuthenticated, function(req, res) {
  res.render('rome',{
    message: ' ',
    messageType: ' ',
  })
});

app.get('/santorini',isAuthenticated, function(req, res) {
  res.render('santorini',{
    message: ' ',
    messageType: ' ',
  })
});
app.get('/annapurna',isAuthenticated, function(req, res) {
  res.render('annapurna',{
    message: ' ',
    messageType: ' ',
  })
});
// app.get('/wanttogo', function(req, res) {
//   res.render('wanttogo', {
//     destinations: []
//   } )
// });

app.get('/search',isAuthenticated, function(req, res) {
  res.render('searchresults' ,{ destinations: [], message:' '});
});

app.post('/search',isAuthenticated, async function (req, res) {
  const searchTerm = req.body.searchTerm;
  try {
    const db = client.db("myDB"); 
    const collection = db.collection("myCollection"); 
    
    const searchTerm = req.body.Search;

    const results = await collection.find(
      { destName: { $regex: searchTerm, $options: 'i' } }, 
      { projection: { dest: 1, destName: 1} }    
    ).toArray();

    if (results.length > 0) {
      res.render('searchresults', { destinations: results, message:' '});
    } else {
      res.render('searchresults', { destinations: [], message: 'Destination not Found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 

});

app.get('/wanttogo',isAuthenticated, async function (req, res) {
  try {
    const db = client.db("myDB"); 
    const collection = db.collection("myCollection"); 
    
    const username = req.session.username;

    const results = await collection.find(
      { username: username, destination: { $exists: true } }, 
      { projection: { destination: 1} }  
    ).toArray();

    res.render('wanttogo', { destinations: results});
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } 
 
});

// var x = {name: "Ali", age: 27, username:"ali123", password: "abc123"};
// var y = JSON.stringify(x);
// fs.writeFileSync("users.json", y)
// var data = fs.readFileSync("users.json"); //store json string
// var z = JSON.parse(data);//convert string to object
// // console.log(z);

async function closeClient() {
    try {
        await client.connect();
        const db = client.db("myDB"); 
        const collection = db.collection("myCollection"); 

    } catch (err) {
        console.error("Error:", err);
    } 
    finally {
        await client.close();
    }
}

closeClient();

app.listen(3000);

