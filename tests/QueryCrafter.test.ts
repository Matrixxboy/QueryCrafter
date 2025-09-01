import { QueryCrafter } from '../src/index';
import { LLMConfig } from '../src/llm/index';
import { Schema } from '../src/schema';
import { expect } from 'chai';
import { stub } from 'sinon';
import knex from 'knex';

// Replace with your actual MySQL connection details
const dbConfig = {
  client: 'mysql2',
  connection: {
    host: 'localhost',
    user: 'root',
    password: 'utsav1424',
    database: 'userdb',
  },
};

describe('QueryCrafter', () => {
  let mockAskLLM: any;
  let mockExtractSchema: any;
  let realKnex: knex.Knex;

  before(function() {
    this.timeout(5000); // Increase timeout for database connection
    realKnex = knex(dbConfig);
  });

  after(async () => {
    await realKnex.destroy();
  });

  beforeEach(() => {
    mockAskLLM = stub();
    mockExtractSchema = stub();
  });

  it('should be defined', () => {
    expect(QueryCrafter).to.not.be.undefined;
  });

  it('should throw an error if provider or apiKey is missing', () => {
    expect(() => new QueryCrafter({ db: dbConfig, llm: {} as LLMConfig })).to.throw(
      'LLM provider and API key are required in the constructor.'
    );
  });

  it('should create an instance of QueryCrafter', () => {
    const crafter = new QueryCrafter({
      db: dbConfig,
      llm: { provider: 'groq', apiKey: 'test' },
      askLLM: mockAskLLM,
      extractSchema: mockExtractSchema,
    });
    expect(crafter).to.be.an.instanceOf(QueryCrafter);
  });

  it('should call askLLM and extractSchema when convert is called (mocked)', async () => {
    const crafter = new QueryCrafter({
      db: dbConfig,
      llm: { provider: 'openai', apiKey: 'test' },
      askLLM: mockAskLLM,
      extractSchema: mockExtractSchema,
    });

    const schema: Schema = { users: ['id', 'name'] };
    mockExtractSchema.resolves(schema);
    mockAskLLM.resolves('SELECT * FROM users');

    await crafter.convert('show me all users');

    expect(mockExtractSchema.calledOnce).to.be.true;
    expect(mockAskLLM.calledOnce).to.be.true;
  });

  it('should return the generated SQL query from convert method', async () => {
    const crafter = new QueryCrafter({
      db: dbConfig,
      llm: { provider: 'openai', apiKey: 'test' },
      askLLM: mockAskLLM,
      extractSchema: mockExtractSchema,
    });

    const schema: Schema = { products: ['id', 'name', 'price'] };
    mockExtractSchema.resolves(schema);
    const expectedSql = 'SELECT name, price FROM products WHERE price > 100';
    mockAskLLM.resolves(expectedSql);

    const nlpQuery = 'show me products more expensive than 100';
    const generatedSql = await crafter.convert(nlpQuery);

    expect(mockExtractSchema.calledOnce).to.be.true;
    expect(mockAskLLM.calledOnceWith(nlpQuery, schema, { provider: 'openai', apiKey: 'test' })).to.be.true;
    expect(generatedSql).to.equal(expectedSql);
  });

  it('should execute a real SQL query against the database', async function() {
    this.timeout(5000); // Increase timeout for real database interaction

    // Create a temporary table and insert data for testing
    await realKnex.schema.dropTableIfExists('test_users');
    await realKnex.schema.createTable('test_users', (table) => {
      table.increments('id').primary();
      table.string('name');
    });
    await realKnex('test_users').insert([{ name: 'Alice' }, { name: 'Bob' }]);

    // Use the stubbed askLLM and extractSchema for this test
    mockExtractSchema.resolves({ test_users: ['id', 'name'] });
    mockAskLLM.resolves('SELECT * FROM test_users');

    const crafter = new QueryCrafter({
      db: dbConfig,
      llm: { provider: 'openai', apiKey: 'test' },
      askLLM: mockAskLLM,
      extractSchema: mockExtractSchema,
    });

    const result = await crafter.execute('show me all test users');

    expect(mockExtractSchema.calledOnce).to.be.true;
    expect(mockAskLLM.calledOnce).to.be.true;
    expect(result.sql).to.equal('SELECT * FROM test_users');
    expect(result.result).to.be.an('array');
    expect(result.result).to.have.lengthOf(2);
    expect(result.result[0].name).to.equal('Alice');
    expect(result.result[1].name).to.equal('Bob');

    // Clean up the temporary table
    await realKnex.schema.dropTable('test_users');
  });
});
