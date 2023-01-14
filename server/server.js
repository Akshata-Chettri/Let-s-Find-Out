import express from "express";
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from "openai";

// to be able to use dotenv variables
dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

// create instance of openai
const openai = new OpenAIApi(configuration);

// initialise express application
const app = express();
// setup middlewares [ cors -> allow us to make cross origin requests]
// allow us to call server from front-end
app.use(cors());
// allow us to pass json from front-end to back-end
app.use(express.json());

// create dummy root route
app.get('/', async (req, res) => {
    // if there is a success respose 
    res.status(200).send({
        message: 'Hello!',
    })
});

app.post('/', async (req, res) => {
    try {
        const prompt = req.body.prompt;

        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `${prompt}`,
            temperature: 0,
            max_tokens: 3000,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0,
        });

        res.status(200).send({
            bot: response.data.choices[0].text
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({ error })
    }
})

// to make sure server always listens
app.listen(5000, () => console.log("Server is running on port http://localhost:5000"));