use actix_web::{get, web, HttpResponse, Responder};
use chrono::{NaiveDate, NaiveDateTime};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

use crate::db::DbPool;

#[derive(Serialize, FromRow)]
pub struct SalesReport {
    pub product_name: String,
    pub total_quantity: i64,
    pub total_revenue: f64,
}

#[derive(Debug, Deserialize)]
pub struct ReportDateRange {
    pub start_date: NaiveDate,
    pub end_date: NaiveDate,
}

/// GET /api/reports/sales
#[get("/reports/sales")]
pub async fn sales_report(pool: web::Data<DbPool>) -> impl Responder {
    let result = sqlx::query_as::<_, SalesReport>(
        r#"
        SELECT 
            p.name AS product_name,
            SUM(s.quantity) AS total_quantity,
            SUM(s.total_price) AS total_revenue
        FROM sales s
        JOIN products p ON s.product_id = p.id
        GROUP BY p.name
        ORDER BY total_revenue DESC
        "#
    )
    .fetch_all(pool.get_ref())
    .await;

    match result {
        Ok(report) => HttpResponse::Ok().json(report),
        Err(err) => {
            eprintln!("Erro ao gerar relatório: {:?}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

/// GET /api/reports/sales_by_date?start_date=2025-01-01&end_date=2025-12-31
#[get("/reports/sales_by_date")]
pub async fn sales_by_date(
    pool: web::Data<DbPool>,
    query: web::Query<ReportDateRange>,
) -> impl Responder {
    let start = query.start_date.and_hms_opt(0, 0, 0).unwrap_or(NaiveDateTime::MIN);
    let end = query.end_date.and_hms_opt(23, 59, 59).unwrap_or(NaiveDateTime::MAX);

    let result = sqlx::query_as::<_, SalesReport>(
        r#"
        SELECT 
            p.name AS product_name,
            SUM(s.quantity) AS total_quantity,
            SUM(s.total_price) AS total_revenue
        FROM sales s
        JOIN products p ON s.product_id = p.id
        WHERE s.created_at BETWEEN $1 AND $2
        GROUP BY p.name
        ORDER BY total_revenue DESC
        "#
    )
    .bind(start)
    .bind(end)
    .fetch_all(pool.get_ref())
    .await;

    match result {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(err) => {
            eprintln!("Erro ao gerar relatório por data: {:?}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

/// Configura as rotas dos relatórios para uso no mod.rs
pub fn config_reports(cfg: &mut web::ServiceConfig) {
    cfg.service(sales_report)
       .service(sales_by_date);
}