# Politique de sécurité

## Versions prises en charge

| Version        | Statut         |
|----------------|----------------|
| 1.0.5          |    Maintenue   |
| < 1.0.4        |  Non maintenue |

Seules les versions officielles à partir dee **1.0.5** sont activement maintenues.  
Les anciennes versions peuvent contenir des vulnérabilités non corrigées.

---

## Signaler une vulnérabilité

Si vous découvrez une faille de sécurité ou un comportement potentiellement dangereux dans **Mxlw Browser**, **merci de ne pas ouvrir un ticket public**.
Veuillez contacter directement le développeur :
**contact@maxlware.fr**

Merci d'inclure :

- Une description claire et précise du problème
- Les étapes pour reproduire (si possible)
- L'impact potentiel et la gravité estimée
- Votre environnement (OS, version du navigateur, etc.)

---

## Délais de réponse

Nous nous engageons à répondre à tout signalement **dans un délai de 3 jours ouvrés**, avec un suivi régulier jusqu’à la résolution.

---

## Bonnes pratiques pour les contributeurs

Merci de respecter ces recommandations de sécurité lors de vos contributions :

- Évitez `nodeIntegration: true` sauf si absolument nécessaire
- Préférez l’utilisation de `contextBridge` dans `preload.js`
- Nettoyez (sanitize) toutes les entrées utilisateur et les URLs
- Ne jamais utiliser `eval()` ou `new Function()`
- Désactivez `window.open` si non utilisé
- Maintenez toutes les dépendances à jour

---

## Divulgation responsable

Nous encourageons une **divulgation responsable**.  
Si la faille concerne également d'autres projets Electron, veuillez aussi la signaler à :
[Electron Security Reporting](https://www.electronjs.org/security)

---

## Références utiles

- [Guide de sécurité Electron (FR)](https://www.electronjs.org/docs/latest/tutorial/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Recommandations Mozilla](https://infosec.mozilla.org/guidelines/web_security.html)

---

**Maintenu par [Maxlware](https://maxlware.fr)**  
Licence : [Mozilla Public License 2.0](https://www.mozilla.org/en-US/MPL/2.0/)
