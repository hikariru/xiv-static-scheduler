module.exports = {
  type: "postgres",
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  synchronize: true,
  logging: false,
  entities: ["dist/app/entity/**/*.js"],
  migrations: ["dist/app/migration/**/*.js"],
  subscribers: ["dist/app/subscriber/**/*.js"],
  cli: {
    entitiesDir: "src/app/entity",
    migrationsDir: "src/app/migration",
    subscribersDir: "src/app/subscriber"
  }
};
