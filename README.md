# BlogAtlas #

Version : 0.4

NodeAtlas Version minimale : 1.0.x

**For an international version of this README.md, [see below](#international-version).**



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
\> mongoimport -d blog -c article --file </path/to/blog/>databases/article.json
```

```
\> mongoimport -d blog -c category --file </path/to/blog/>databases/category.json
```

Déplacez vous ensuite dans le dossier :


```
\> cd </path/to/blog/>
```

et utilisez la commande :

```
\> node </path/to/node-atlas/> --browse
```

ou lancez `server.na` en double cliquant dessus :
- en expliquant à votre OS que les fichiers `.na` sont lancé par défaut par `node`,
- en ayant installé `node-atlas` via `npm install -g node-atlas`
- en étant sur que votre variable d'environnement `NODE_PATH` pointe bien sur le dossier des `node_modules` globaux.

Le site sera accessible ici :

- *http://localhost:7777/*



## Exemple en ligne ##

Vous pouvez voir fonctionner ce repository à l'adresse : [http://blog.lesieur.name/](http://blog.lesieur.name/).



## Tester en HTTPs ##

Pour tester la version HTTPs du site, lancer la commande suivante :

```
\> node </path/to/node-atlas/> --browse --webconfig webconfig.https.json
```

Quand « PEM pass phrase: » s'affiche, tapez « jaime ». Votre navigateur vous dira que votre site local n'est pas sur, ignorez le message !



-----


## International Version ##

### Overview ###

BlogAtlas is an example of Node.js website running with [NodeAtlas](http://haeresis.github.io/NodeAtlas/).

It used as inspiration to create your own website!

To better understand the JavaScript site architecture, [you can read this article](http://blog.lesieur.name/structurer-le-javascript-de-son-site-avec-ou-sans-framework/) (Fr).



### Run the website in local server ###

To run the website in local, you must install [NodeAtlas](http://haeresis.github.io/NodeAtlas/) on your development machine.

You will also need to install:
- a MongoDB database on the application server.
- a Redis database on the application server.

Then fill the local MongoDB database with the following commands:

```
\> mongoimport -d blog -c article --file </path/to/blog/>databases/article.json
```

```
\> mongoimport -d blog -c category --file </path/to/blog/>databases/category.json
```

Then you move into the folder:


```
\> cd </path/to/blog/>
```

and use the command:

```
\> node </path/to/node-atlas/> --browse
```

or run `app.na` by double clicking and:
- explaining your OS that `.na` files are run by default with `node`,
- Having installed `node-atlas` via `npm install -g node-atlas`
- Being on your environment variable `NODE_PATH` is pointing to the global `node_modules` folder.

The website will be to:

- *http://localhost:7777/*



### Online Example ###

You can see this repository running at: [http://blog.lesieur.name/](http://blog.lesieur.name/).



## Test with HTTPs ##

For test HTTPs version of website, run the following command :

```
\> node </path/to/node-atlas/> --browse --webconfig webconfig.https.json
```

When « PEM pass phrase: » is displayed, enter « jaime ». Your browser will say the local website is not safe, ignore this message !