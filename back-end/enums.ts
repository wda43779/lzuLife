enum ERROR_CODE {
  AUTH_FAILED = "AUTH_FAILED",
  AUTH_FORBIDDEN = "AUTH_FORBIDDEN",
  AUTH_NOT_LOGIN = "AUTH_NOT_LOGIN",

  USERS_BAD_USERNAME = "USERS_BAD_USERNAME",
  USERS_EXIST = "USERS_EXIST",
  USERS_EASY_PASSWORD = "USERS_EASY_PASSWORD",

  NOT_FOUND = "NOT_FOUND",
  BAD_REQUEST = "BAD_REQUEST"
}

enum POSTS_SORT {
  TIME = "TIME",
  BBS = "BBS",
  HN = "HN"
}

export { ERROR_CODE, POSTS_SORT };
