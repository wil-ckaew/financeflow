// src/handlers/expense_handler.rs
use actix_web::{get, post, patch, delete, web, HttpResponse, Responder};
use uuid::Uuid;
use sqlx::{query, query_as};
use crate::{db::DbPool, models::expense::{Expense, CreateExpense, UpdateExpense}};

// Rota estática para total de despesas
#[get("/expenses/total")]
pub async fn get_expenses_total(pool: web::Data<DbPool>) -> impl Responder {
    // Exemplo simples somando todas despesas (ajuste conforme seu banco)
    let total = query!("SELECT COALESCE(SUM(amount), 0) as total FROM expenses")
        .fetch_one(pool.get_ref())
        .await;

    match total {
        Ok(record) => HttpResponse::Ok().json(serde_json::json!({ "total": record.total })),
        Err(err) => {
            eprintln!("Erro ao calcular total de despesas: {:?}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

// GET /api/expenses - lista todas despesas
#[get("/expenses")]
pub async fn get_expenses(pool: web::Data<DbPool>) -> impl Responder {
    match query_as::<_, Expense>("SELECT * FROM expenses ORDER BY due_date ASC")
        .fetch_all(pool.get_ref())
        .await
    {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(err) => {
            eprintln!("Erro ao buscar despesas: {:?}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

// GET /api/expenses/{id} - pega despesa pelo ID
#[get("/expenses/{id}")]
pub async fn get_expense_by_id(
    pool: web::Data<DbPool>,
    path: web::Path<Uuid>,
) -> impl Responder {
    let id = path.into_inner();

    match query_as::<_, Expense>("SELECT * FROM expenses WHERE id = $1")
        .bind(id)
        .fetch_optional(pool.get_ref())
        .await
    {
        Ok(Some(exp)) => HttpResponse::Ok().json(exp),
        Ok(None) => HttpResponse::NotFound().body("Despesa não encontrada"),
        Err(err) => {
            eprintln!("Erro ao buscar despesa por id: {:?}", err);
            HttpResponse::InternalServerError().body("Erro ao buscar despesa")
        }
    }
}

// POST /api/expenses - cria nova despesa
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
        Err(err) => {
            eprintln!("Erro ao criar despesa: {:?}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

// PATCH /api/expenses/{id} - atualiza despesa
#[patch("/expenses/{id}")]
pub async fn update_expense(
    pool: web::Data<DbPool>,
    path: web::Path<Uuid>,
    expense_update: web::Json<UpdateExpense>,
) -> impl Responder {
    let id = path.into_inner();

    let existing = query_as::<_, Expense>("SELECT * FROM expenses WHERE id = $1")
        .bind(id)
        .fetch_optional(pool.get_ref())
        .await;

    let existing = match existing {
        Ok(Some(exp)) => exp,
        Ok(None) => return HttpResponse::NotFound().body("Despesa não encontrada"),
        Err(err) => {
            eprintln!("Erro ao buscar despesa para atualizar: {:?}", err);
            return HttpResponse::InternalServerError().finish();
        }
    };

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
        Err(err) => {
            eprintln!("Erro ao atualizar despesa: {:?}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

// DELETE /api/expenses/{id} - deleta despesa
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
        Ok(res) if res.rows_affected() > 0 => HttpResponse::NoContent().finish(),
        Ok(_) => HttpResponse::NotFound().body("Despesa não encontrada"),
        Err(err) => {
            eprintln!("Erro ao deletar despesa: {:?}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

// Registra rotas de despesas
pub fn config_expenses(cfg: &mut web::ServiceConfig) {
    cfg.service(get_expenses_total);  // Registrar primeiro a rota estática
    cfg.service(get_expenses);
    cfg.service(get_expense_by_id);
    cfg.service(create_expense);
    cfg.service(update_expense);
    cfg.service(delete_expense);
}
