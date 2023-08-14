const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('hello from verse food server');
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.byx3n24.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        const orderCollections = client.db('verseFood').collection('orders')
        app.get('/orders', async (req, res) => {
            const query = {
                isDelivered: false
            }
            const options = {
                sort: {},
                projection: { isDelivered: 0 }
            };
            const orders = await orderCollections.find(query, options).toArray();
            res.send(orders)
        })
        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email;
            const query = {
                userEmail: email,
                isDelivered: false
            }
            const options = {
                sort: {},
                projection: { _id: 0, isDelivered: 0, userEmail: 0 }
            };
            const orders = await orderCollections.find(query, options).toArray();
            res.send(orders)
        })

        app.post('/confirm-order', async (req, res) => {
            const { cart, email } = req.body;
            const doc = {
                userEmail: email,
                isDelivered: false,
                orderedItems: cart
            }
            const result = await orderCollections.insertOne(doc);
            res.send(result);
        })

        app.patch('/on-delivery-completion/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    isDelivered: true
                }
            }
            const result = await orderCollections.updateOne(filter, updatedDoc, options)
            res.send(result)
        })
    }
    finally {

    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`server is perfectly running on port: ${port}`);
})

module.exports = app