use don_core::{DonServer, DonHooks, axum::Router};
use don_macros::DonModel;
use serde::{Deserialize, Serialize};

// ==========================================
// 1. Define your Database Model (Auto-generates CRUD)
// ==========================================
#[derive(Debug, Clone, Serialize, Deserialize, don_core::sqlx::FromRow, DonModel)]
pub struct Product {
    pub id: i32, 
    pub name: String,
    pub price: i32,
}

// ==========================================
// 2. Implement Lifecycle Hooks (Custom Validation & Modification)
// ==========================================
impl DonHooks for Product {
    async fn before_save(&mut self) -> Result<(), String> {
        
        // Custom Validation: Reject negative or zero prices
        if self.price <= 0 {
            return Err("Validation Error: Price must be greater than 0!".to_string());
        }

        // Data Modification: Auto-capitalize the product name before saving
        self.name = self.name.trim().to_uppercase();

        Ok(()) // If everything is fine, proceed to save in the database
    }
}

// ==========================================
// 3. Main Function (Start the Server)
// ==========================================
#[tokio::main]
async fn main() {
    // Load environment variables (.env)
    dotenvy::dotenv().ok();
    println!("App Starting with Hooks...");

    // Define the API routes for the Product model
    let api_routes = Router::new()
        .nest("/api/products", Product::get_api_routes());

    // Start the Don Server
    DonServer::new()
        .port(8080)
        .with_routes(api_routes) // Pass the defined routes here
        .start()
        .await
        .expect("Server crashed!");
}