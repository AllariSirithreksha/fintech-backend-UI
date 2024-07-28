const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const bodyParser = require('body-parser');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

const HASURA_GRAPHQL_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

// Helper function to call Hasura
const callHasura = async (query, variables = {}) => {
  const response = await axios.post(
    HASURA_GRAPHQL_ENDPOINT,
    { query, variables },
    { headers: { 'x-hasura-admin-secret': HASURA_ADMIN_SECRET } }
  );
  return response.data.data;
};

// Create a new account
app.post('/accounts', async (req, res) => {
  const { name } = req.body;
  const query = `
    mutation($name: String!) {
      insert_accounts(objects: {name: $name}) {
        returning {
          id
          name
          balance
          created_at
        }
      }
    }
  `;
  try {
    const result = await callHasura(query, { name });
    res.status(201).json(result.insert_accounts.returning[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Get all accounts
app.get('/accounts', async (req, res) => {
  const query = `
    query {
      accounts {
        id
        name
        balance
        created_at
      }
    }
  `;
  try {
    const result = await callHasura(query);
    res.json(result.accounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Deposit money
app.post('/accounts/:id/deposit', async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  const query = `
    mutation($id: Int!, $amount: numeric!) {
      update_accounts(where: {id: {_eq: $id}}, _inc: {balance: $amount}) {
        returning {
          id
          name
          balance
          created_at
        }
      }
    }
  `;
  try {
    const result = await callHasura(query, { id: parseInt(id), amount });
    res.json(result.update_accounts.returning[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to deposit money' });
  }
});

// Withdraw money
app.post('/accounts/:id/withdraw', async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  const query = `
    mutation($id: Int!, $amount: numeric!) {
      update_accounts(where: {id: {_eq: $id}}, _inc: {balance: -$amount}) {
        returning {
          id
          name
          balance
          created_at
        }
      }
    }
  `;
  try {
    const result = await callHasura(query, { id: parseInt(id), amount });
    res.json(result.update_accounts.returning[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to withdraw money' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
