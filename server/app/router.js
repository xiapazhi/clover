'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
    const { router, controller, io } = app;
    const { content, comment, verification } = controller

    router.post('/publish', content.publish);
    router.post('/upload/img', content.uploadImg);
    router.get('/content', content.get);
    router.post('/content/manner', content.onManner);

    router.post('/comment', comment.comment);
    router.get('/comment', comment.get);

    router.get('/verificationCode', verification.generateVerificationCode);

    // socket.io
    io.of('/clover').route('test_ping', io.controller.default.ping);
};
