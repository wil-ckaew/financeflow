use actix_web::web::ServiceConfig;

pub mod client_handler;
pub mod product_handler;
pub mod sale_handler;
pub mod suppliers_handler;
pub mod reports_handler;
pub mod expense_handler;
pub mod payment_handler;

use actix_web::web;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .configure(client_handler::config_clients)
            .configure(product_handler::config_produtos)
            .configure(sale_handler::config_sale)
            .configure(suppliers_handler::config_suppliers)
            .configure(expense_handler::config_expenses)
            .configure(payment_handler::config_payments)
            .configure(reports_handler::config_reports),
    );
}
