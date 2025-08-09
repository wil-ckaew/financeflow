use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::NaiveDate;

#[derive(Serialize, Deserialize)]
pub struct CreateClient {
    pub name: String,
    pub email: String,
    pub phone: String,
}

#[derive(Deserialize)]
pub struct UpdateClient {
    pub name: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct CreateProduct {
    pub name: String,
    pub description: Option<String>,
    pub price: f64,
    pub stock: i32,
}

#[derive(Deserialize)]
pub struct UpdateProduct {
    pub name: Option<String>,
    pub description: Option<String>,
    pub price: Option<f64>,
    pub stock: Option<i32>,
}

#[derive(Serialize, Deserialize)]
pub struct CreateSale {
    pub product_id: Uuid,
    pub quantity: i32,
}

#[derive(Deserialize)]
pub struct UpdateSale {
    pub product_id: Option<Uuid>,
    pub quantity: Option<i32>,
}

#[derive(Deserialize)]
pub struct CreateSupplier {
    pub name: String,
    pub email: Option<String>,
    pub phone: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdateSupplier {
    pub name: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
}

#[derive(Deserialize)]
pub struct CreatePayment {
    pub expense_id: Option<Uuid>,
    pub payment_date: Option<NaiveDate>,
    pub amount: f64,
    pub method: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdatePayment {
    pub expense_id: Option<Uuid>,
    pub payment_date: Option<NaiveDate>,
    pub amount: Option<f64>,
    pub method: Option<String>,
}
