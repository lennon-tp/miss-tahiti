# Miss Tahiti 2026 - Application de vote

Application Next.js de vote pour l'élection Miss Tahiti 2026.

## Stack technique

- **Frontend / Backend** : Next.js 15 (App Router, TypeScript)
- **Base de données** : MySQL 8.0
- **Sessions** : iron-session (cookies chiffrés)
- **Passwords** : bcryptjs
- **Conteneurisation** : Docker + Docker Compose

---

## Prérequis

- Docker et Docker Compose installés sur le serveur
- Image `mysql:8.0` disponible (déjà présente selon `docker images`)
- Image `node:21-alpine` disponible (utilisée en base du Dockerfile)

---

## Structure du projet

```
miss-tahiti/
├── app/
│   ├── api/
│   │   ├── candidates/route.ts   # GET  /api/candidates
│   │   ├── login/route.ts        # POST /api/login
│   │   ├── logout/route.ts       # POST /api/logout
│   │   ├── me/route.ts           # GET  /api/me
│   │   ├── register/route.ts     # POST /api/register
│   │   ├── vote/route.ts         # GET  /api/vote  POST /api/vote
│   │   └── votes/route.ts        # GET  /api/votes (stats publiques)
│   ├── components/
│   │   ├── CandidateCard.tsx
│   │   ├── Header.tsx
│   │   └── VoteModal.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── resultats/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Page d'accueil
├── lib/
│   ├── db.ts                     # Pool MySQL
│   ├── session.ts                # iron-session
│   └── types.ts                  # Types TypeScript partagés
├── public/
│   └── candidates/               # Photos des candidates (candidate-1.jpg ... candidate-10.jpg)
├── sql/
│   └── init.sql                  # Schéma + données initiales
├── .env
├── Dockerfile
├── docker-compose.yml
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Démarrage

### 1. Configurer les variables d'environnement

```bash
# Copier et éditer le fichier .env
cp .env .env.local     # optionnel, .env est déjà utilisé par docker-compose

# Générer un secret de session sécurisé
openssl rand -hex 32
# Copier la valeur dans SESSION_SECRET dans .env
```

### 2. Ajouter les photos des candidates

Placer les photos dans `public/candidates/` avec les noms :
```
candidate-1.jpg  à  candidate-10.jpg
```
Format recommandé : JPEG, ratio portrait (3:4), 400x530px minimum.

### 3. Build et démarrage avec Docker

```bash
# Build de l'image et démarrage des containers
sudo docker compose build
sudo docker compose up -d

# Vérifier que tout tourne
sudo docker compose ps
sudo docker compose logs -f
```

L'application sera accessible sur **http://votre-serveur:9452**

### 4. Stopper l'application

```bash
sudo docker compose down

# Pour supprimer aussi le volume MySQL (ATTENTION : perte des données)
sudo docker compose down -v
```

---

## Développement local (sans Docker)

```bash
npm install

# Renseigner les variables d'environnement (adapter DB_HOST=localhost)
# S'assurer qu'un MySQL tourne en local et créer la base manuellement :
#   mysql -u root -p < sql/init.sql

npm run dev
# Disponible sur http://localhost:9452
```

---

## Routes API

| Méthode | Route           | Auth requise | Description                          |
|---------|-----------------|:------------:|--------------------------------------|
| POST    | /api/register   | Non          | Inscription (prenom unique + hash)   |
| POST    | /api/login      | Non          | Connexion, création de session       |
| POST    | /api/logout     | Non          | Destruction de session               |
| GET     | /api/me         | Oui          | Infos utilisateur connecté           |
| GET     | /api/candidates | Non          | Liste des 10 candidates              |
| GET     | /api/vote       | Oui          | Vote actuel de l'utilisateur         |
| POST    | /api/vote       | Oui          | Enregistrer / modifier un vote       |
| GET     | /api/votes      | Non          | Statistiques publiques de votes      |

### Body de POST /api/vote

```json
{
  "candidateId": 1,
  "category": "miss_tahiti"
}
```

Valeurs possibles pour `category` :
- `miss_tahiti`
- `premiere_dauphine`
- `deuxieme_dauphine`
- `miss_heiva`

---

## Règles métier des votes

- Un utilisateur ne peut voter qu'une seule fois par catégorie.
- Si l'utilisateur vote à nouveau pour la même catégorie, l'ancien choix est remplacé.
- Une même candidate ne peut pas être choisie dans deux catégories différentes par le même utilisateur.
