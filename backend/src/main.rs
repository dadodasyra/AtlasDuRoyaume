use actix_web::{web, App, HttpServer, HttpResponse};
use rand::{distributions::Alphanumeric, Rng};
use serde::Serialize;

#[derive(Serialize)]
struct Feature { id: u32, name: String, lat: f64, lng: f64 }

#[derive(Serialize)]
struct Layer { id: u32, name: String, center: (f64, f64), features: Vec<Feature> }

#[derive(Serialize)]
struct MapData { version: u32, layers: Vec<Layer> }

async fn map_data() -> HttpResponse {
    let layer = Layer {
        id: 1,
        name: "Campement".into(),
        center: (45.0, 5.0),
        features: vec![Feature { id: 1, name: "Entrée".into(), lat: 45.0, lng: 5.0 }],
    };
    HttpResponse::Ok().json(MapData { version: 1, layers: vec![layer] })
}

#[derive(Serialize)]
struct Troop { id: u32, name: String }

async fn troops() -> HttpResponse {
    HttpResponse::Ok().json(vec![Troop { id: 1, name: "Louveteaux".into() }])
}

async fn create_code() -> HttpResponse {
    let code: String = rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(6)
        .map(char::from)
        .collect::<String>()
        .to_uppercase();
    HttpResponse::Ok().body(code)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/map-data", web::get().to(map_data))
            .route("/troops", web::get().to(troops))
            .route("/group-code", web::post().to(create_code))
    })
    .bind(("127.0.0.1", 8000))?
    .run()
    .await
}
