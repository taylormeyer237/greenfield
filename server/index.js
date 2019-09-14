const express = require('express');

const app = express();
const path = require('path');
const bcrypt = require('bcrypt');
// const users = require('../server/database');

const PORT = process.env.PORT || 8080;
const bodyParser = require('body-parser');

const fileUpload = require('express-fileupload');// middleware that creates req.files object that contains files uploaded through frontend input
const cloudinary = require('cloudinary').v2;// api for dealing with image DB, cloudinary
const cloudinaryConfig = require('./config.js');
const { convertToCoordinates } = require('../client/src/helpers/geoLocation');

const {
  findUser, saveUser, savePost, increasePostCount, saveUsersPostCount, displayPosts,
} = require('./database/index.js');

cloudinary.config(cloudinaryConfig);// config object for connecting to cloudinary


app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, '../client/images')));
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(fileUpload({
  useTempFiles: true,
}));

app.get('/posts', (req, res) => {
  displayPosts()
    .then((posts) => {
      res.status(201).send(posts);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send('something went wrong and we cannot show you the posts right now');
    });
});


// app.post('/signIn', (req, res) => {
//   // will have to use passport for auth
//   const givenUser = req.body.username;
//   const givenPassword = req.body.password;
//   return findUser(givenUser)
//     .then((foundUser) => {
//       bcrypt.compareSync(givenPassword, foundUser.password);
//     });
// });

app.post('/signUp', (req, res) => {
  // need to verify that password matches, required fields submitted, etc
  // if user already exists, redirect back to sign-in
  // if username already taken, redirect back to sign-up
  // const salt = bcrypt.genSaltSync(10);
  // const hash = bcrypt.hashSync(req.body.password, salt);

  let userId;
  const userInfo = {
    username: req.body.username,
    // salt,
    password: req.body.password,
    email: req.body.email,
    business: req.body.business,
  };

  return findUser(userInfo.username)
    .then((foundUser) => {
      res.send(foundUser);
    }).catch(() => {
      saveUser(userInfo);
    })
    .then((savedUser) => {
      userId = savedUser.insertId;
      // then start a session and create a token
    })
    .then(() => {
      saveUsersPostCount(userId)
        .then(() => {
          res.status(201).send('user saved in db'); // send token to use for sessions, where to store?
        })
        .catch((error) => {
          console.log(error);
          res.status(404).send('something went wrong and user was not saved in db');
        });
    }).catch ((err) => {
      console.error(err);
    });
});


app.post('/submitPost', (req, res) => {
  // need to authenticate user's credentials here.
  // if not logged in, re-route to sign-up page
  // then somehow pull their username out of the req.body, and use that in savePost() call below

  // TEMPORARY standin for userId. replace with actual data when it exists
  // const { userId } = verifySession;
  const image = req.files.photo;
  const userId = 1;
  const post = {
    text: req.body.text,
    img1: null,
    title: req.body.title,
    location: null,
    tags: req.body.tags,
  };

  cloudinary.uploader.upload(image.tempFilePath)
    .then((result) => {
      post.img1 = result.secure_url;
      const {
        address, city, state, zip,
      } = req.body;
      const fullAddress = {
        address, city, state, zip,
      };

      return convertToCoordinates(fullAddress);
    })
    .then((geoLocation) => {
      const { location } = geoLocation.data.results[0].geometry;
      post.location = `${location.lat}, ${location.lng}`;
      savePost(post);
    })
    .then(() => {
      increasePostCount(userId)
        .then(() => {
          res.status(201).send('got your post!');
        })
        .catch((error) => {
          console.log(error);
          res.status(404).send('something went wrong with your post');
        });
    });
});


app.post('/test', (req, res) => {
  const image = req.files.photo;

  // saveImage(image);
  cloudinary.uploader.upload(image.tempFilePath)
    .then((result) => {
      console.log(result);
      const hostedImageUrl = result.secure_url;
      res.send({ great: 'job!, you did image stuff!' });
    });
});

app.listen(PORT, () => {
  console.log('Bitches be crazy on: 8080');
});
