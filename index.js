const http = require('http');
const MongoClient = require("mongodb").MongoClient;

const mongoClient = new MongoClient("mongodb://mongodb-server:27017/");

const run = async () => {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("counter");
        const collection = db.collection("counter");
        let c = await collection.findOne({type: "counter"})
        if (!c) {
            await collection.insertOne({type:"counter", value: 0});
        }
        const server = new http.Server();
        server
            .on('request', async (req, res) => {
                if (req.url == '/') {
                    // (возвращается текущее значение счётчика, инкремента не происходит);
                    collection.findOne({type: "counter"})
                        .then((doc) => res.end(String(doc.value)));
                        // .then((doc) => res.end('String'));
                } else if (req.url == '/stat') {
                    // (возвращается текущее значение счётчика, и происходит инкремент);
                    collection.findOne({type: "counter"})
                        .then((doc) => {
                            res.end(String(doc.value));
                            const newValue = doc.value + 1;
                            collection.updateOne(
                                { type: "counter" },
                                { $set: { value: newValue } }
                            )
                        });
                } else if (req.url == '/about') {
                    // (возвращается html-страничка)
                    res.writeHeader(200, { "Content-Type": "text/html" });
                    html = '<h3> Hello , Biziarkin Iaroslav! Hello World! </h3>';
                    res.write(html);
                    res.end();
                } else {
                    // все остальное
                    res.end('404');
                }
            })
            .listen(port=8080, hostname='0.0.0.0');
    } catch (error) {
        console.log(error)
    } 
}

run()