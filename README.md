# love-letter-server

## TODO

-   [x] Message de jeu (type: success/error)
-   [x] Checker les cartes avant leur utilisation (comtesse/princesse)
-   [x] Implémenter la logique de fin de manche
    -   [x] Checker après un cardplay s'il reste plus d'un joueur en lice
        -   [x] Il a gagné on peut lui ajouter un point et s'il dispose d'une espionne un deuxieme
    -   [x] Checker après un cardplay s'il reste au moins une carte
        -   [x] Recupère le vainquer en comparant la valeur de la main et on lui ajoute un point
        -   [x] Parmis les joueurs vivant on regarde ceux qui disposent d'une espionne
            -   [x] Si un seul joueur, on lui ajoute un point
            -   [x] Si deux joueurs différents, on ajoute pas de point
-   [x] Implémenter la logique du Prêtre ?
-   [ ] Implémenter le démarrage d'une nouvelle manche
-   [ ] Implémenter la logique de fin de partie
