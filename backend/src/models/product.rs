// Modelo de produto
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Product {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub price: f64,
    pub stock: i32,
}

#[derive(Debug, Deserialize)]
pub struct CreateProduct {
    pub name: String,
    pub description: Option<String>,
    pub price: f64,
    pub stock: i32,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProduct {
    pub name: String,
    pub description: Option<String>,
    pub price: f64,
    pub stock: i32,
}
