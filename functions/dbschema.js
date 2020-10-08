let db = {
    // users: [
    //     {
    //         username: 'fdafafjdakfdasf',
    //         email: 'user@email.com',
    //         handle: 'user',
    //         createdAt: '2020-09-18T13:49:18.602Z',
    //         imageUrl: 'image/fjdafdjafdkajf;da',
    //         bio: 'Hello, my name is user',
    //         website: 'https://user.com',
    //         location: 'London, UK'
    //     }
    // ],
    // screams: [
    //     {
    //         userHandle: 'user',
    //         body: "scream body",
    //         createdAt: '2020-09-18T13:49:18.602Z',
    //         likeCount: 5,
    //         commentCount: 2
    //     }
    // ],
    // comments: [
    //     {
    //         userHandle: 'user',
    //         screamId: 'djafdakfa',
    //         body: 'nice one mate!',
    //         createdAt: '2020-09-18T13:49:18.602Z',
    //     }
    // ],
    // notifications: [
    //     {
    //         recipient: 'user',
    //         sender: 'john',
    //         read: 'true | false',
    //         screamId: 'fjd;afjdalf',
    //         type: 'like | comment',
    //         createdAt: '2020-09-18T13:49:18.602Z',
    //     }
    // ]
    users: [
        {
            username: "admin",
            isAdmin: true,
        },
    ],
    files: [
        {
            metadata: {
                filesId: "jfdajf;alkfjda",
                fileType: "folder",
            },
            parentFile: "home",
            subfiles: ["fdafa", "pooio"],
        },
        {
            metadata: {
                filesId: "jfdajf;alkfjda",
                fileType: "content",
            },
            parentFile: "home",
            subfiles: ["fdafa", "pooio"],
            content: [
                {
                    contentType: "text",
                    style: "h1",
                    content: "hello world h1",
                },
                {
                    contentType: "text",
                    style: "p",
                    content: "hello world p",
                },
                {
                    contentType: "video",
                    caption: "this is a video",
                    content: "video.mp4",
                },
            ]
        },
    ],
};

const userDetails = {
    // redux data
    credentials: {
        userId: "fdafafjdakfdasf",
        email: "user@email.com",
        handle: "user",
        createdAt: "2020-09-18T13:49:18.602Z",
        imageUrl: "image/fjdafdjafdkajf;da",
        bio: "Hello, my name is user",
        website: "https://user.com",
        location: "London, UK",
    },
    likes: [
        {
            userHandle: "user",
            screamId: "fdjfafj;daokfjas;kfj",
        },
        {
            userHandle: "user",
            screamId: "jfaifdsakfj",
        },
    ],
};
