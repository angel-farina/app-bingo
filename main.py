from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import random
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 🚀 Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# rutas estáticas y plantillas
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Estado del bingo
bolillas_disponibles = list(range(1, 91))  # Bingo de 90 números
random.shuffle(bolillas_disponibles)
bolillas_salidas = []

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={}
    )

@app.get("/iniciar_bingo/")
async def iniciar_bingo():
    """Reinicia el juego con todas las bolillas disponibles"""
    global bolillas_disponibles, bolillas_salidas
    bolillas_disponibles = list(range(1, 91))
    bolillas_salidas = []
    random.shuffle(bolillas_disponibles)
    return JSONResponse({
        "mensaje": "✅ Bingo (90) iniciado",
        "total": len(bolillas_disponibles)
    })

@app.get("/sacar_bolilla/")
async def sacar_bolilla():
    """Saca una bolilla al azar"""
    global bolillas_disponibles, bolillas_salidas
    
    if not bolillas_disponibles:
        return JSONResponse({
            "error": "No quedan más bolillas",
            "mensaje": "🎊 ¡Bingo completo!"
        })
    
    bolilla = bolillas_disponibles.pop(0)
    bolillas_salidas.append(bolilla)
    
    return JSONResponse({
        "bolilla": bolilla,
        "restantes": len(bolillas_disponibles),
        "salidas": bolillas_salidas
    })

@app.get("/estado/")
async def obtener_estado():
    """Obtiene el estado actual del bingo"""
    return JSONResponse({
        "restantes": len(bolillas_disponibles),
        "salidas": bolillas_salidas,
        "total": 90
    })