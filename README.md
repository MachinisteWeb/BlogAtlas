# BlogAtlas #

Version : 0.10.0 (Beta)
NodeAtlas Version : 0.19.x





## Avant-propos ##

BlogAtlas est un exemple de site web Node.js développé avec [NodeAtlas](http://haeresis.github.io/NodeAtlas/).

Il peut vous servir d'inspiration pour créer vos propres sites !

Pour mieux comprendre l'architecture JavaScript du site, [vous pouvez lire cet article](http://blog.lesieur.name/structurer-le-javascript-de-son-site-avec-ou-sans-framework/).





## Lancer le site en local ##

Pour faire tourner le site en local, il vous faudra installer [NodeAtlas](http://haeresis.github.io/NodeAtlas/) sur votre poste de développement.

Vous devrez également installer :
- une base de donnée MongoDB sur le serveur de l'application.
- une base de donnée Redis sur le serveur de l'application.

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

Vous pouvez voir fonctionner ce repository à l'adresse : [http://blog.lesieur.name/](http://blog.lesieur.name/).