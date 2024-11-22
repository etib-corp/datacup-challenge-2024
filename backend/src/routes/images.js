import fs from "fs";

const router_images = (fastify, opts, done) => {
    fastify.post("/", async (request, reply) => {
        const { filename, data } = request.body;
        const buffer = Buffer.from(data, "base64");
        fs.writeFileSync(`./images/${filename}`, buffer);
        reply.send({ message: "Image saved!", code : 200 });
    });
    done();
}

export default router_images;
