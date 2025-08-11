// Handler de vendas
use actix_web::{get, post, patch, delete, web, HttpResponse, Responder};
use uuid::Uuid;
use chrono::Utc;
use sqlx::query_as;

use crate::{db::DbPool, models::sale::Sale, schema::{CreateSale, UpdateSale}};

#[get("/count")]
pub async fn count_sales(pool: web::Data<DbPool>) -> impl Responder {
    let result = sqlx::query!("SELECT COUNT(*) as count FROM sales")
        .fetch_one(pool.get_ref())
        .await;

    match result {
        Ok(row) => HttpResponse::Ok().json(serde_json::json!({ "count": row.count.unwrap_or(0) })),
        Err(err) => {
            eprintln!("Erro ao contar vendas: {:?}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[get("/revenue")]
pub async fn revenue_sales(pool: web::Data<DbPool>) -> impl Responder {
    let result = sqlx::query!("SELECT COALESCE(SUM(total_price), 0) as revenue FROM sales")
        .fetch_one(pool.get_ref())
        .await;

    match result {
        Ok(row) => HttpResponse::Ok().json(serde_json::json!({ "revenue": row.revenue.unwrap_or(0.0) })),
        Err(err) => {
            eprintln!("Erro ao calcular receita: {:?}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[get("/sales")]
pub async fn get_sales(pool: web::Data<DbPool>) -> impl Responder {
    let sales = sqlx::query_as!(
        Sale,
        r#"
        SELECT 
            s.id,
            s.product_id,
            p.name as product_name,
            s.quantity,
            s.total_price,
            s.created_at as "created_at?"
        FROM sales s
        JOIN products p ON s.product_id = p.id
        ORDER BY s.created_at DESC
        "#
    )
    .fetch_all(pool.get_ref())
    .await;

    match sales {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(err) => {
            eprintln!("Erro ao buscar vendas: {:?}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

// Note o regex abaixo para aceitar só UUID no parâmetro id
#[get("/sales/{id:^[0-9a-fA-F\\-]{36}$}")]
pub async fn get_sale_by_id(
    path: web::Path<String>, 
    pool: web::Data<DbPool>,
) -> impl Responder {
    let id_str = path.into_inner();

    let sale_id = match Uuid::parse_str(&id_str) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().body("Invalid UUID"),
    };

    let sale = query_as::<_, Sale>("SELECT * FROM sales WHERE id = $1")
        .bind(sale_id)
        .fetch_optional(pool.get_ref())
        .await;

    match sale {
        Ok(Some(s)) => HttpResponse::Ok().json(s),
        Ok(None) => HttpResponse::NotFound().body("Sale not found"),
        Err(err) => {
            eprintln!("Erro ao buscar venda por id: {:?}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[post("/sales")]
pub async fn create_sale(
    pool: web::Data<DbPool>,
    sale: web::Json<CreateSale>,
) -> impl Responder {
    let id = Uuid::new_v4();

    let product = sqlx::query!("SELECT price FROM products WHERE id = $1", sale.product_id)
        .fetch_one(pool.get_ref())
        .await;

    let price = match product {
        Ok(p) => p.price,
        Err(_) => return HttpResponse::BadRequest().body("Product not found"),
    };

    let total_price = price * sale.quantity as f64;
    let now = Utc::now().naive_utc();

    let result = sqlx::query!(
        "INSERT INTO sales (id, product_id, quantity, total_price, created_at) VALUES ($1, $2, $3, $4, $5)",
        id,
        sale.product_id,
        sale.quantity,
        total_price,
        now
    )
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(_) => HttpResponse::Created().json(id),
        Err(err) => {
            eprintln!("Erro ao criar venda: {:?}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[patch("/sales/{id:^[0-9a-fA-F\\-]{36}$}")]
pub async fn update_sale(
    path: web::Path<String>,
    sale_update: web::Json<UpdateSale>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let id_str = path.into_inner();

    let sale_id = match Uuid::parse_str(&id_str) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().body("Invalid UUID"),
    };

    let existing = query_as::<_, Sale>("SELECT * FROM sales WHERE id = $1")
        .bind(sale_id)
        .fetch_optional(pool.get_ref())
        .await;

    if let Err(err) = existing {
        eprintln!("Erro ao buscar venda para atualizar: {:?}", err);
        return HttpResponse::InternalServerError().finish();
    }

    let existing = existing.unwrap();

    if existing.is_none() {
        return HttpResponse::NotFound().body("Sale not found");
    }

    let product_id = sale_update.product_id.unwrap_or(existing.as_ref().unwrap().product_id);
    let quantity = sale_update.quantity.unwrap_or(existing.as_ref().unwrap().quantity);

    let product = sqlx::query!("SELECT price FROM products WHERE id = $1", product_id)
        .fetch_one(pool.get_ref())
        .await;

    let price = match product {
        Ok(p) => p.price,
        Err(_) => return HttpResponse::BadRequest().body("Product not found"),
    };

    let total_price = price * quantity as f64;

    let result = sqlx::query!(
        r#"
        UPDATE sales
        SET product_id = $1, quantity = $2, total_price = $3
        WHERE id = $4
        "#,
        product_id,
        quantity,
        total_price,
        sale_id
    )
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(_) => HttpResponse::Ok().body("Sale updated successfully"),
        Err(err) => {
            eprintln!("Erro ao atualizar venda: {:?}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[delete("/sales/{id:^[0-9a-fA-F\\-]{36}$}")]
pub async fn delete_sale(
    path: web::Path<String>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let id_str = path.into_inner();

    let sale_id = match Uuid::parse_str(&id_str) {
        Ok(uuid) => uuid,
        Err(_) => return HttpResponse::BadRequest().body("Invalid UUID"),
    };

    let result = sqlx::query!("DELETE FROM sales WHERE id = $1", sale_id)
        .execute(pool.get_ref())
        .await;

    match result {
        Ok(res) if res.rows_affected() > 0 => HttpResponse::NoContent().finish(),
        Ok(_) => HttpResponse::NotFound().body("Sale not found"),
        Err(err) => {
            eprintln!("Erro ao deletar venda: {:?}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

pub fn config_sale(cfg: &mut web::ServiceConfig) {
    cfg.service(count_sales)
        .service(revenue_sales)
        .service(get_sales)
        .service(get_sale_by_id)
        .service(create_sale)
        .service(update_sale)
        .service(delete_sale);
}

