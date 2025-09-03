<!-- NPM Card -->
<a href="https://www.npmjs.com/package/querycrafter" target="_blank">
  <img src="https://img.shields.io/npm/v/querycrafter?color=CB3837&logo=npm&label=querycrafter&style=for-the-badge" alt="npm version" />
</a>

---

![stars](https://img.shields.io/github/stars/Matrixxboy/QueryCrafter?style=social)
![forks](https://img.shields.io/github/forks/Matrixxboy/QueryCrafter?style=social)
![npm](https://img.shields.io/npm/v/querycrafter?color=red)
![npm downloads](https://img.shields.io/npm/dt/querycrafter?color=blue)
![issues](https://img.shields.io/github/issues/Matrixxboy/QueryCrafter)
![pull requests](https://img.shields.io/github/issues-pr/Matrixxboy/QueryCrafter)
![code style](https://img.shields.io/badge/code_style-standard-brightgreen.svg)
![license](https://img.shields.io/github/license/Matrixxboy/QueryCrafter)
![last commit](https://img.shields.io/github/last-commit/Matrixxboy/QueryCrafter)

# 🚀 QueryCrafter

**QueryCrafter** intelligently translates **natural language** into **accurate SQL queries**.
No more writing complex SQL by hand — simply ask questions in plain English and let QueryCrafter handle the rest.

---

## ✨ Features

* 🗣 **Natural Language → SQL**
  Convert human-readable queries into valid SQL automatically.

* 🧠 **Database Dialect Awareness**
  Generates SQL optimized for your database client (`mysql`, `mysql2`, `pg`, `sqlite3`, `mssql`, etc.).

* 🔌 **Extensible**
  Works with multiple LLM providers like **Groq**, **OpenAI**, and **Gemini**.

* ✅ **Robust Validation**
  Built-in schema awareness + SQL validation to ensure **safe & correct** queries.

---

## 📦 Installation

Install `querycrafter` along with your preferred database client.

```bash
npm install querycrafter knex mysql2 dotenv
```

👉 Replace `mysql2` with your DB client of choice:

* `pg` → PostgreSQL
* `sqlite3` → SQLite
* `mssql` → Microsoft SQL Server


## 🗄 Supported Databases

QueryCrafter supports schema extraction + query generation for:

* `pg` → PostgreSQL
* `mysql` / `mysql2`
* `sqlite3`
* `mssql` → Microsoft SQL Server

✅ For best results, use one of these supported clients with Knex.


## ⚙️ Usage

### 1. Configure Environment

Create a `.env` file in your project root:

```env
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

LLM_PROVIDER=groq   # or openai, gemini
LLM_API_KEY=your_llm_api_key
LLM_MODEL=Selected_llm_model
```

---

### 2. Initialize QueryCrafter
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

