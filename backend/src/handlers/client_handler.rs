// Handler de clientes
// src/handlers/client_handler.rs
use actix_web::{
    get, post, delete, patch,
    web::{Data, Json, Path, ServiceConfig},
    HttpResponse, Responder,
};
use serde_json::json;
use uuid::Uuid;
use sqlx::query_as;

use crate::{
    db::DbPool,
    models::client::Client,
    schema::{CreateClient, UpdateClient},
};

#[post("/clients")]
async fn create_client(
    body: Json<CreateClient>,
    db: Data<DbPool>,
) -> impl Responder {
    let new_id = Uuid::new_v4();

    let query = r#"
        INSERT INTO clients (id, name, email, phone)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, phone
    "#;

    match query_as::<_, Client>(query)
        .bind(new_id)
        .bind(&body.name)
        .bind(&body.email)
        .bind(&body.phone)
        .fetch_one(&**db)
        .await
    {
        Ok(client) => HttpResponse::Created().json(json!({
            "status": "success",
            "client": client
        })),
        Err(err) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Erro ao criar cliente: {:?}", err)
        })),
    }
}

#[get("/clients")]
async fn get_all_clients(db: Data<DbPool>) -> impl Responder {
    let query = r#"
        SELECT id, name, email, phone
        FROM clients
        ORDER BY name
    "#;

    match query_as::<_, Client>(query)
        .fetch_all(&**db)
        .await
    {
        Ok(clients) => HttpResponse::Ok().json(json!({
            "status": "success",
            "clients": clients
        })),
        Err(err) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Erro ao buscar clientes: {:?}", err)
        })),
    }
}

#[get("/clients/{id}")]
async fn get_client_by_id(
    path: Path<Uuid>,
    db: Data<DbPool>,
) -> impl Responder {
    let id = path.into_inner();

    let query = r#"
        SELECT id, name, email, phone
        FROM clients
        WHERE id = $1
    "#;

    match query_as::<_, Client>(query)
        .bind(id)
        .fetch_optional(&**db)
        .await
    {
        Ok(Some(client)) => HttpResponse::Ok().json(json!({
            "status": "success",
            "client": client
        })),
        Ok(None) => HttpResponse::NotFound().json(json!({
            "status": "error",
            "message": "Cliente não encontrado"
        })),
        Err(err) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Erro ao buscar cliente: {:?}", err)
        })),
    }
}

#[patch("/clients/{id}")]
async fn update_client_by_id(
    path: Path<Uuid>,
    body: Json<UpdateClient>,
    db: Data<DbPool>,
) -> impl Responder {
    let id = path.into_inner();

    let existing = sqlx::query_as::<_, Client>(
        "SELECT * FROM clients WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&**db)
    .await;

    match existing {
        Ok(Some(_)) => {
            let query = r#"
                UPDATE clients
                SET
                    name = COALESCE($1, name),
                    email = COALESCE($2, email),
                    phone = COALESCE($3, phone)
                WHERE id = $4
                RETURNING id, name, email, phone
            "#;

            match query_as::<_, Client>(query)
                .bind(body.name.as_ref())
                .bind(body.email.as_ref())
                .bind(body.phone.as_ref())
                .bind(id)
                .fetch_one(&**db)
                .await
            {
                Ok(updated) => HttpResponse::Ok().json(json!({
                    "status": "success",
                    "client": updated
                })),
                Err(err) => HttpResponse::InternalServerError().json(json!({
                    "status": "error",
                    "message": format!("Erro ao atualizar cliente: {:?}", err)
                })),
            }
        }
        Ok(None) => HttpResponse::NotFound().json(json!({
            "status": "error",
            "message": "Cliente não encontrado"
        })),
        Err(err) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Erro ao verificar cliente: {:?}", err)
        })),
    }
}

#[delete("/clients/{id}")]
async fn delete_client_by_id(
    path: Path<Uuid>,
    db: Data<DbPool>,
) -> impl Responder {
    let id = path.into_inner();

    match sqlx::query!("DELETE FROM clients WHERE id = $1", id)
        .execute(&**db)
        .await
    {
        Ok(res) if res.rows_affected() > 0 => HttpResponse::NoContent().finish(),
        Ok(_) => HttpResponse::NotFound().json(json!({
            "status": "error",
            "message": "Cliente não encontrado"
        })),
        Err(err) => HttpResponse::InternalServerError().json(json!({
            "status": "error",
            "message": format!("Erro ao deletar cliente: {:?}", err)
        })),
    }
}

/// Configura as rotas para clientes
pub fn config_clients(cfg: &mut ServiceConfig) {
    cfg.service(create_client)
        .service(get_all_clients)
        .service(get_client_by_id)
        .service(update_client_by_id)
        .service(delete_client_by_id);
}
