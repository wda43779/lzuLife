import axios from "axios";
import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import Badge from "react-bootstrap/Badge";
import { Link, RouteComponentProps } from "react-router-dom";
import Frame from "../components/Frame";
import UpVote from "../components/UpVote";

const useFirstRender = () => {
  const [first, $first] = useState(true);
  useEffect(() => {
    $first(false);
  }, []);
  return first;
};

const UpVoteLogic: React.FC<{
  post: string;
  upVote?: boolean;
  upVoteCount?: number;
}> = props => {
  const first = useFirstRender();
  const [upVote, $upVote] = useState(props.upVote || false);
  const [upVoteCount, $upVoteCount] = useState(props.upVoteCount || 0);
  useEffect(() => {
    (async () => {
      try {
        if (first) {
          if (props.upVote === undefined && props.upVoteCount === undefined) {
            const res = await axios.get(
              "/api/v1/posts/" + props.post + "/upVote"
            );
            $upVote(res.data.upVote);
            $upVoteCount(res.data.upVoteCount);
          }
        } else {
          let res = await axios.post(
            "/api/v1/posts/" + props.post + "/upVote",
            { upVote: upVote }
          );
          res = await axios.get("/api/v1/posts/" + props.post + "/upVote");
          $upVote(res.data.upVote);
          $upVoteCount(res.data.upVoteCount);
        }
      } catch (err) {
        console.log(err);
      }
    })();
    return () => {};
  }, [upVote]);

  return (
    <UpVote
      upVote={upVote}
      upVoteCount={upVoteCount}
      onClick={() => {
        $upVote(b => !b);
      }}
    />
  );
};

const Main: React.FC<RouteComponentProps> = props => {
  const [username, $username] = useState("");
  const [password, $password] = useState("");
  const [login, $login] = useState(false);
  const [userId, $userId] = useState("");

  const [posts, $posts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/v1/me");
        $login(true);
        $username(res.data.user["username"]);
        $userId(res.data.user["_id"]);
      } catch (err) {
        console.log(err);
      }
    })();
    return () => {};
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/v1/posts");
        $posts(res.data);
      } catch (err) {
        console.log(err);
      }
    })();
    return () => {};
  }, []);

  const loginForm = (
    <Form
      onSubmit={async (e: React.FormEvent) => {
        e.preventDefault();
        try {
          const res = await axios.post("/api/v1/login", {
            username,
            password
          });
        } catch (err) {
          console.log(err);
        }
      }}
    >
      <Form.Group controlId="formBasicEmail">
        <Form.Label>用户名</Form.Label>
        <Form.Control
          type="text"
          placeholder="你的用户名"
          value={username}
          onChange={(e: any) => {
            $username(e.target.value);
          }}
        />
      </Form.Group>

      <Form.Group controlId="formBasicPassword">
        <Form.Label>密码</Form.Label>
        <Form.Control
          type="password"
          placeholder="你的密码"
          value={password}
          onChange={(e: any) => {
            $password(e.target.value);
          }}
        />
      </Form.Group>
      <Button variant="primary" type="submit">
        登录
      </Button>
    </Form>
  );

  const sideBarLogin = (
    <div>
      <div>{"你好， " + username}</div>
      <hr />
      <ButtonGroup style={{ paddingRight: "4px" }}>
        <Button onClick={() => props.history.push("/post")}>分享</Button>
        <Button>设置</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="danger">退出登录</Button>
      </ButtonGroup>
    </div>
  );

  return (
    <Frame>
      <Container style={{ marginTop: "32px" }}>
        <Row>
          <Col xs="12" lg="8">
            <Tabs defaultActiveKey="hn" id="uncontrolled-tab-example">
              <Tab eventKey="hn" title="热门" />
              <Tab eventKey="time" title="时间" />
              <Tab eventKey="bbs" title="最近活动" />
            </Tabs>
            {posts.map((post: any, i) => {
              return (
                <div
                  style={{
                    margin: "16px 0",
                    padding: "16px",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.2)"
                  }}
                >
                  <span>{post.user}</span> · <span>几分钟前</span>
                  <a href={post.url}>
                    <h2>{post.title || post.url}</h2>
                  </a>
                  <UpVoteLogic
                    post={post._id}
                    upVote={post.upVote.includes(userId)}
                    upVoteCount={post.upVote.length}
                  />
                  <Badge
                    variant="info"
                    onClick={() =>
                      props.history.push("/post/" + post._id)
                    }
                    style={{
                      marginLeft: "1em"
                    }}
                  >
                    评论 5
                  </Badge>
                </div>
              );
            })}
          </Col>
          <Col>
            <div
              style={{
                boxShadow: "0 1px 8px rgba(26,26,26,.1)",
                padding: "40px"
              }}
            >
              {login ? sideBarLogin : loginForm}
            </div>
          </Col>
        </Row>
      </Container>
    </Frame>
  );
};

export default Main;
