use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::NaiveDate;

#[derive(Serialize, Deserialize, sqlx::FromRow)]
pub struct Payment {
    pub id: Uuid,
    pub expense_id: Option<Uuid>,
    pub payment_date: Option<NaiveDate>,
    pub amount: f64,
    pub method: Option<String>,
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
