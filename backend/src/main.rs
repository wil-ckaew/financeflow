use actix_web::{web, App, HttpServer, middleware::Logger};
use actix_cors::Cors;
use dotenv::dotenv;
use std::env;

mod db;
mod schema;
mod auth;
mod models;
mod handlers;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("🚀 Iniciando o servidor...");

    dotenv().ok();

    if env::var_os("RUST_LOG").is_none() {
        env::set_var("RUST_LOG", "actix_web=info,sqlx=warn");
    }

    env_logger::Builder::from_default_env()
        .format_timestamp_millis()
        .init();

    let db_pool = db::init().await;
    println!("✅ Banco de dados conectado com sucesso.");

    start_http_server(db_pool).await
}

async fn start_http_server(pool: sqlx::PgPool) -> std::io::Result<()> {
    HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            .wrap(
                Cors::default()
                    .allow_any_origin()
                    .allow_any_method()
                    .allow_any_header()
                    .max_age(3600),
            )
            .app_data(web::Data::new(pool.clone()))
            .configure(handlers::config)
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}
