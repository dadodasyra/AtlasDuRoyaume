use actix_web::{web, App, HttpServer, HttpResponse};
struct Feature {
    id: u32,
    name: String,
    lat: f64,
    lng: f64,
    path: Option<Vec<(f64, f64)>>,
}
            features: vec![Feature { id: 1, name: "économat".into(), lat: 44.5955, lng: 5.01055, path: None }],
            features: vec![Feature {
                id: 2,
                name: "camp".into(),
                lat: 44.596,
                lng: 5.011,
                path: Some(vec![
                    (44.596, 5.011),
                    (44.596, 5.012),
                    (44.5955, 5.012),
                    (44.5955, 5.011),
                ]),
            }],
            features: vec![Feature { id: 3, name: "infirmerie".into(), lat: 44.5958, lng: 5.0107, path: None }],
use std::collections::HashMap;
use lazy_static::lazy_static;

#[derive(Serialize, Clone)]
struct Group {
    name: String,
    code: String,
}

#[derive(Deserialize)]
struct CreateGroupReq {
    name: String,
    nickname: String,
}

#[derive(Deserialize)]
struct CodeReq {
    code: String,
    nickname: String,
}

#[derive(Serialize)]
struct Feature {
    id: u32,
    name: String,
    lat: f64,
    lng: f64,
}

#[derive(Serialize)]
struct Layer {
    id: u32,
    name: String,
    center: (f64, f64),
    features: Vec<Feature>,
}

#[derive(Serialize)]
struct MapData {
    version: u32,
    layers: Vec<Layer>,
}

#[derive(Serialize)]
struct Troop {
    id: u32,
    name: String,
}

lazy_static! {
    static ref GROUPS: Mutex<Vec<Group>> = Mutex::new(Vec::new());
    static ref USER_GROUPS: Mutex<HashMap<String, Vec<String>>> = Mutex::new(HashMap::new());
}

fn generate_code() -> String {
    rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(6)
        .map(char::from)
        .collect::<String>()
        .to_uppercase()
}

async fn map_data() -> HttpResponse {
    let layers = vec![
        Layer {
            id: 1,
            name: "économats".into(),
            center: (44.5955, 5.01055),
            features: vec![Feature { id: 1, name: "économat".into(), lat: 44.5955, lng: 5.01055 }],
        },
        Layer {
            id: 2,
            name: "terrains de camps".into(),
            center: (44.5955, 5.01055),
            features: vec![Feature { id: 2, name: "camp".into(), lat: 44.596, lng: 5.011 }],
        },
        Layer {
            id: 3,
            name: "infirmerie".into(),
            center: (44.5955, 5.01055),
            features: vec![Feature { id: 3, name: "infirmerie".into(), lat: 44.5958, lng: 5.0107 }],
        },
    ];
    HttpResponse::Ok().json(MapData { version: 1, layers })
}

async fn create_group(req: web::Json<CreateGroupReq>) -> HttpResponse {
    let code = generate_code();
    let group = Group { name: req.name.clone(), code: code.clone() };
    GROUPS.lock().unwrap().push(group.clone());
    USER_GROUPS
        .lock()
        .unwrap()
        .entry(req.nickname.clone())
        .or_default()
        .push(code.clone());
    HttpResponse::Ok().json(group)
}

async fn join_group(req: web::Json<CodeReq>) -> HttpResponse {
    let groups = GROUPS.lock().unwrap();
    if groups.iter().any(|g| g.code == req.code) {
        drop(groups);
        USER_GROUPS
            .lock()
            .unwrap()
            .entry(req.nickname.clone())
            .or_default()
            .push(req.code.clone());
        HttpResponse::Ok().finish()
    } else {
        HttpResponse::NotFound().finish()
    }
}

async fn leave_group(req: web::Json<CodeReq>) -> HttpResponse {
    let mut map = USER_GROUPS.lock().unwrap();
    if let Some(list) = map.get_mut(&req.nickname) {
        list.retain(|c| c != &req.code);
    }
    HttpResponse::Ok().finish()
}

async fn list_groups(nick: web::Path<String>) -> HttpResponse {
    let nick = nick.into_inner();
    let map = USER_GROUPS.lock().unwrap();
    let codes = map.get(&nick).cloned().unwrap_or_default();
    drop(map);
    let groups = GROUPS.lock().unwrap();
    let result: Vec<Group> = groups
        .iter()
        .filter(|g| codes.contains(&g.code))
        .cloned()
        .collect();
    HttpResponse::Ok().json(result)
}

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
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header();

        App::new()
            .wrap(cors)
            .route("/map-data", web::get().to(map_data))
            .route("/troops", web::get().to(troops))
            .route("/group-code", web::post().to(create_code))
            .route("/groups", web::post().to(create_group))
            .route("/groups/join", web::post().to(join_group))
            .route("/groups/leave", web::post().to(leave_group))
            .route("/groups/{nick}", web::get().to(list_groups))
    })
    .bind(("127.0.0.1", 8000))?
    .run()
    .await
}
