import { ObjectID } from "mongodb";

interface User {
  _id?: ObjectID;

  username: string;
  password: string;
  isAdmin: boolean;
}
interface Post {
  _id?: ObjectID;

  user: ObjectID;
  upVote: ObjectID[];

  title: string;
  url: string;
  content?: string;
}
interface Reply {
  _id?: ObjectID;

  user: ObjectID;
  post: ObjectID;
  refer?: ObjectID;
  upVote: ObjectID[];

  content: string;
}

export { User, Post, Reply };
