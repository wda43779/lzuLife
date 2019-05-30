docker run                            \
  --name lzu-mongo                    \
  -d                                  \
  -p 27017:27017                      \
  --restart always                    \
  mongo:4
