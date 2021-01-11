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

module.exports = {
    makeBookmarkArray
};