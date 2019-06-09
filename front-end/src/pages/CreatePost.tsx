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
  const [url, $url] = useState("");
  const [title, $title] = useState("");

  return (
    <Frame>
      <Container style={{ marginTop: "32px" }}>
        <Row>
          <Col style={{ margin: "0 auto", maxWidth: "768px" }}>
            <Form
              onSubmit={async (e: React.FormEvent) => {
                e.preventDefault();
                try {
                  await axios.post("/api/v1/posts", {
                    url,
                    title
                  });
                  window.location.replace("/");
                } catch (err) {
                  console.log(err);
                }
              }}
            >
              <Form.Group controlId="title">
                <Form.Label>标题</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="标题"
                  value={title}
                  onChange={(e: any) => {
                    $title(e.target.value);
                  }}
                />
              </Form.Group>

              <Form.Group controlId="url">
                <Form.Label>链接</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="链接"
                  value={url}
                  onChange={(e: any) => {
                    $url(e.target.value);
                  }}
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                提交
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </Frame>
  );
};

export default Main;
