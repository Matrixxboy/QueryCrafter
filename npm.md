### TypeScript
```ts
import { QueryCrafter } from "querycrafter";
import dotenv from "dotenv";

dotenv.config();

const env = process.env as {
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  LLM_PROVIDER: "groq" | "openai" | "gemini";
  LLM_API_KEY: string;
};

async function runQuery() {
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
      provider: env.LLM_PROVIDER, // Choose model from groq , gemini , openai
      model: env.LLM_MODEL, // Add letest NLP model
      apiKey: env.LLM_API_KEY, // Integrate LLM model API
    },
  };

  try {
    const crafter = new QueryCrafter(config);
    const nlpQuery =
      "show me all users whose email starts with user and have role user";

    console.log(`💡 Original Query: "${nlpQuery}"`);

    // Convert natural language → SQL
    const sqlQuery = await crafter.convert(nlpQuery);
    console.log(`📝 Generated SQL: ${sqlQuery}`);

    // Execute SQL and return results
    const { sql, result } = await crafter.execute(nlpQuery);
    console.log(`⚡ Executed SQL: ${sql}`);
    console.log("📊 Query Result:", result);
  } catch (error) {
    console.error("❌ An error occurred:", error);
  }
}

runQuery();
```
---
### JavaScript
```javascript
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

        console.log(`\n💡 Original Query: "${nlpQuery}"\n`);

        const sqlQuery = await crafter.convert(nlpQuery);
        console.log(`📝 Generated SQL: ${sqlQuery}\n`);

        const { sql, result } = await crafter.execute(nlpQuery);
        console.log(`⚡ Executed SQL: ${sql}\n`);
        console.log("📊 Query Result:", result);

    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main();

```
---



## 🧪 Example Output

```bash
💡 Original Query: "show me all users whose email starts with user and have role user"

📝 Generated SQL:
SELECT * FROM users WHERE email LIKE 'user%' AND role = 'user'

⚡ Executed SQL:
SELECT * FROM users WHERE email LIKE 'user%' AND role = 'user'

📊 Query Result:
[
  { id: 1, name: 'user_1', email: 'user_1@example.com', role: 'user' },
  { id: 2, name: 'user_2', email: 'user_2@example.com', role: 'user' },
  ...
]
```
