# BlogAtlas #

Version : 0.9.0 (Beta)



## Avant-propos ##

BlogAtlas est un exemple de site web Node.js développé avec [NodeAtlas](http://haeresis.github.io/NodeAtlas/).

Il peut vous servir d'inspiration pour créer vos propres sites !



## Lancer le site en local ##

Pour faire tourner le site en local, il vous faudra installer [NodeAtlas](http://haeresis.github.io/NodeAtlas/) sur votre poste de développement.

Vous devrez également installer une base de donnée MongoDB.

Ensuite remplissez la base de donnée MongoDB local avec les commandes suivantes :

```
\> mongoimport -d blog -c article --file </path/to/blog>/databases/article.json
```

```
\> mongoimport -d blog -c category --file </path/to/blog>/databases/category.json
```

Déplacez vous ensuite dans le dossier :


```
\> cd </path/to/blog>
```

et utilisez la commande :

```
\> node </path/to/>node-atlas/node-atlas.js --run
```

Le site sera accessible ici :

- *http://localhost:7777/*



## Exemple en ligne ##

Vous pouvez voir fonctionner ce repository ê l'adresse : [http://blog.lesieur.name/](http://blog.lesieur.name/).