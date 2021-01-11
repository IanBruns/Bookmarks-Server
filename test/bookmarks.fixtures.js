function makeBookmarkArray() {
    return [
        {
            id: 1,
            title: 'google',
            url: 'google.com',
            description: 'literally google',
            rating: 5
        },
        {
            id: 2,
            title: 'blaseball',
            url: 'blaseball.com',
            description: 'The commissioner is doing a great job',
            rating: 5
        },
        {
            id: 3,
            title: 'Homestar Runner',
            url: 'homestarrunner.com',
            description: 'Doing a great jorb out there, stairmaster',
            rating: 4
        }
    ];
}

function makeMaliciousBookmark() {
    const maliciousBookmark = {
        id: 911,
        title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        url: '`Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`',
        rating: 1
    };
    const expectedBookmark = {
        ...maliciousBookmark,
        title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        url: '`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`',
        rating: 1
    };
}

module.exports = {
    makeBookmarkArray,
    makeMaliciousBookmark
};