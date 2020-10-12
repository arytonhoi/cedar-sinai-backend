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
  users: [
    {
      userId: "rureqeqr",
      email: "admin@email.com",
      isAdmin: true,
    },
  ],
  files: [
    {
      fileId: "home",
      type: "folder",
      parent: "home",
      createdAt: "2020-09-18T13:49:18.602Z",
      lastModified: "2020-09-18T13:49:18.602Z",
      title: "Home folder",
    },
    {
      fileId: "folder2",
      type: "folder",
      parent: "home",
      createdAt: "2020-09-18T13:49:18.602Z",
      lastModified: "2020-09-18T13:49:18.602Z",
      title: "Folder 2",
    },
    {
      fileId: "pdf1",
      type: "pdf",
      parent: "home",
      createdAt: "2020-09-18T13:49:18.602Z",
      lastModified: "2020-09-18T13:49:18.602Z",
      title: "First pdf",
      link: "file.pdf",
      caption: "this is a pdf caption",
      thumbnailImgUrl: "thumbnail.jpg",
    },
    {
      fileId: "document1",
      type: "document",
      parent: "folder2",
      createdAt: "2020-09-18T13:49:18.602Z",
      lastModified: "2020-09-18T13:49:18.602Z",
      title: "My First Document",
      content: [
        {
          type: "text",
          style: "h1",
          content: "hello world h1",
        },
        {
          type: "image",
          caption: "this is an image",
          content: "image.jpg",
        },
        {
          type: "video",
          caption: "this is a video",
          content: "video.mp4",
        },
      ],
    },
  ],
  announcements: [
    {
      announcementId: "announcement1",
      title: "First Announcement",
      date: "2020-09-18T13:49:18.602Z",
      isPinned: false,
      author: "Krystal",
      content: "This is my first announcement!",
    },
  ],
  schedules: [
    {
      scheduleId: "schedule1",
      title: "October 2020 Schedule",
      date: "2020-09-18T13:49:18.602Z",
      content: "schedule.pdf",
      comments: "schedule subject to change",
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
