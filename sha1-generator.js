var Hashes = require("jshashes"),
	SHA1 = new Hashes.SHA1();


console.log(SHA1.hex("bépo")); // Password // bépo => a39e06042c77594c75b534030ec36e2bbc3cdaaa