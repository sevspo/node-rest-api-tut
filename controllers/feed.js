const { validationResult } = require("express-validator/check");

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        id: "1",
        title: "First Post",
        content: "This is the first post",
        imageUrl: "images/duck.jpg",
        creator: { name: "Sevi" },
        createdAt: new Date(),
      },
    ],
  });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: "validation failed", errors: errors.array() });
  }
  const title = req.body.title;
  const content = req.body.content;
  console.log("Post created");
  res.status(201).json({
    message: "Post created",
    post: {
      id: new Date().toISOString(),
      title,
      content,
      creator: { name: "Sevi" },
      createdAt: new Date(),
    },
  });
};
