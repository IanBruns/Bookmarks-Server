const BookmarksService = {
    getAllBookmarks(knex) {
        return knex.select('*').from('bookmarks_store');
    },
    getById(knex, id) {
        return knex
            .from('bookmarks_store')
            .select('*')
            .where('id', id)
            .first();
    }
};

module.exports = BookmarksService;