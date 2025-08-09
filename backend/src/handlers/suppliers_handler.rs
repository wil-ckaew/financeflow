// Handler de fornecedores
use actix_web::{get, post, patch, delete, web, HttpResponse, Responder};
use uuid::Uuid;
use sqlx::query_as;

use crate::{db::DbPool, models::supplier::Supplier, schema::{CreateSupplier, UpdateSupplier}};

#[get("/suppliers")]
pub async fn get_suppliers(pool: web::Data<DbPool>) -> impl Responder {
    let suppliers = query_as::<_, Supplier>("SELECT * FROM suppliers ORDER BY name")
        .fetch_all(pool.get_ref())
        .await;

    match suppliers {
        Ok(data) => HttpResponse::Ok().json(data),
        Err(err) => {
            eprintln!("Erro ao buscar fornecedores: {:?}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[get("/suppliers/{id}")]
pub async fn get_supplier_by_id(
    path: web::Path<Uuid>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let supplier_id = path.into_inner();

    let supplier = query_as::<_, Supplier>("SELECT * FROM suppliers WHERE id = $1")
        .bind(supplier_id)
        .fetch_optional(pool.get_ref())
        .await;

    match supplier {
        Ok(Some(s)) => HttpResponse::Ok().json(s),
        Ok(None) => HttpResponse::NotFound().body("Supplier not found"),
        Err(err) => {
            eprintln!("Erro ao buscar fornecedor por id: {:?}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[post("/suppliers")]
pub async fn create_supplier(
    pool: web::Data<DbPool>,
    supplier: web::Json<CreateSupplier>,
) -> impl Responder {
    let id = Uuid::new_v4();

    let result = sqlx::query!(
        "INSERT INTO suppliers (id, name, email, phone) VALUES ($1, $2, $3, $4)",
        id,
        supplier.name,
        supplier.email,
        supplier.phone,
    )
    .execute(pool.get_ref())
    .await;

    match result {
        Ok(_) => HttpResponse::Created().json(id),
        Err(err) => {
            eprintln!("Erro ao criar fornecedor: {:?}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[patch("/suppliers/{id}")]
pub async fn update_supplier(
    path: web::Path<Uuid>,
    supplier_update: web::Json<UpdateSupplier>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let supplier_id = path.into_inner();

    // Verifica existência
    let existing = query_as::<_, Supplier>("SELECT * FROM suppliers WHERE id = $1")
        .bind(supplier_id)
        .fetch_optional(pool.get_ref())
        .await;

    if let Err(err) = existing {
        eprintln!("Erro ao buscar fornecedor para atualizar: {:?}", err);
        return HttpResponse::InternalServerError().finish();
    }

    let existing = existing.unwrap();
    if existing.is_none() {
        return HttpResponse::NotFound().body("Supplier not found");
    }

    let update_result = sqlx::query!(
        r#"
        UPDATE suppliers
        SET
            name = COALESCE($1, name),
            email = COALESCE($2, email),
            phone = COALESCE($3, phone)
        WHERE id = $4
        "#,
        supplier_update.name.as_ref(),
        supplier_update.email.as_ref(),
        supplier_update.phone.as_ref(),
        supplier_id,
    )
    .execute(pool.get_ref())
    .await;

    match update_result {
        Ok(_) => HttpResponse::Ok().body("Supplier updated successfully"),
        Err(err) => {
            eprintln!("Erro ao atualizar fornecedor: {:?}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

#[delete("/suppliers/{id}")]
pub async fn delete_supplier(
    path: web::Path<Uuid>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let supplier_id = path.into_inner();

    let result = sqlx::query!("DELETE FROM suppliers WHERE id = $1", supplier_id)
        .execute(pool.get_ref())
        .await;

    match result {
        Ok(res) if res.rows_affected() > 0 => HttpResponse::NoContent().finish(),
        Ok(_) => HttpResponse::NotFound().body("Supplier not found"),
        Err(err) => {
            eprintln!("Erro ao deletar fornecedor: {:?}", err);
            HttpResponse::InternalServerError().finish()
        }
    }
}

// Configura rotas para este handler
pub fn config_suppliers(cfg: &mut web::ServiceConfig) {
    cfg.service(get_suppliers)
        .service(get_supplier_by_id)
        .service(create_supplier)
        .service(update_supplier)
        .service(delete_supplier);
}
