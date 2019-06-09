import React, { useState, useEffect } from "react";
import Frame from "../components/Frame";
import Container from "react-bootstrap/Container";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";

import Form from "react-bootstrap/Form";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";

import { Link } from "react-router-dom";

import axios from "axios";

const Main: React.FC = props => {
  const [username, $username] = useState("");
  const [password, $password] = useState("");
  const [login, $login] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/v1/me");
        $login(true);
        $username(res.data.user["username"]);
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
      <ButtonGroup style={{ paddingRight: '4px'}}>
        <Button>分享</Button>
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
            <Link to="/post/123">
              <div
                style={{
                  margin: "16px 0",
                  padding: "16px",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.2)"
                }}
              >
                <span>wda43779</span> · <span>2小时前</span> · <span>算法</span>
                <h2>动态规划快速入门</h2>
                <button style={{ background: "unset" }}> 赞 5 </button>
                <button style={{ background: "unset" }}> 评论 5 </button>
              </div>
            </Link>
            <Link to="#">
              <div
                style={{
                  margin: "16px 0",
                  padding: "16px",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.2)"
                }}
              >
                <span>wda43779</span> · <span>2小时前</span> ·{" "}
                <span>JavaScript</span>
                <h2>JavaScript混淆安全加固</h2>
                <button style={{ background: "unset" }}> 赞 5 </button>
                <button style={{ background: "unset" }}> 评论 5 </button>
              </div>
            </Link>
            <Link to="#">
              <div
                style={{
                  margin: "16px 0",
                  padding: "16px",
                  borderBottom: "1px solid rgba(0, 0, 0, 0.2)"
                }}
              >
                <span>wda43779</span> · <span>2小时前</span> ·{" "}
                <span>JavaScript</span>
                <h2>前端大文件上传</h2>
                <button style={{ background: "unset" }}> 赞 5 </button>
                <button style={{ background: "unset" }}> 评论 5 </button>
              </div>
            </Link>
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
