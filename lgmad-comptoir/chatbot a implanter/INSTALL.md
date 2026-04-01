# Chatbot LGm@d — Guide d'installation

Widget flottant avec les modes **Comptoir** (patients) et **Gestion** (pharmaciens).
Compatible avec tout projet **Next.js App Router**.

---

## 1. Copier les fichiers

```
votre-projet/
├── src/
│   ├── app/
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts        ← depuis api/chat/route.ts
│   ├── components/
│   │   └── ChatWidget.tsx          ← depuis components/ChatWidget.tsx
│   ├── lib/
│   │   └── prompts.ts              ← depuis lib/prompts.ts
│   └── types/
│       └── chat.ts                 ← depuis types/chat.ts
└── styles/
    └── chatbot.css                 ← depuis styles/chatbot.css
```

> Ajustez les imports dans `route.ts` et `ChatWidget.tsx` selon votre structure.

---

## 2. Variable d'environnement

Créez (ou complétez) le fichier `.env.local` à la racine du projet :

```
MISTRAL_API_KEY=votre_clé_mistral_ici
```

Obtenez une clé sur [console.mistral.ai](https://console.mistral.ai).

---

## 3. Importer le CSS

Dans votre `globals.css` (ou équivalent) :

```css
@import '../styles/chatbot.css';
```

---

## 4. Ajouter le widget

Dans votre layout ou n'importe quelle page :

```tsx
import ChatWidget from '@/components/ChatWidget';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <ChatWidget />
    </>
  );
}
```

Le bouton flottant apparaît en bas à droite. Cliquez dessus pour ouvrir le chat.
Le widget est déplaçable par glisser-déposer sur la page.

---

## Modèles utilisés

| Mode     | Modèle Mistral          |
|----------|-------------------------|
| Comptoir | mistral-large-latest    |
| Gestion  | mistral-small-latest    |
