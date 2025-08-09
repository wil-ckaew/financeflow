// src/handlers/expense_handler.rs
use actix_web::{get, post, patch, delete, web, HttpResponse, Responder};
use uuid::Uuid;
use sqlx::{query, query_as};
use crate::{db::DbPool, models::expense::{Expense, CreateExpense, UpdateExpense}};

// GET /api/expenses
#[get("/expenses")]
pub async fn get_expenses(pool: web::Data<DbPool>) -> impl Responder {
    let expenses = query_as::<_, Expense>("SELECT * FROM expenses ORDER BY due_date ASC")
        .fetch_all(pool.get_ref())
        .await;

    match expenses {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

// GET /api/expenses/{id}
#[get("/expenses/{id}")]
pub async fn get_expense_by_id(
    pool: web::Data<DbPool>,
    path: web::Path<Uuid>,
) -> impl Responder {
    let id = path.into_inner();

    let expense = query_as::<_, Expense>(
        "SELECT * FROM expenses WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(pool.get_ref())
    .await;

    match expense {
        Ok(Some(exp)) => HttpResponse::Ok().json(exp),
        Ok(None) => HttpResponse::NotFound().body("Despesa não encontrada"),
        Err(_) => HttpResponse::InternalServerError().body("Erro ao buscar despesa"),
    }
}

// POST /api/expenses
#[post("/expenses")]
pub async fn create_expense(
    pool: web::Data<DbPool>,
    expense: web::Json<CreateExpense>,
) -> impl Responder {
    let new_id = Uuid::new_v4();

    let result = query!(
        "INSERT INTO expenses (id, description, supplier_id, amount, due_date, paid, created_at) VALUES ($1, $2, $3, $4, $5, false, NOW())",
        new_id,
        expense.description,
        expense.supplier_id,
        expense.amount,
        expense.due_date
    )
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(_) => HttpResponse::Created().json(new_id),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

// PATCH /api/expenses/{id}
#[patch("/expenses/{id}")]
pub async fn update_expense(
    pool: web::Data<DbPool>,
    path: web::Path<Uuid>,
    expense_update: web::Json<UpdateExpense>,
) -> impl Responder {
    let id = path.into_inner();

    // Buscar despesa existente
    let existing = query_as::<_, Expense>("SELECT * FROM expenses WHERE id = $1")
        .bind(id)
        .fetch_optional(pool.get_ref())
        .await;

    if let Err(_) = existing {
        return HttpResponse::InternalServerError().finish();
    }

    let existing = match existing.unwrap() {
        Some(exp) => exp,
        None => return HttpResponse::NotFound().body("Despesa não encontrada"),
    };

    // Atualiza campos mantendo valores antigos se não vier no update
    let description = expense_update.description.clone().unwrap_or(existing.description);
    let supplier_id = expense_update.supplier_id.or(existing.supplier_id);
    let amount = expense_update.amount.unwrap_or(existing.amount);
    let due_date = expense_update.due_date.unwrap_or(existing.due_date);
    let paid = expense_update.paid.unwrap_or(existing.paid);

    let result = query!(
        "UPDATE expenses SET description = $1, supplier_id = $2, amount = $3, due_date = $4, paid = $5 WHERE id = $6",
        description,
        supplier_id,
        amount,
        due_date,
        paid,
        id
    )
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(_) => HttpResponse::Ok().body("Despesa atualizada"),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

// DELETE /api/expenses/{id}
#[delete("/expenses/{id}")]
pub async fn delete_expense(
    pool: web::Data<DbPool>,
    path: web::Path<Uuid>,
) -> impl Responder {
    let id = path.into_inner();

    let result = query!("DELETE FROM expenses WHERE id = $1", id)
        .execute(pool.get_ref())
        .await;

    match result {
        Ok(_) => HttpResponse::Ok().body("Despesa deletada"),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

// Configura as rotas para despesas
pub fn config_expenses(cfg: &mut web::ServiceConfig) {
    cfg.service(get_expenses)
       .service(get_expense_by_id)
       .service(create_expense)
       .service(update_expense)
       .service(delete_expense);
}
