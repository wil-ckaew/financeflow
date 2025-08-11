// Modelo de cliente
//src/models/client.rs
use serde::{Serialize, Deserialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct Client {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub phone: String,
}
