let db = {
    users: [
        {
            userId: 'fdafafjdakfdasf',
            email: 'user@email.com',
            handle: 'user',
            createdAt: '2020-09-18T13:49:18.602Z',
            imageUrl: 'image/fjdafdjafdkajf;da',
            bio: 'Hello, my name is user',
            website: 'https://user.com',
            location: 'London, UK'
        }
    ],
    screams: [
        {
            userHandle: 'user',
            body: "scream body",
            createdAt: '2020-09-18T13:49:18.602Z',
            likeCount: 5,
            commentCount: 2
        }
    ],
    comments: [
        {
            userHandle: 'user',
            screamId: 'djafdakfa',
            body: 'nice one mate!',
            createdAt: '2020-09-18T13:49:18.602Z',
        }
    ],
    notifications: [
        {
            recipient: 'user',
            sender: 'john',
            read: 'true | false',
            screamId: 'fjd;afjdalf',
            type: 'like | comment',
            createdAt: '2020-09-18T13:49:18.602Z',
        }
    ]
}

const userDetails = {
    // redux data
    credentials: {
        userId: 'fdafafjdakfdasf',
        email: 'user@email.com',
        handle: 'user',
        createdAt: '2020-09-18T13:49:18.602Z',
        imageUrl: 'image/fjdafdjafdkajf;da',
        bio: 'Hello, my name is user',
        website: 'https://user.com',
        location: 'London, UK'
    },
    likes: [
        {
            userHandle: 'user',
            screamId: 'fdjfafj;daokfjas;kfj'
        },
        {
            userHandle: 'user',
            screamId: 'jfaifdsakfj'
        }
    ]
}