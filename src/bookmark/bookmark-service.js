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
    },
    insertBookmark(knex, newBookmark) {
        return knex
            .insert(newBookmark)
            .into('bookmarks_store')
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },
    deleteBookmark(knex, id) {
        return knex
            .from('bookmarks_store')
            .where({ id })
            .delete();
    },
    updateBookmark(knex, id, newBookmarkFields) {
        return knex
            .from('bookmarks_store')
            .where({ id })
            .update(newBookmarkFields);
    }
};

module.exports = BookmarksService;