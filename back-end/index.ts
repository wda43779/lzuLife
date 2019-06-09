import getApp from "./app";

const init = async () => {
  const port = 3001;
  const app = await getApp();
  app.listen(port, () => {
    console.log(`App listen on ${port}.`);
  });
};

init();
