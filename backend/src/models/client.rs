// Modelo de cliente
use serde::{Serialize, Deserialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Client {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub phone: String,
}
