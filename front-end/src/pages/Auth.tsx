import axios from "axios";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { RouteComponentProps } from "react-router-dom";
import Frame from "../components/Frame";

const Main: React.FC<RouteComponentProps> = props => {
  const [username, $username] = useState("");
  const [password, $password] = useState("");

  return (
    <Frame>
      <Container style={{ marginTop: "32px" }}>
        <Row>
          <Col style={{ margin: "0 auto", maxWidth: "768px" }}>
            <Form
              onSubmit={async (e: React.FormEvent) => {
                e.preventDefault();
                try {
                  await axios.post("/api/v1/users", {
                    username,
                    password
                  });
                  await axios.post("/api/v1/login", {
                    username,
                    password
                  });
                  window.location.replace("/");
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
                注册
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </Frame>
  );
};

export default Main;
