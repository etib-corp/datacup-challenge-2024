import fs from "fs";
import exifreader from "exifreader";

let router_images = {};
router_images.post = (fastify, opts, done) => {
    fastify.post("/", async (request, reply) => {
        const { filename, data } = request.body;
        const buffer = Buffer.from(data, "base64");
        fs.writeFileSync(`./images/${filename}`, buffer);
        reply.send({ message: "Image saved!", code : 200 });
    });
    done();
}

router_images.get = (fastify, opts, done) => {
    fastify.get("/", async (request, reply) => {
        let files = fs.readdirSync("./images");
        files.forEach((file, index) => {
            const buffer = fs.readFileSync(`./images/${file}`);
            const tags = exifreader.load(buffer);
            console.log(tags);
            files[index] = { filename: file, dimensions: { width: tags["Image Width"].value, height: tags["Image Height"].value } };
        });
        reply.send({ files, code : 200 });

    });
    done();
}

router_images.get_image = (fastify, opts, done) => {
    fastify.get("/:filename", async (request, reply) => {
        const { filename } = request.params;
        const buffer = fs.readFileSync(`./images/${filename}`);
        reply.send(buffer);
    });
    done();
}

export default router_images;
