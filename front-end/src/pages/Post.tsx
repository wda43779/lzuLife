import Axios from "axios";
import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { RouteComponentProps } from "react-router-dom";
import { Post as PostType, Reply as ReplyType } from '../../../back-end/types';
import Frame from "../components/Frame";
import UserName from "../components/UserName";

const Reply: React.FC<{
  reply: ReplyType;
}> = props => {
  const { reply } = props;
  return (
    <div>
      <UserName>{reply.user as any}</UserName> · <span>2小时前</span>
      <div style={{ margin: "16px 0" }}>{props.reply.content}</div>
      <button style={{ background: "unset" }}>回复</button>
    </div>
  );
};

const Main: React.FC<RouteComponentProps<{ id: string }>> = props => {
  const [post, $post] = useState<Partial<PostType>>({});
  const [replies, $replies] = useState<ReplyType[]>([]);
  const [newRepliesContent, $newRepliesContent] = useState("");

  useEffect(() => {
    (async () => {
      let res = await Axios.get(
        `/api/v1/posts/${props.match.params["id"]}`
      );
      $post(res.data.post)
      res = await Axios.get(
        `/api/v1/posts/${props.match.params["id"]}/replies`
      );
      $replies(res.data.replies);
    })();
  }, []);

  return (
    <Frame>
      <Container style={{ marginTop: "32px" }}>
        <Row>
          <Col>
          <UserName id={post.user as any}/> · <span>2小时前</span>
            <h2>{post.title}</h2>
            <hr />
            <Form>
              <Form.Group>
                <Form.Label>
                  <h3>你的评论</h3>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows="3"
                  value={newRepliesContent}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    $newRepliesContent(e.target.value);
                  }}
                />
              </Form.Group>
              <Button
                variant="primary"
                type="submit"
                onClick={async () => {
                  Axios.post(`/api/v1/replies`, {
                    content: newRepliesContent,
                    post: props.match.params["id"]
                  });
                }}
              >
                提交
              </Button>
            </Form>
            <hr />
            <h3>评论</h3>
            {replies.map((reply, i) => {
              return <Reply key={i} reply={reply} />;
            })}
          </Col>
        </Row>
      </Container>
    </Frame>
  );
};

export default Main;
