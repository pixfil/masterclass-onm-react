# Scripts utilitaires

## 🚀 Gestion du serveur de développement

### Redémarrer proprement le serveur
```bash
npm run restart
```
- Tue tous les processus Node.js
- Attend 2 secondes
- Redémarre sur le port 3000

### Tuer les processus Node.js
```bash
npm run kill
```

### Démarrer sur le port 3000
```bash
npm run dev:3000
```

## 🗃️ Exécution SQL sur Supabase

### Exécuter un fichier SQL
```bash
npm run sql nom-du-fichier.sql
```
**Exemple :**
```bash
npm run sql create-user-profiles-table.sql
npm run sql setup-storage.sql
```

### Exécuter une requête SQL rapide
```bash
npm run sql:quick "SELECT * FROM user_profiles LIMIT 5"
```

## 📋 Avantages

### Serveur :
- ✅ Toujours le même port (3000)
- ✅ Pas de processus fantômes
- ✅ Redémarrage propre et rapide

### SQL :
- ✅ Exécution directe depuis le terminal
- ✅ Pas besoin de copier-coller dans Supabase
- ✅ Affichage des résultats et erreurs
- ✅ Support des fichiers multi-requêtes

## ⚠️ Notes importantes

- Assurez-vous que vos variables d'environnement sont correctement configurées dans `.env.local`
- Certaines requêtes DDL (CREATE TABLE, etc.) peuvent nécessiter le dashboard Supabase
- Les scripts utilisent la clé de service pour les permissions admin