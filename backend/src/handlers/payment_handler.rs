// src/handlers/payment_handler.rs
use actix_web::{get, post, patch, delete, web, HttpResponse, Responder};
use uuid::Uuid;
use sqlx::{query, query_as};
use chrono::NaiveDate;
use crate::{db::DbPool, models::payment::{Payment, CreatePayment, UpdatePayment}};

// GET /api/payments
#[get("/payments")]
pub async fn get_payments(pool: web::Data<DbPool>) -> impl Responder {
    let payments = query_as::<_, Payment>("SELECT * FROM payments")
        .fetch_all(pool.get_ref())
        .await;

    match payments {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

// GET /api/payments/{id}
#[get("/payments/{id}")]
pub async fn get_payment_by_id(
    pool: web::Data<DbPool>,
    path: web::Path<Uuid>,
) -> impl Responder {
    let id = path.into_inner();

    let payment = query_as::<_, Payment>(
        "SELECT * FROM payments WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(pool.get_ref())
    .await;

    match payment {
        Ok(Some(pay)) => HttpResponse::Ok().json(pay),
        Ok(None) => HttpResponse::NotFound().body("Pagamento não encontrado"),
        Err(_) => HttpResponse::InternalServerError().body("Erro ao buscar pagamento"),
    }
}

// POST /api/payments
#[post("/payments")]
pub async fn create_payment(
    pool: web::Data<DbPool>,
    payment: web::Json<CreatePayment>,
) -> impl Responder {
    let new_id = Uuid::new_v4();

    let result = query!(
        "INSERT INTO payments (id, expense_id, payment_date, amount, method) VALUES ($1, $2, $3, $4, $5)",
        new_id,
        payment.expense_id,
        payment.payment_date,
        payment.amount,
        payment.method
    )
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(_) => HttpResponse::Created().json(new_id),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

// PATCH /api/payments/{id}
#[patch("/payments/{id}")]
pub async fn update_payment(
    pool: web::Data<DbPool>,
    path: web::Path<Uuid>,
    payment_update: web::Json<UpdatePayment>,
) -> impl Responder {
    let id = path.into_inner();

    // Buscar pagamento existente
    let existing = query_as::<_, Payment>(
        "SELECT * FROM payments WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(pool.get_ref())
    .await;

    if let Ok(Some(existing)) = existing {
        // Atualizar campos com fallback para valores existentes
        let expense_id = payment_update.expense_id.or(existing.expense_id);
        let payment_date = payment_update.payment_date.or(existing.payment_date);
        let amount = payment_update.amount.or(Some(existing.amount)).unwrap();
        let method = payment_update.method.clone().or(existing.method);

        let result = query!(
            "UPDATE payments SET expense_id = $1, payment_date = $2, amount = $3, method = $4 WHERE id = $5",
            expense_id,
            payment_date,
            amount,
            method,
            id
        )
        .execute(pool.get_ref())
        .await;

        match result {
            Ok(_) => HttpResponse::Ok().body("Pagamento atualizado"),
            Err(_) => HttpResponse::InternalServerError().body("Erro ao atualizar pagamento"),
        }
    } else {
        HttpResponse::NotFound().body("Pagamento não encontrado")
    }
}

// DELETE /api/payments/{id}
#[delete("/payments/{id}")]
pub async fn delete_payment(
    pool: web::Data<DbPool>,
    path: web::Path<Uuid>,
) -> impl Responder {
    let id = path.into_inner();

    let result = query!("DELETE FROM payments WHERE id = $1", id)
        .execute(pool.get_ref())
        .await;

    match result {
        Ok(_) => HttpResponse::Ok().body("Pagamento deletado"),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

// Configura as rotas
pub fn config_payments(cfg: &mut web::ServiceConfig) {
    cfg.service(get_payments)
       .service(get_payment_by_id)
       .service(create_payment)
       .service(update_payment)
       .service(delete_payment);
}
