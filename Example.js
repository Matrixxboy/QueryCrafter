import { QueryCrafter } from "querycrafter";
import dotenv from 'dotenv';
dotenv.config();

const env = process.env;

async function main() {
    const config = {
        db: {
            client: "mysql2",
            connection: {
                host: env.DB_HOST,
                user: env.DB_USER,
                password: env.DB_PASSWORD,
                database: env.DB_NAME,
            },
        },
        llm: {
            provider: "groq", // Choose from groq , gemini , openai
            model: "llama-3.1-8b-instant", // Add letest NLP model
            apiKey: env.LLM_API_KEY, // Integrate LLM model API
        },
    };

    if (!["groq", "openai", "gemini"].includes(config.llm.provider)) {
        throw new Error(`Invalid LLM provider in .env file: ${config.llm.provider}`);
    }

    try {
        const crafter = new QueryCrafter(config);
        const nlpQuery = "show me all user whose email start with user and has role of user";

        console.log(`\nOriginal Query: "${nlpQuery}"\n`);

        const sqlQuery = await crafter.convert(nlpQuery);
        console.log(`Generated SQL: ${sqlQuery}\n`);

        const { sql, result } = await crafter.execute(nlpQuery);
        console.log(`Executed SQL: ${sql}\n`);
        console.log(`SQL Executed: ${sql}`);
        console.log("Query Result:", result);

    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main();
