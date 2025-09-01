import { QueryCrafter } from "./src/index";
import dotenv from 'dotenv';
dotenv.config();

// Define a type for your environment variables to ensure they exist
interface IProcessEnv {
    DB_HOST: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    LLM_PROVIDER: "groq" | "openai" | "gemini";
    LLM_API_KEY: string;
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
                password: env.DB_PASSWORD,
                database: env.DB_NAME,
            },
        },
        llm: {
            provider: "groq",
            apiKey: env.LLM_API_KEY,
        },
    };

    // Add a check to ensure the LLM provider is a valid one at runtime
    if (!["groq", "openai", "gemini"].includes(config.llm.provider)) {
        throw new Error(`Invalid LLM provider in .env file: ${config.llm.provider}`);
    }

    try {
        const crafter = new QueryCrafter(config);
        const nlpQuery = "show me all vehical details";

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