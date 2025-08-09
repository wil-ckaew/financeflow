use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::{NaiveDate, NaiveDateTime};

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Expense {
    pub id: Uuid,
    pub description: String,
    pub supplier_id: Option<Uuid>,
    pub amount: f64,
    pub due_date: NaiveDate,
    pub paid: bool,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateExpense {
    pub description: String,
    pub supplier_id: Option<Uuid>,
    pub amount: f64,
    pub due_date: NaiveDate,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateExpense {
    pub description: Option<String>,
    pub supplier_id: Option<Uuid>,
    pub amount: Option<f64>,
    pub due_date: Option<NaiveDate>,
    pub paid: Option<bool>,
}
