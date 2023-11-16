const express = require('express')
require('dotenv').config()
var cors = require('cors')
var cookieParser = require('cookie-parser')
var jwt = require('jsonwebtoken');

const app = express()

app.use(cookieParser())
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}))
app.use(express.json())

const port = process.env.PORT || 3000

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const uri = 'mongodb+srv://messangerMenager:ETAWGpHNeHoSWa6p@cluster0.vdfwpbk.mongodb.net/?retryWrites=true&w=majority'

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// meddle wear
const verify = async (req, res, next) => {
    const token = req.cookies?.token
    if (!token) {
        return res.status(401).send({ message: "unAuthorize access" })
    }
    jwt.verify(token, 'secret', function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: "unAuthorize access" })
        }
        req.user = decoded;
        next()
    });

}

// start
// Create jwt from sent email in the fontedn side req.body



async function run() {
    try {
        const database = client.db("Mesangers");
        const user = database.collection("chats");
        const allchat = database.collection("allchat");

        app.post('/jwt', (req, res) => {
            try {
                const token = jwt.sign(req.body, 'secret', { expiresIn: '2h' });
                res
                    .cookie('token', token, {
                        httpOnly: true,
                        secure: false,
                        sameSite: false,
                    })
                    // .cookie('token', token, {
                    //     httpOnly: true,
                    //     secure: process.env.NODE_ENV === 'production',
                    //     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                    // })
                    .send(token)
            } catch (error) {
                console.log(error)
            }
        })

        app.get('/cookedelet', (req, res) => {
            res.clearCookie('token', { maxAge: 0 }).send({ sucess: true })
        })







        // Signin user
        app.post('/user', async (req, res) => {
            const result = await user.insertOne(req.body)
            res.send(result)
        })

        app.get('/user', async (req, res) => {
            const result = await user.find().toArray();
            res.send(result)
        })
        app.get('/chat', async (req, res) => {
            const id = req.query.id;
            const result = await user.findOne({ _id: new ObjectId(id) });
            res.send(result)
        })

        app.post('/allChat', async (req, res) => {
            const result = await allchat.insertOne(req.body)
            res.send(result)
        })
        app.delete('/deleteChat/:id', async (req, res) => {
            const result = await allchat.deleteOne({ _id: new ObjectId(req.params.id) })
            res.send(result)
        })

        app.get('/allchat', async (req, res) => {
            const cuser = req.query.cuser;
            const suser = req.query.suser;
            const result = await allchat.find().toArray()
            if (result) {
                const findData = await allchat.find({
                    $or: [
                        { cuserEmail: cuser, email: suser },
                        { cuserEmail: suser, email: cuser }
                    ]
                }).toArray()
                res.send(findData)
            }
        })














        // app.get('/services', verify, async (req, res) => {
        //     const result = await checkout.find().toArray()


        //     // const id = req.query.id
        //     // const email = req.query.email
        //     // const token = req.user
        //     // if (token.email !== email) {
        //     //     return res.status(403).send({ message: "Not access" })
        //     // }
        //     // const result = await services.findOne({ _id: new ObjectId(id) })
        //     res.send(result)
        // })





        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);



app.get('/', verify, (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})