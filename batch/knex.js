const AWS = require('aws-sdk')

const secretsmanager = new AWS.SecretsManager({
  region: process.env.AWS_REGION || 'us-east-1'
})

async function getCreds () {
  const secret = await secretsmanager
    .getSecretValue({
      SecretId: 'fpe-rds-secret',
      VersionStage: 'AWSCURRENT'
    }).promise()
  return JSON.parse(secret.SecretString)
}

const config = {
  client: 'postgresql',
  connection: async function () {
    // https://github.com/knex/knex/pull/3364
    const creds = await getCreds()
    return {
      host: creds.host,
      port: creds.port,
      database: creds.dbname,
      user: creds.username,
      password: creds.password
    }
  }
}

module.exports = require('knex')(config)