import { QueryCrafter } from "./src";
import dotenv from 'dotenv';
dotenv.config();

// Define a type for your environment variables to ensure they exist
interface IProcessEnv {
    DB_HOST: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    DB_PORT: string;
    LLM_PROVIDER: "groq" | "openai" | "gemini" | "ollama";
    LLM_API_KEY: string;
    LLM_MODEL: string;
}

// Assert that process.env matches the interface
const env = process.env as unknown as IProcessEnv;

async function main() {
    const config = {
        db: {
            client: "mysql2",
            connection: {
                host: env.DB_HOST,
                user: env.DB_USER,
                password: "Dev!123#",
                database: env.DB_NAME,
                port: parseInt(env.DB_PORT, 10),
            },
        },
        llm: {
            provider: env.LLM_PROVIDER, // Choose model from groq , gemini , openai
            model: env.LLM_MODEL, // Add letest NLP model
            apiKey: env.LLM_API_KEY, // Integrate LLM model API
        },
    };

    // Add a check to ensure the LLM provider is a valid one at runtime
    if (!["groq", "openai", "gemini", "ollama"].includes(config.llm.provider)) {
        throw new Error(`Invalid LLM provider in .env file: ${config.llm.provider}`);
    }

    try {
        const crafter = new QueryCrafter(config);
        const nlpQuery = "show me the highest salary from employees";

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