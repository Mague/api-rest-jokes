import { Client } from '@elastic/elasticsearch';

const client = new Client({
  node: 'http://localhost:9200',
});

async function testConnection() {
  try {
    const info = await client.info();
    console.log(info);
  } catch (error) {
    console.error('Unable to connect to Elasticsearch:', error);
  }
}

testConnection();
