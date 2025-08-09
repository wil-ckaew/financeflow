use sqlx::postgres::PgPoolOptions;
use std::env;

pub type DbPool = sqlx::Pool<sqlx::Postgres>;

pub async fn init() -> DbPool {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to create pool")
}
