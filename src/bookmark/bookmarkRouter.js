const express = require('express');
const { v4: uuid } = require('uuid');
const logger = require('../logger');
const bookmarks = require('../dataStore');

const bookmarkRouter = express.Router();

bookmarkRouter.use(express.json());

bookmarkRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.json(bookmarks);
    })
    .post((req, res) => {
        const { title, url, description, rating } = req.body;
        if (!title || !url || !description || !rating) {
            logger.error('Missing data = title/url/description/rating');
            return res
                .status(400)
                .send('Invalid Data');
        }

        const id = uuid();

        const bookmark = {
            id,
            title,
            url,
            description,
            rating
        };

        bookmarks.push(bookmark);

        logger.info(`Created Bookmark with and id of ${id}`);
        res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${id}`)
            .json(bookmark);
    });

bookmarkRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
        const { id } = req.params;
        const target = bookmarks.find(b => b.id == id);

        if (!target) {
            logger.error(`Could not find bookmark with id of ${id}`);
            return res
                .status(404)
                .send('404 Not Found');
        }

        res.json(target);
    })
    .delete((req, res) => {
        const { id } = req.params;

        const bookmarkIndex = bookmarks.findIndex(b => b.id == id);

        if (bookmarkIndex === -1) {
            logger.error(`Bookmark id ${id} does not exist`);
            return res
                .status(404)
                .send('Bookmark not found');
        }

        bookmarks.splice(bookmarkIndex, 1);

        logger.info(`Deleted bookmark with id of ${id}`);

        res
            .status(204)
            .end();
    });

module.exports = bookmarkRouter;