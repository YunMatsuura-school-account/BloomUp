const posts = [
  { username: "Vaibhav", title: "Post 1" },
  { username: "God", title: "Post 2" },
];

exports.getPosts = (req, res) => {
  res.json(posts);
};
