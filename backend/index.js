const fastify = require('fastify')({ logger: true, bodyLimit: 12485760});
require('dotenv').config();
const routes_images = require('./src/routes/images.js').default;

fastify.get("/", (request, reply) => {
    reply.send({ hello: "world" });
})

fastify.register(routes_images.get, { prefix: '/images' });
fastify.register(routes_images.post, { prefix: '/images' });
fastify.register(routes_images.get_image, { prefix: '/image' });

fastify.listen({port: process.env.PORT}, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Server listening on ${address}`);
});
