// Handler de produtos
// src/handlers/product_handler.rs
use actix_web::{get, post, patch, delete, web, HttpResponse, Responder};
use uuid::Uuid;
use sqlx::{query, query_as};
use crate::{db::DbPool, models::product::{Product, UpdateProduct, CreateProduct}};

// GET /api/products
#[get("/products")]
pub async fn get_products(pool: web::Data<DbPool>) -> impl Responder {
    let products = query_as::<_, Product>("SELECT * FROM products")
        .fetch_all(pool.get_ref())
        .await;

    match products {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

// GET /api/products/{id}
#[get("/products/{id}")]
pub async fn get_product_by_id(
    pool: web::Data<DbPool>,
    path: web::Path<Uuid>,
) -> impl Responder {
    let id = path.into_inner();

    let product = query_as::<_, Product>(
        "SELECT * FROM products WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(pool.get_ref())
    .await;

    match product {
        Ok(Some(prod)) => HttpResponse::Ok().json(prod),
        Ok(None) => HttpResponse::NotFound().body("Produto não encontrado"),
        Err(_) => HttpResponse::InternalServerError().body("Erro ao buscar produto"),
    }
}

// POST /api/products
#[post("/products")]
pub async fn create_product(
    pool: web::Data<DbPool>,
    product: web::Json<CreateProduct>,
) -> impl Responder {
    let new_id = Uuid::new_v4();

    let result = query!(
        "INSERT INTO products (id, name, description, price, stock) VALUES ($1, $2, $3, $4, $5)",
        new_id,
        product.name,
        product.description,
        product.price,
        product.stock
    )
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(_) => HttpResponse::Created().json(new_id),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

// PATCH /api/products/{id}
#[patch("/products/{id}")]
pub async fn update_product(
    pool: web::Data<DbPool>,
    path: web::Path<Uuid>,
    product: web::Json<UpdateProduct>,
) -> impl Responder {
    let id = path.into_inner();

    let result = query!(
        "UPDATE products SET name = $1, description = $2, price = $3, stock = $4 WHERE id = $5",
        product.name,
        product.description,
        product.price,
        product.stock,
        id
    )
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(_) => HttpResponse::Ok().body("Produto atualizado"),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

// DELETE /api/products/{id}
#[delete("/products/{id}")]
pub async fn delete_product(
    pool: web::Data<DbPool>,
    path: web::Path<Uuid>,
) -> impl Responder {
    let id = path.into_inner();

    let result = query!("DELETE FROM products WHERE id = $1", id)
        .execute(pool.get_ref())
        .await;

    match result {
        Ok(_) => HttpResponse::Ok().body("Produto deletado"),
        Err(_) => HttpResponse::InternalServerError().finish(),
    }
}

// Configura as rotas
pub fn config_produtos(cfg: &mut web::ServiceConfig) {
    cfg.service(get_products)
       .service(get_product_by_id) // ✅ agora existe
       .service(create_product)
       .service(update_product)
       .service(delete_product);
}
