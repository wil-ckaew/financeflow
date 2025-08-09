use actix_web::{HttpRequest, Error};
use actix_web::dev::ServiceRequest;

pub async fn validate_token(req: ServiceRequest) -> Result<ServiceRequest, Error> {
    // Exemplo simples de autenticação via header
    if let Some(auth) = req.headers().get("Authorization") {
        if auth == "Bearer token123" {
            return Ok(req);
        }
    }

    Err(actix_web::error::ErrorUnauthorized("Unauthorized"))
}
