// Modelo de venda
// src/models/sale.rs
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use sqlx::FromRow;
use chrono::{DateTime, NaiveDateTime, Utc};


#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Sale {
    pub id: Uuid,
    pub product_id: Uuid,
    pub product_name: String,
    pub quantity: i32,
    pub total_price: f64,
    pub created_at: Option<NaiveDateTime>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateSaleSchema {
    pub product_id: Uuid,
    pub quantity: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateSaleSchema {
    pub quantity: Option<i32>,
}
