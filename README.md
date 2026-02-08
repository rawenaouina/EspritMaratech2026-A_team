# SoliCare — Frontend (React + Vite)

## Démarrage
1) Copier `.env.example` vers `.env` et mettre l'URL du backend :
```
VITE_API_URL=http://localhost:3000
```

2) Installer et lancer :
```
npm install
npm run dev
```

## Features (Hackathon-ready)
- FR/AR + RTL
- Mode Jour/Nuit
- Mode Accessibilité (texte + grands boutons)
- Contraste + Luminosité (sliders)
- Workflow Cas vérifié (PENDING → APPROVED/REJECTED)
- Urgences du jour
- QR code Don (image `src/assets/cha9a9a-qr.png`) + QR Partage
- Map (Leaflet/OSM) si lat/lng dispo
- Dashboard Admin (stats + modération)
- Dashboard Association (mes cas)
- Formulaire association + Assistant IA (MVP mock) + détection infos sensibles

## Assets requis
- `src/assets/universelle-logo.png`
- `src/assets/cha9a9a-qr.png`


---

# Backend (Node + Express + LowDB)

## Démarrage
Dans `backend/` :
```bash
npm install
npm start
```

Par défaut:
- API: http://localhost:3000
- Front: http://localhost:5174 (modifiable via `FRONTEND_URL`)

## Comptes de démo
- Admin: `admin@solicare.tn` / `admin123`
- Association: `association@solicare.tn` / `assoc123`
- Donateur: `donor@solicare.tn` / `donor123`

## Données
Au premier lancement, la base JSON est créée dans `backend/data/db.json` avec 2 cas approuvés + mis en avant (pour avoir une démo “wow” immédiatement).

## Endpoints clés
- Public:
  - `GET /api/cases` (filtres `q,category,urgency,sort,page,limit`)
  - `GET /api/cases/:id`
  - `GET /api/cases/featured`
- Association:
  - `POST /api/cases` (soumission PENDING)
  - `GET /api/me/cases`
- Admin:
  - `GET /api/admin/cases?status=PENDING|APPROVED|REJECTED`
  - `PATCH /api/admin/cases/:id/status`
  - `GET /api/admin/metrics` (graphes)
- AI (offline):
  - `POST /api/ai/chat`
  - `POST /api/ai/match`
  - `POST /api/ai/admin-review` (admin only)
