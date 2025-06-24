use std::fs;
#[derive(Serialize, Deserialize, Clone)]
#[derive(Serialize, Deserialize, Clone)]
struct Layer {
    id: u32,
    name: String,
    icon: String,
    center: (f64, f64),
    features: Vec<Feature>,
}
#[derive(Serialize, Deserialize, Default)]
struct Data {
    groups: Vec<Group>,
    user_groups: HashMap<String, Vec<String>>, // nickname -> codes
}

fn load_data() -> Data {
    if let Ok(contents) = fs::read_to_string("data.json") {
        if let Ok(d) = serde_json::from_str::<Data>(&contents) {
            return d;
        }
    }
    Data::default()
}

fn save_data(data: &Data) {
    if let Ok(json) = serde_json::to_string(data) {
        let _ = fs::write("data.json", json);
    }
}

            icon: "🏦".into(),
            icon: "⛺".into(),
            icon: "🏥".into(),
#[derive(Serialize, Deserialize, Clone)]
#[derive(Deserialize)]
struct NickReq { nickname: String }

    static ref DATA: Mutex<Data> = Mutex::new(load_data());
    let mut data = DATA.lock().unwrap();
    data.groups.push(group.clone());
    data.user_groups
    save_data(&data);
    let mut data = DATA.lock().unwrap();
    if data.groups.iter().any(|g| g.code == req.code) {
        data
            .user_groups
        save_data(&data);

async fn register_user(req: web::Json<NickReq>) -> HttpResponse {
    let mut data = DATA.lock().unwrap();
    data.user_groups.entry(req.nickname.clone()).or_default();
    save_data(&data);
    HttpResponse::Ok().finish()
}

    let mut data = DATA.lock().unwrap();
    if let Some(list) = data.user_groups.get_mut(&req.nickname) {
    save_data(&data);

    let data = DATA.lock().unwrap();
    let codes = data.user_groups.get(&nick).cloned().unwrap_or_default();
    let result: Vec<Group> = data
        .groups
            .route("/users", web::post().to(register_user))
        Layer {
            id: 1,
            name: "économats".into(),
            center: (44.5955, 5.01055),
            features: vec![Feature { id: 1, name: "économat".into(), lat: 44.5955, lng: 5.01055, path: None }],
        },
        Layer {
            id: 2,
            name: "terrains de camps".into(),
            center: (44.5955, 5.01055),
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
        },
        Layer {
            id: 3,
            name: "infirmerie".into(),
            center: (44.5955, 5.01055),
            features: vec![Feature { id: 3, name: "infirmerie".into(), lat: 44.5958, lng: 5.0107, path: None }],
        },
    ];
    HttpResponse::Ok().json(MapData { version: 2, layers })
}

#[derive(Serialize)]
struct Troop { id: u32, name: String }

async fn troops() -> HttpResponse {
    HttpResponse::Ok().json(vec![Troop { id: 1, name: "Louveteaux".into() }])
}

#[derive(Serialize, Clone)]
struct Group { name: String, code: String }

#[derive(Deserialize)]
struct CreateGroupReq { name: String, nickname: String }

#[derive(Deserialize)]
struct CodeReq { code: String, nickname: String }

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
            .route("/groups", web::post().to(create_group))
            .route("/groups/join", web::post().to(join_group))
            .route("/groups/leave", web::post().to(leave_group))
            .route("/groups/{nick}", web::get().to(list_groups))
    })
        .bind(("127.0.0.1", 8000))?
        .run()
        .await
}