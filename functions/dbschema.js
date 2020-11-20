// Database design
// https://firebase.google.com/docs/database/web/structure-data#avoid_nesting_data

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
  // files: [
  //   {
  //     fileId: "home",
  //     type: "folder",
  //     parent: "home",
  //     createdAt: "2020-09-18T13:49:18.602Z",
  //     lastModified: "2020-09-18T13:49:18.602Z",
  //     title: "Home folder",
  //   },
  //   {
  //     fileId: "folder2",
  //     type: "folder",
  //     parent: "home",
  //     createdAt: "2020-09-18T13:49:18.602Z",
  //     lastModified: "2020-09-18T13:49:18.602Z",
  //     title: "Folder 2",
  //   },
  //   {
  //     fileId: "pdf1",
  //     type: "pdf",
  //     parent: "home",
  //     createdAt: "2020-09-18T13:49:18.602Z",
  //     lastModified: "2020-09-18T13:49:18.602Z",
  //     title: "First pdf",
  //     link: "file.pdf",
  //     caption: "this is a pdf caption",
  //     thumbnailImgUrl: "thumbnail.jpg",
  //   },
  //   {
  //     fileId: "document1",
  //     type: "document",
  //     parent: "folder2",
  //     createdAt: "2020-09-18T13:49:18.602Z",
  //     lastModified: "2020-09-18T13:49:18.602Z",
  //     title: "My First Document",
  //     content: [
  //       {
  //         type: "text",
  //         style: "h1",
  //         content: "hello world h1",
  //       },
  //       {
  //         type: "image",
  //         caption: "this is an image",
  //         content: "image.jpg",
  //       },
  //       {
  //         type: "video",
  //         caption: "this is a video",
  //         content: "video.mp4",
  //       },
  //     ],
  //   },
  // ],
  // schedules: [
  //   {
  //     scheduleId: "schedule1",
  //     title: "October 2020 Schedule",
  //     createdAt: "2020-09-18T13:49:18.602Z",
  //     content: "schedule.pdf",
  //     comments: "schedule subject to change",
  //   },
  // ],
  users: [
    {
      userId: "rureqeqr",
      email: "admin@email.com",
      isAdmin: true,
    },
  ],
  folders: [
    {
      folderId: "home",
      parent: "home",
      preferredSort: 0,
      index: 0,
      visits: 0,
      path: [],
      createdAt: "2020-09-18T13:49:18.602Z",
      lastModified: "2020-09-18T13:49:18.602Z",
      title: "Home folder",
      content: "Hello"
    },
    {
      folderId: "folder1",
      parent: "home",
      path: [
        "home"
      ],
      preferredSort: 0,
      index: 0,
      visits: 0,
      createdAt: "2020-09-18T13:49:18.602Z",
      lastModified: "2020-09-18T13:49:18.602Z",
      title: "Folder 1",
      text: "Hello"
    },
    {
      folderId: "folder2",
      parent: "folder1",
      path: [
        "home",
        "folder1"
      ],
      preferredSort: 0,
      index: 0,
      visits: 0,
      createdAt: "2020-09-18T13:49:18.602Z",
      lastModified: "2020-09-18T13:49:18.602Z",
      title: "Folder 2",
      text: "Hello"
    },
  ],
  announcements: [
    {
      announcementId: "announcement1",
      title: "First Announcement",
      createdAt: "2020-09-18T13:49:18.602Z",
      isPinned: false,
      author: "Krystal",
      content: "This is my first announcement!",
    },
  ],
  departments: [
    {
      departmentId: "fdafdafdaf",
      name: "educators"
    },
    {
      departmentId: "managers"
    },
  ],
  contacts: [
    {
      contactId: "490234090rf",
      name: "Krystal S Rodriguez",
      imgUrl: "idk.jog",
      departmentId: "fdafdafdaf",
      phone: "123 456 7890",
      email: "krystal@email.com"
    }
  ]
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
