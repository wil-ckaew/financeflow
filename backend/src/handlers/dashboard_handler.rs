// src/handlers/dashboard_handler.rs
use actix_web::{get, web::{Data, ServiceConfig}, HttpResponse, Responder};
use crate::db::DbPool;
use serde::Serialize;

#[derive(Serialize)]
struct CountResponse {
    count: i64,
}

#[derive(Serialize)]
struct RevenueResponse {
    revenue: f64,
}

#[derive(Serialize)]
struct TotalResponse {
    total: f64,
}

#[derive(Serialize)]
struct MonthlySale {
    month: String,
    sales: f64,
}

/// GET /api/clients/count
#[get("/clients/count")]
async fn clients_count(db: Data<DbPool>) -> impl Responder {
    let result = sqlx::query!("SELECT COUNT(*) as count FROM clients")
        .fetch_one(db.get_ref())
        .await;

    match result {
        Ok(row) => HttpResponse::Ok().json(CountResponse {
            count: row.count.unwrap_or(0),
        }),
        Err(err) => {
            eprintln!("Erro ao buscar número de clientes: {:?}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

/// GET /api/sales/count
#[get("/sales/count")]
async fn sales_count(db: Data<DbPool>) -> impl Responder {
    let result = sqlx::query!("SELECT COUNT(*) as count FROM sales")
        .fetch_one(db.get_ref())
        .await;

    match result {
        Ok(row) => HttpResponse::Ok().json(CountResponse {
            count: row.count.unwrap_or(0),
        }),
        Err(err) => {
            eprintln!("Erro ao buscar número de vendas: {:?}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

/// GET /api/sales/revenue
#[get("/sales/revenue")]
async fn sales_revenue(db: Data<DbPool>) -> impl Responder {
    let result = sqlx::query!("SELECT COALESCE(SUM(total_price),0) as revenue FROM sales")
        .fetch_one(db.get_ref())
        .await;

    match result {
        Ok(row) => HttpResponse::Ok().json(RevenueResponse {
            revenue: row.revenue.unwrap_or(0.0),
        }),
        Err(err) => {
            eprintln!("Erro ao buscar receita de vendas: {:?}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

/// GET /api/expenses/total
#[get("/expenses/total")]
async fn expenses_total(db: Data<DbPool>) -> impl Responder {
    let result = sqlx::query!("SELECT COALESCE(SUM(amount),0) as total FROM expenses")
        .fetch_one(db.get_ref())
        .await;

    match result {
        Ok(row) => HttpResponse::Ok().json(TotalResponse {
            total: row.total.unwrap_or(0.0),
        }),
        Err(err) => {
            eprintln!("Erro ao buscar total de despesas: {:?}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

/// GET /api/sales/monthly
#[get("/sales/monthly")]
async fn sales_monthly(db: Data<DbPool>) -> impl Responder {
    let result = sqlx::query!(
        r#"
        SELECT
            to_char(created_at, 'Mon') AS month_name,
            COALESCE(SUM(total_price), 0) AS sales
        FROM sales
        WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
        GROUP BY month_name, EXTRACT(MONTH FROM created_at)
        ORDER BY EXTRACT(MONTH FROM created_at)
        "#
    )
    .fetch_all(db.get_ref())
    .await;

    match result {
        Ok(rows) => {
            let data: Vec<MonthlySale> = rows
                .into_iter()
                .map(|r| MonthlySale {
                    month: r.month_name.unwrap_or_else(|| "N/A".to_string()),
                    sales: r.sales.unwrap_or(0.0),
                })
                .collect();

            HttpResponse::Ok().json(data)
        }
        Err(err) => {
            eprintln!("Erro ao buscar vendas mensais: {:?}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

pub fn config_dashboard(cfg: &mut ServiceConfig) {
    cfg.service(clients_count)
        .service(sales_count)
        .service(sales_revenue)
        .service(expenses_total)
        .service(sales_monthly);
}
