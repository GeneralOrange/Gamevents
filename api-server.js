require('dotenv').config({ path: './.env.local' });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const app = express();
const port = process.env.API_PORT || 3001;
const baseUrl = process.env.AUTH0_BASE_URL;
const issuerBaseUrl = process.env.AUTH0_ISSUER_BASE_URL;
const audience = process.env.AUTH0_AUDIENCE;
const clientID = process.env.AUTH0_API_CLIENT_ID;
const clientSecret = process.env.AUHT0_API_CLIENT_SECRET;

if (!baseUrl || !issuerBaseUrl) {
  throw new Error('Please make sure that the file .env.local is in place and populated');
}

if (!audience) {
  console.log('AUTH0_AUDIENCE not set in .env.local. Shutting down API server.');
  process.exit(1);
}

app.use(morgan('dev'));
app.use(helmet());
app.use(cors({ origin: baseUrl }));
app.use(express.urlencoded());
app.use(express.json());

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${issuerBaseUrl}/.well-known/jwks.json`
  }),
  audience: audience,
  issuer: `${issuerBaseUrl}/`,
  algorithms: ['RS256']
});

const getManagementApiJwt = () => {
  var request = require('request');
  return new Promise((resolve, reject) => {
    var options = {
      method: 'POST',
      url: `${issuerBaseUrl}/oauth/token`,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientID,
        client_secret: clientSecret,
        audience: `${issuerBaseUrl}/api/v2/`,
        grant_type: 'client_credentials'
      })
    }

    request(options, (error, response, body) => {
      if(error){
        reject(error);
      } else {
        resolve(JSON.parse(body));
      }
    })
  });
}

app.get('/', (req, res) => {
  res.json({ message: 'OK'})
})

app.get('/api/shows', checkJwt, (req, res) => {
  res.send({
    msg: 'Your access token was successfully validated!'
  });
});

app.post('/api/updateUserSummoner', checkJwt, (req, res) => {
  var request = require('request');
  getManagementApiJwt()
    .then(data => {
      const token = data.access_token;
      var options = {
        method: 'PATCH',
        url: `${issuerBaseUrl}/api/v2/users/${req.user.sub}`,
        headers: {
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: {
          user_metadata: {
            summoner: req.body
          }
        },
        json: true
      }
  
      request(options, (error, response, body) => {
        if (error) throw new Error(error);
        res.json(body);
      })
    })
});

const server = app.listen(port, () => console.log(`API Server listening on port ${port}`));
process.on('SIGINT', () => server.close());
